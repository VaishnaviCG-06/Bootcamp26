"""
Memory Store
------------
Manages conversation history and session data for the Research Agent.

This implementation uses:
- In-memory storage (dict) for fast access during runtime
- JSON file persistence so history survives server restarts
- Session-based isolation (each user gets their own history)
"""

import json
import os
from datetime import datetime
from typing import List, Dict

MEMORY_FILE = "memory_store.json"


class MemoryStore:
    def __init__(self):
        self.sessions: Dict[str, List[dict]] = {}
        self._load_from_disk()

    def create_session(self, session_id: str):
        """Initialize a new session."""
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        self._save_to_disk()

    def add_message(self, session_id: str, role: str, content: str):
        """
        Add a message to a session's history.
        role: 'user' or 'assistant'
        """
        if session_id not in self.sessions:
            self.sessions[session_id] = []

        self.sessions[session_id].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
        })

        # Cap at 50 messages per session to prevent unbounded growth
        if len(self.sessions[session_id]) > 50:
            self.sessions[session_id] = self.sessions[session_id][-50:]

        self._save_to_disk()

    def get_history(self, session_id: str) -> List[dict]:
        """Get all messages for a session."""
        return self.sessions.get(session_id, [])

    def clear_session(self, session_id: str):
        """Clear a session's history."""
        if session_id in self.sessions:
            del self.sessions[session_id]
        self._save_to_disk()

    def get_all_sessions(self) -> List[str]:
        """List all active session IDs."""
        return list(self.sessions.keys())

    def _save_to_disk(self):
        """Persist sessions to JSON file."""
        try:
            with open(MEMORY_FILE, "w") as f:
                json.dump(self.sessions, f, indent=2)
        except Exception as e:
            print(f"Warning: Could not save memory to disk: {e}")

    def _load_from_disk(self):
        """Load sessions from JSON file on startup."""
        try:
            if os.path.exists(MEMORY_FILE):
                with open(MEMORY_FILE, "r") as f:
                    self.sessions = json.load(f)
                print(f"Loaded {len(self.sessions)} sessions from memory store.")
        except Exception as e:
            print(f"Warning: Could not load memory from disk: {e}")
            self.sessions = {}
