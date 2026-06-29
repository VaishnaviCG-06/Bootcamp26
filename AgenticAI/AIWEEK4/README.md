# 🔬 ResearchAI — Agentic Research Assistant

A fully agentic AI research assistant that plans, uses multiple tools, maintains memory, and delivers synthesized answers — built with **Groq (free LLM)**, **FastAPI**, and **React**.

---

## 📸 What It Does

Unlike a simple chatbot, ResearchAI is a true **AI agent** that:

1. **Plans** — breaks your query into research steps
2. **Uses tools** — web search, Wikipedia, calculator, summarizer
3. **Reasons** — decides which tools to use and why
4. **Synthesizes** — combines all results into a final answer
5. **Remembers** — maintains memory across your session

---

## 🧠 Agent Workflow

```
User Query
    ↓
[Planning] — LLM creates a step-by-step research plan
    ↓
[Tool Selection] — LLM picks the right tools for each step
    ↓
[Tool Execution] — Tools run: web search / Wikipedia / calculator / summarizer
    ↓
[Synthesis] — LLM combines all findings into a coherent answer
    ↓
[Memory Save] — Conversation saved for future context
    ↓
Final Response (with workflow transparency)
```

---

## 🛠 Tools Used

| Tool | API | Purpose |
|------|-----|---------|
| **Web Search** | DuckDuckGo (free, no key) | Current information from the web |
| **Wikipedia** | Wikipedia REST API (free) | Detailed encyclopedia knowledge |
| **Calculator** | Local evaluator (no API) | Math & expression evaluation |
| **Summarizer** | Groq LLM (free tier) | Condensing long results |

---

## 💾 Memory Implementation

- **Session-based**: Each user gets a unique session ID stored in localStorage
- **In-memory + persistent**: Conversations stored in RAM and saved to `memory_store.json`
- **Context window**: Last 3 exchanges injected into every LLM prompt
- **Cross-restart persistence**: Memory survives server restarts via JSON file

---

## 🚀 Setup Guide

### Prerequisites
- **Python 3.9+** — [Download](https://python.org)
- **Node.js 18+** — [Download](https://nodejs.org)
- **Groq API Key (FREE)** — [Get it here](https://console.groq.com)

### Step 1: Get Your Free Groq API Key
1. Go to https://console.groq.com
2. Sign up (free, no credit card)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

### Step 2: Clone/Download the Project
```bash
# If using git:
git clone <your-repo-url>
cd research-agent

# Or just unzip the folder and cd into it
```

### Step 3: Set the API Key

**Mac/Linux:**
```bash
export GROQ_API_KEY=gsk_your_key_here
```

**Windows (Command Prompt):**
```cmd
set GROQ_API_KEY=gsk_your_key_here
```

**Windows (PowerShell):**
```powershell
$env:GROQ_API_KEY="gsk_your_key_here"
```

### Step 4: Install Dependencies

**Mac/Linux:**
```bash
chmod +x setup.sh start.sh
./setup.sh
```

**Windows:**
```cmd
cd backend
pip install -r requirements.txt
cd ..\frontend
npm install
cd ..
```

### Step 5: Start the App

**Mac/Linux:**
```bash
./start.sh
```

**Windows:**
```cmd
start.bat
```

Or manually in two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 6: Open the App
Visit **http://localhost:5173** in your browser 🎉

---

## 📁 Project Structure

```
research-agent/
├── backend/
│   ├── main.py        # FastAPI server & API routes
│   ├── agent.py       # Core agent logic (planning + tool orchestration)
│   ├── tools.py       # All 4 tools (web search, Wikipedia, calculator, summarizer)
│   ├── memory.py      # Session memory with JSON persistence
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root component & state management
│   │   ├── components/
│   │   │   ├── Sidebar.jsx   # Session info, capabilities, examples
│   │   │   ├── ChatPanel.jsx # Main chat interface
│   │   │   └── WorkflowPanel.jsx # Agent workflow visualization
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── setup.sh     # One-time setup (Mac/Linux)
├── start.sh     # Start both servers (Mac/Linux)
├── start.bat    # Start both servers (Windows)
└── README.md
```

---

## 🆓 All Free — No Credit Card

| Service | Free Tier |
|---------|-----------|
| Groq | 14,400 req/day, fast inference |
| DuckDuckGo | Unlimited (no key needed) |
| Wikipedia | Unlimited (no key needed) |
| Calculator | Local — always free |

---

## 🎯 Example Queries

- "What is quantum entanglement and how does it work?"
- "Compare electric vehicles vs hydrogen cars"
- "Calculate compound interest: $5000 at 7% for 10 years"
- "What caused the 2008 financial crisis?"
- "Explain how vaccines work"
- "What is the population of Tokyo vs Mumbai?"

---

## ✨ Bonus Features Implemented

- ✅ Workflow visualization panel (see every tool call)
- ✅ Session memory with JSON persistence
- ✅ Multi-step agent reasoning with planning
- ✅ 4 distinct tools integrated
- ✅ Polished dark-mode UI
- ✅ Example queries for quick start
- ✅ Key findings extraction per response
