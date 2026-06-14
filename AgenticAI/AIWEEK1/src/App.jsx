import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ── Tool definitions ────────────────────────────────────────────────────────
const TOOLS = [
  {
    id: "explain",
    label: "Explain a Concept",
    icon: "📘",
    placeholder: "e.g. What is love?",
    systemPrompt:
      "You are a brilliant teacher. Explain the concept the user provides in a clear, engaging way with a real-world analogy and a simple example. Use markdown headers, bold, and bullet points for structure.",
    buttonText: "generate",
  },
  {
    id: "eli5",
    label: "Explain to toddler",
    icon: "🧸",
    placeholder: "e.g.what are numbers",
    systemPrompt:
      "You are explaining something to a 5-year-old child. Use very simple words, fun comparisons, and short sentences. No jargon at all. Make it delightful and relatable.",
    buttonText: "generate",
  },
  {
    id: "summarize",
    label: "Summarize ",
    icon: "📝",
    placeholder: "Paste  text here...",
    systemPrompt:
      "You are a concise summarizer. Read the text and give: 1) A **TL;DR** one-liner, 2) Key points as bullet items, 3) One takeaway sentence. Use markdown.",
    buttonText: "generate",
  },
  {
    id: "quiz",
    label: "Generate Quiz",
    icon: "🎯",
    placeholder: "e.g. ask anything  or paste study material...",
    systemPrompt:
      "You are a quiz master. Generate 5 multiple-choice questions on the topic. For each: the question, options A–D, and mark the correct answer with ✅. Use markdown.",
    buttonText: "generate",
  },
  {
    id: "professional",
    label: "Professional writer",
    icon: " ✍️",
    placeholder: "e.g. write professinally",
    systemPrompt:
      "You are a professional writing assistant. Rewrite the user's text in a polished, professional tone for a workplace setting. Show the rewritten version clearly with a heading.",
    buttonText: "generate",
  },
  {
    id: "flashcards",
    label: "Flashcards",
    icon: "📚",
    placeholder: "e.g.  paste notes...",
    systemPrompt:
      "You are a study assistant. Generate 6 flashcards from the topic. Format each as:\n**Q:** [question]\n**A:** [answer]\n\n---\n\nKeep answers concise and memorable.",
    buttonText: "genearte",
  },
];

// ── Loading skeleton dots ────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="typing-indicator">
      <div className="typing-bubble">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>
      <span className="typing-label">i am  thinking…</span>
    </div>
  );
}

// ── Single chat message ──────────────────────────────────────────────────────
function ChatMessage({ msg }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`chat-message ${msg.role}`}>
      <div className="msg-avatar">
        {msg.role === "user" ? "🧑" : msg.toolIcon}
      </div>
      <div className="msg-body">
        <div className="msg-meta">
          <span className="msg-sender">
            {msg.role === "user" ? "You" : msg.toolLabel}
          </span>
          <span className="msg-time">{msg.time}</span>
        </div>
        {msg.role === "assistant" ? (
          <div className="msg-content markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {msg.content}
            </ReactMarkdown>
            <button className="copy-btn" onClick={handleCopy} title="Copy response">
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        ) : (
          <div className="msg-content user-text">{msg.content}</div>
        )}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]); // { id, role, content, toolLabel, toolIcon, time }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleToolSelect = (tool) => {
    setActiveTool(tool);
    setError("");
    textareaRef.current?.focus();
  };

  const handleClearHistory = () => {
    if (window.confirm("Clear all chat history?")) setHistory([]);
  };

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError("Please enter some text before submitting.");
      return;
    }
    setError("");

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      toolLabel: activeTool.label,
      toolIcon: activeTool.icon,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setHistory((h) => [...h, userMsg]);
    setInput("");
    setLoading(true);

    try {
     const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
if (!apiKey)
  throw new Error("API key not found. Add VITE_GEMINI_API_KEY to your .env file.");

      // Build conversation messages for context (last 10 exchanges of this tool)
      const toolHistory = history
        .filter((m) => m.toolLabel === activeTool.label)
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));
      toolHistory.push({ role: "user", content: userMsg.content });

const prompt = `${activeTool.systemPrompt}\n\nUser request:\n${userMsg.content}`;

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  }
);

const data = await res.json();

if (data.error) {
  throw new Error(data.error.message);
}

const text =
  data.candidates?.[0]?.content?.parts?.[0]?.text ||
  "No response generated.";

      const assistantMsg = {
        id: Date.now() + 1,
        role: "assistant",
        content: text,
        toolLabel: activeTool.label,
        toolIcon: activeTool.icon,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setHistory((h) => [...h, assistantMsg]);
    } catch (err) {
      setError("Something went wrong: " + err.message);
      // Remove the user message if the API call failed
      setHistory((h) => h.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  const toolHistory = history.filter((m) => m.toolLabel === activeTool.label);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-mark">🌐</span>
            <span className="logo-text">SmartAssist AI</span>
          </div>
          <p className="tagline">Study smarter, write better, learn faster.</p>
          {history.length > 0 && (
            <button className="clear-btn" onClick={handleClearHistory} title="Clear  history">
              🗑 Clear History
            </button>
          )}
        </div>
      </header>

      <div className="layout">
        {/* ── Left Rail: Tool Selector ── */}
        <aside className="tools-rail">
          <p className="rail-label">CHOOSE A TOOL</p>
          <div className="tools-grid">
            {TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleToolSelect(tool)}
                className={`tool-card ${activeTool.id === tool.id ? "active" : ""}`}
              >
                <span className="tool-icon">{tool.icon}</span>
                <span className="tool-label">{tool.label}</span>
                {history.filter((m) => m.toolLabel === tool.label).length > 0 && (
                  <span className="tool-badge">
                    {Math.floor(history.filter((m) => m.toolLabel === tool.label).length / 2)}
                  </span>
                )}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Right: Chat Workspace ── */}
        <main className="workspace">
          {/* Tool header */}
          <div className="chat-header">
            <span className="chat-icon">{activeTool.icon}</span>
            <div>
              <h2 className="chat-title">{activeTool.label}</h2>
              <p className="chat-subtitle">
                {toolHistory.length === 0
                  ? "Start a conversation below"
                  : `${Math.floor(toolHistory.length / 2)} exchange${Math.floor(toolHistory.length / 2) !== 1 ? "s" : ""} in this session`}
              </p>
            </div>
          </div>

          {/* Chat messages area */}
          <div className="chat-window">
            {toolHistory.length === 0 && !loading && (
              <div className="empty-state">
                <div className="empty-icon">{activeTool.icon}</div>
                <p className="empty-title">Ready to help</p>
                <p className="empty-hint">{activeTool.placeholder}</p>
              </div>
            )}

            {toolHistory.map((msg) => (
              <ChatMessage key={msg.id} msg={msg} />
            ))}

            {loading && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-banner">
              <span>⚠️</span> {error}
              <button className="error-close" onClick={() => setError("")}>✕</button>
            </div>
          )}

          {/* Input area */}
          <div className="input-dock">
            <div className={`input-area ${loading ? "disabled" : ""}`}>
              <textarea
                ref={textareaRef}
                className="text-input"
                placeholder={activeTool.placeholder}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError("");
                }}
                onKeyDown={handleKeyDown}
                rows={3}
                disabled={loading}
              />
              <div className="input-footer">
                <span className="hint">Ctrl ⌘ + Enter to send</span>
                <span className="char-count">{input.length} chars</span>
              </div>
            </div>
            <button
              className={`submit-btn ${loading ? "loading" : ""}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Thinking…</>
              ) : (
                <>{activeTool.icon} {activeTool.buttonText}</>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
<footer className="footer">
  Built using React, Vite and Gemini API.
 Developed as part of an AI learning project.
</footer>
}
