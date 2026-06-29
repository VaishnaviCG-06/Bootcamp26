"""
Tools available to the Research Agent
--------------------------------------
1. WebSearchTool   - DuckDuckGo search (100% free, no API key)
2. WikipediaTool   - Wikipedia API (free)
3. CalculatorTool  - Safe math evaluator (local, free)
4. SummarizerTool  - LLM-powered summarizer using Groq
"""

import re
import math
import requests
from typing import Optional


class WebSearchTool:
    """
    Search the web using DuckDuckGo's instant answer API.
    Completely free, no API key required.
    Falls back to scraping DDG HTML results for more coverage.
    """
    name = "web_search"
    description = "Search the internet for current information"

    def run(self, query: str) -> str:
        try:
            # DuckDuckGo Instant Answer API (free, no key)
            url = "https://api.duckduckgo.com/"
            params = {
                "q": query,
                "format": "json",
                "no_html": 1,
                "skip_disambig": 1,
                "no_redirect": 1,
            }
            resp = requests.get(url, params=params, timeout=10)
            data = resp.json()

            results = []

            # Abstract (main answer)
            if data.get("AbstractText"):
                results.append(f"Summary: {data['AbstractText']}")
                results.append(f"Source: {data.get('AbstractSource', 'DuckDuckGo')}")

            # Answer (instant answer)
            if data.get("Answer"):
                results.append(f"Direct Answer: {data['Answer']}")

            # Related topics
            topics = data.get("RelatedTopics", [])
            for topic in topics[:3]:
                if isinstance(topic, dict) and topic.get("Text"):
                    results.append(f"• {topic['Text']}")

            # Infobox
            infobox = data.get("Infobox", {})
            if infobox and infobox.get("content"):
                for item in infobox["content"][:3]:
                    if item.get("label") and item.get("value"):
                        results.append(f"{item['label']}: {item['value']}")

            if results:
                return "\n".join(results)
            else:
                return f"Web search for '{query}' returned no instant results. Try Wikipedia for more detailed info."

        except requests.exceptions.Timeout:
            return f"Web search timed out for query: {query}"
        except Exception as e:
            return f"Web search error: {str(e)}"


class WikipediaTool:
    """
    Fetch information from Wikipedia using their free API.
    No key required. Returns page summary + key sections.
    """
    name = "wikipedia"
    description = "Get detailed information from Wikipedia"

    def run(self, topic: str) -> str:
        try:
            # Wikipedia REST API (completely free)
            base_url = "https://en.wikipedia.org/api/rest_v1/page/summary/"
            encoded_topic = requests.utils.quote(topic.replace(" ", "_"))
            url = f"{base_url}{encoded_topic}"

            resp = requests.get(url, timeout=10, headers={"User-Agent": "ResearchAgent/1.0"})

            if resp.status_code == 404:
                # Try search API
                return self._search_and_fetch(topic)

            data = resp.json()

            result_parts = []
            title = data.get("title", topic)
            extract = data.get("extract", "")
            page_url = data.get("content_urls", {}).get("desktop", {}).get("page", "")

            result_parts.append(f"Wikipedia: {title}")
            result_parts.append(extract[:1500] if extract else "No extract available.")
            if page_url:
                result_parts.append(f"Read more: {page_url}")

            return "\n\n".join(result_parts)

        except Exception as e:
            return f"Wikipedia lookup error for '{topic}': {str(e)}"

    def _search_and_fetch(self, query: str) -> str:
        """Search Wikipedia when direct lookup fails."""
        try:
            search_url = "https://en.wikipedia.org/w/api.php"
            params = {
                "action": "query",
                "list": "search",
                "srsearch": query,
                "format": "json",
                "srlimit": 1,
            }
            resp = requests.get(search_url, params=params, timeout=10)
            data = resp.json()
            results = data.get("query", {}).get("search", [])

            if results:
                title = results[0]["title"]
                return self.run(title)
            return f"No Wikipedia article found for: {query}"
        except Exception as e:
            return f"Wikipedia search error: {str(e)}"


class CalculatorTool:
    """
    Safe mathematical expression evaluator.
    Supports: basic arithmetic, powers, sqrt, percentages, and more.
    Completely local — no API needed.
    """
    name = "calculator"
    description = "Evaluate mathematical expressions safely"

    SAFE_NAMES = {
        "abs": abs, "round": round, "min": min, "max": max,
        "sum": sum, "pow": pow, "sqrt": math.sqrt, "log": math.log,
        "log10": math.log10, "sin": math.sin, "cos": math.cos,
        "tan": math.tan, "pi": math.pi, "e": math.e, "floor": math.floor,
        "ceil": math.ceil,
    }

    def run(self, expression: str) -> str:
        try:
            # Clean up the expression
            expr = expression.strip()
            expr = expr.replace("^", "**")  # Support ^ for power
            expr = re.sub(r'(\d+)%', r'(\1/100)', expr)  # Handle percentages

            # Block dangerous operations
            forbidden = ["import", "exec", "eval", "open", "__", "os", "sys"]
            for f in forbidden:
                if f in expr.lower():
                    return f"Error: Operation '{f}' not allowed."

            result = eval(expr, {"__builtins__": {}}, self.SAFE_NAMES)

            # Format nicely
            if isinstance(result, float):
                if result == int(result):
                    return f"{expression} = {int(result)}"
                return f"{expression} = {result:.6f}".rstrip("0").rstrip(".")
            return f"{expression} = {result}"

        except ZeroDivisionError:
            return "Error: Division by zero"
        except Exception as e:
            return f"Calculator error for '{expression}': {str(e)}"


class SummarizerTool:
    """
    Uses Groq LLM to summarize long text.
    Useful when other tools return very long results.
    """
    name = "summarize"
    description = "Summarize a long piece of text into key points"

    def __init__(self, client, model: str):
        self.client = client
        self.model = model

    def run(self, text: str) -> str:
        if len(text) < 300:
            return text  # No need to summarize short text

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "user",
                        "content": f"Summarize the following text in 3-5 key bullet points:\n\n{text[:3000]}"
                    }
                ],
                max_tokens=500,
                temperature=0.3,
            )
            return response.choices[0].message.content
        except Exception as e:
            # Fallback: return first 500 chars
            return text[:500] + "... [truncated]"
