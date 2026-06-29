"""
Research Agent - Backend
FastAPI server that powers the agentic AI research assistant.
Uses Groq (free LLM), DuckDuckGo (free web search), Wikipedia (free).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

from agent import ResearchAgent
from memory import MemoryStore

app = FastAPI(title="Research Agent API", version="1.0.0")

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory store for sessions
memory_store = MemoryStore()
agents: dict[str, ResearchAgent] = {}


class ChatRequest(BaseModel):
    session_id: str
    message: str


class NewSessionRequest(BaseModel):
    session_id: Optional[str] = None


@app.post("/session/new")
def new_session(req: NewSessionRequest):
    """Create a new research session."""
    import uuid
    session_id = req.session_id or str(uuid.uuid4())
    memory_store.create_session(session_id)
    agents[session_id] = ResearchAgent(session_id, memory_store)
    return {"session_id": session_id, "message": "Session created successfully"}


@app.post("/chat")
def chat(req: ChatRequest):
    """Send a message to the agent and get a response."""
    if req.session_id not in agents:
        # Auto-create session if missing
        memory_store.create_session(req.session_id)
        agents[req.session_id] = ResearchAgent(req.session_id, memory_store)

    agent = agents[req.session_id]
    result = agent.run(req.message)
    return result


@app.get("/history/{session_id}")
def get_history(session_id: str):
    """Get conversation history for a session."""
    history = memory_store.get_history(session_id)
    return {"session_id": session_id, "history": history}


@app.delete("/session/{session_id}")
def clear_session(session_id: str):
    """Clear a session's memory and history."""
    memory_store.clear_session(session_id)
    if session_id in agents:
        del agents[session_id]
    return {"message": "Session cleared"}


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
