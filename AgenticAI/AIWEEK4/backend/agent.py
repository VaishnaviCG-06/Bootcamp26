"""
Research Agent Core
-------------------
This is the heart of the application.
The agent:
  1. Plans what steps are needed to answer a query
  2. Decides which tools to use (web search, Wikipedia, calculator, summarizer)
  3. Executes tools step by step
  4. Synthesizes a final answer
  5. Stores everything in memory for future context
"""

import json
import re
from groq import Groq
from tools import WebSearchTool, WikipediaTool, CalculatorTool, SummarizerTool
from memory import MemoryStore
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# System prompt that makes the LLM behave like a planning agent
SYSTEM_PROMPT = """You are ResearchAI, an advanced research assistant agent.

You have access to the following tools:
1. web_search(query: str) - Search the web using DuckDuckGo for current information
2. wikipedia(topic: str) - Get detailed information from Wikipedia about a topic
3. calculator(expression: str) - Evaluate mathematical expressions
4. summarize(text: str) - Summarize a long piece of text

AGENT WORKFLOW:
- When given a query, FIRST output a step-by-step PLAN in JSON format
- Then execute the plan tool by tool
- Finally synthesize all findings into a comprehensive answer

Always respond in this exact JSON format:
{
  "plan": ["step 1", "step 2", ...],
  "tool_calls": [
    {"tool": "tool_name", "input": "input_value", "reason": "why this tool"},
    ...
  ],
  "final_answer": "Your comprehensive answer here",
  "key_findings": ["finding 1", "finding 2", ...]
}

Rules:
- Always use at least 2 different tools per query
- Your plan must have 2-5 steps
- Be thorough but concise in final_answer
- key_findings should be 2-4 bullet points
- Use web_search for current events, Wikipedia for established facts
- Use calculator when numbers/math are involved
"""


class ResearchAgent:
    def __init__(self, session_id: str, memory_store: MemoryStore):
        self.session_id = session_id
        self.memory_store = memory_store
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "llama-3.3-70b-versatile"  # Free on Groq

        # Initialize tools
        self.tools = {
            "web_search": WebSearchTool(),
            "wikipedia": WikipediaTool(),
            "calculator": CalculatorTool(),
            "summarize": SummarizerTool(self.client, self.model),
        }

    def run(self, user_message: str) -> dict:
        """
        Main agent loop:
        1. Build context from memory
        2. Ask LLM to plan + select tools
        3. Execute tools
        4. Return structured result
        """
        # Step 1: Get conversation history for context
        history = self.memory_store.get_history(self.session_id)
        context = self._build_context(history)

        # Step 2: Ask LLM to plan
        prompt = f"""Previous conversation context:
{context}

Current user query: {user_message}

Research this thoroughly using your tools. Return valid JSON only."""

        raw_response = self._call_llm(prompt)

        # Step 3: Parse the LLM's plan
        parsed = self._parse_response(raw_response)

        # Step 4: Execute tools the LLM selected
        tool_results = []
        for tool_call in parsed.get("tool_calls", []):
            tool_name = tool_call.get("tool")
            tool_input = tool_call.get("input", "")
            reason = tool_call.get("reason", "")

            if tool_name in self.tools:
                result = self.tools[tool_name].run(tool_input)
                tool_results.append({
                    "tool": tool_name,
                    "input": tool_input,
                    "reason": reason,
                    "output": result,
                })

        # Step 5: If tool results exist, do a final synthesis pass
        if tool_results:
            final_answer = self._synthesize(user_message, tool_results, parsed.get("final_answer", ""))
        else:
            final_answer = parsed.get("final_answer", raw_response)

        # Step 6: Save to memory
        self.memory_store.add_message(self.session_id, "user", user_message)
        self.memory_store.add_message(self.session_id, "assistant", final_answer)

        return {
            "plan": parsed.get("plan", []),
            "tool_calls": tool_results,
            "final_answer": final_answer,
            "key_findings": parsed.get("key_findings", []),
            "raw_llm_plan": parsed,
        }

    def _call_llm(self, prompt: str) -> str:
        """Call Groq LLM."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=2000,
            )
            return response.choices[0].message.content
        except Exception as e:
            return json.dumps({
                "plan": ["Handle error"],
                "tool_calls": [],
                "final_answer": f"I encountered an error: {str(e)}. Please check your GROQ_API_KEY.",
                "key_findings": [],
            })

    def _parse_response(self, raw: str) -> dict:
        """Extract JSON from LLM response."""
        try:
            # Try direct parse
            return json.loads(raw)
        except json.JSONDecodeError:
            # Try to find JSON block in the response
            match = re.search(r'\{.*\}', raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    pass
            # Fallback
            return {
                "plan": ["Direct response"],
                "tool_calls": [],
                "final_answer": raw,
                "key_findings": [],
            }

    def _synthesize(self, query: str, tool_results: list, draft_answer: str) -> str:
        """Use LLM to synthesize tool outputs into a final answer."""
        tools_text = "\n\n".join([
            f"[{r['tool'].upper()}] Query: {r['input']}\nResult: {r['output'][:1000]}"
            for r in tool_results
        ])

        synthesis_prompt = f"""Based on these research findings, write a comprehensive answer to: "{query}"

RESEARCH FINDINGS:
{tools_text}

DRAFT ANSWER: {draft_answer}

Write a clear, well-structured final answer. Use the findings to support your response."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "user", "content": synthesis_prompt}
                ],
                temperature=0.5,
                max_tokens=1500,
            )
            return response.choices[0].message.content
        except:
            return draft_answer

    def _build_context(self, history: list) -> str:
        """Format conversation history as context string."""
        if not history:
            return "No previous conversation."
        lines = []
        for msg in history[-6:]:  # Last 3 exchanges
            role = msg["role"].capitalize()
            content = msg["content"][:300]  # Truncate for context window
            lines.append(f"{role}: {content}")
        return "\n".join(lines)
