import { useState, useRef, useEffect } from "react";

const MODES = [
  {
    id: "eli5",
    label: "Simple explainer",
    icon: "🧒",
    color: "#7F77DD",
    bg: "#EEEDFE",
    description: "Breaks down complex topics into simple, child-friendly language",
    systemPrompt: `You are a patient, friendly teacher explaining things to a 5-year-old child. 
Use very simple words, fun analogies, and short sentences. Avoid jargon completely. 
Use relatable examples from everyday life like toys, food, and animals. 
Be warm, encouraging, and enthusiastic. Keep your explanation under 150 words.`,
  },
  {
    id: "professional",
    label: "Career Polisher",
    icon: "💼",
    color: "#185FA5",
    bg: "#E6F1FB",
    description: "Transforms casual text into polished, professional writing",
    systemPrompt: `You are a professional business writing coach. 
Rewrite the given text to sound polished, confident, and professional. 
Improve clarity, tone, grammar, and structure. Remove filler words and informal language. 
Keep the original meaning but elevate the vocabulary and sentence construction. 
Provide only the rewritten version without explanation.`,
  },
  {
    id: "summarize",
    label: "Quick Notes",
    icon: "📝",
    color: "#0F6E56",
    bg: "#E1F5EE",
    description: "Condenses long text into clear, concise key points",
    systemPrompt: `You are an expert at extracting and condensing information. 
Summarize the given text into 3-5 clear bullet points. 
Each bullet should capture a key idea. Be concise but comprehensive. 
Start each bullet with a bold keyword. Format: • **Key idea**: explanation`,
  },
  {
    id: "quiz",
    label: "Practice Quiz",
    icon: "🧪",
    color: "#D85A30",
    bg: "#FAECE7",
    description: "Creates multiple-choice quiz questions from any content",
    systemPrompt: `You are an educational quiz creator. 
Generate 3 multiple-choice quiz questions based on the given topic or text. 
Each question should have 4 options (A, B, C, D) with one correct answer. 
Format each question clearly with the correct answer marked at the end. 
Make questions that test understanding, not just memorization.
Format:
Q1. [Question]
A) [Option]
B) [Option]  
C) [Option]
D) [Option]
✓ Answer: [Letter] - [Brief explanation]`,
  },
  {
    id: "mentor",
    label: "Mentor",
    icon: "🎯",
    color: "#BA7517",
    bg: "#FAEEDA",
    description: "Gives actionable advice and guidance like a wise mentor",
    systemPrompt: `You are a wise, experienced mentor who genuinely cares about helping people grow. 
Respond with empathy, clarity, and actionable guidance. 
Give practical steps they can take immediately. 
Be honest but encouraging. Ask a thoughtful follow-up question at the end to deepen reflection. 
Keep your response structured: 1) Acknowledge their situation 2) Key insight 3) Practical steps 4) Question to ponder.`,
  },
{
  id: "study",
  label: "Study Planner",
  icon: "📚",
  color: "#0F766E",
  bg: "#ECFDF5",
  description:
    "Creates structured study schedules",

  systemPrompt: `
Create a realistic study plan based on the user's goal.

Include:
- Daily tasks
- Estimated time needed
- Revision schedule
- Tips to stay consistent

Keep it practical.
`
},
  {
    id: "interview",
    label: "Mock Interview",
    icon: "🎤",
    color: "#993556",
    bg: "#FBEAF0",
    description: "Generates interview questions and tips for any role or topic",
    systemPrompt: `You are an experienced hiring manager and career coach. 
Generate 5 strong interview questions for the given job role or topic. 
Include a mix of behavioral (STAR method), technical, and situational questions. 
After each question, add a brief tip on how to answer it well.
Format:
Q1. [Question]
💡 Tip: [How to approach this question]`,
  },
];

const TypingDots = () => (
  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "2px 0" }}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--color-text-secondary)",
          display: "inline-block",
          animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`,
        }}
      />
    ))}
    <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }`}</style>
  </span>
);

const MarkdownLine = ({ text }) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

const SimpleMarkdown = ({ text }) => {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{ lineHeight: 1.75, fontSize: 15 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: "0.5rem" }} />;
        const isBullet = /^[•\-\*]\s/.test(line.trim()) || /^✓/.test(line.trim());
        const isNumbered = /^\d+[\.\)]/.test(line.trim());
        const isQ = /^Q\d+\./.test(line.trim());
        const isTip = /^💡/.test(line.trim());
        if (isQ)
          return (
            <p key={i} style={{ fontWeight: 500, marginTop: "1.2rem", marginBottom: "0.3rem" }}>
              <MarkdownLine text={line} />
            </p>
          );
        if (isTip)
          return (
            <p key={i} style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: "1rem", paddingLeft: 8, borderLeft: "2px solid var(--color-border-secondary)" }}>
              <MarkdownLine text={line} />
            </p>
          );
        if (isBullet)
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: "0.4rem" }}>
              <span style={{ color: "var(--color-text-secondary)", flexShrink: 0 }}>•</span>
              <span><MarkdownLine text={line.replace(/^[•\-\*✓]\s/, "")} /></span>
            </div>
          );
        if (isNumbered)
          return (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: "0.4rem" }}>
              <span style={{ color: "var(--color-text-secondary)", flexShrink: 0, minWidth: 20 }}>{line.match(/^\d+/)[0]}.</span>
              <span><MarkdownLine text={line.replace(/^\d+[\.\)]\s*/, "")} /></span>
            </div>
          );
        return (
          <p key={i} style={{ marginBottom: "0.4rem" }}>
            <MarkdownLine text={line} />
          </p>
        );
      })}
    </div>
  );
};

export default function PromptStudio() {
  const [selectedMode, setSelectedMode] = useState(MODES[0]);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const outputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    setCharCount(input.length);
  }, [input]);

  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [output]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError("Please enter some text before submitting.");
      textareaRef.current?.focus();
      return;
    }
    setError("");
    setOutput("");
    setLoading(true);

    try {
     const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

const prompt = `
${selectedMode.systemPrompt}

User Input:
${trimmed}
`;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  }
);

const data = await response.json();

if (data.error) {
  throw new Error(data.error.message);
}

const text =
  data.candidates?.[0]?.content?.parts?.[0]?.text ||
  "No response generated."; 
      setOutput(text);
      setHistory((prev) => [
        { id: Date.now(), mode: selectedMode.label, modeIcon: selectedMode.icon, input: trimmed, output: text, ts: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9),
      ]);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleSubmit();
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
    textareaRef.current?.focus();
  };

  const handleCopy = () => {
    if (output) navigator.clipboard.writeText(output);
  };

  const loadHistory = (item) => {
    const mode = MODES.find((m) => m.label === item.mode);
    if (mode) setSelectedMode(mode);
    setInput(item.input);
    setOutput(item.output);
    setShowHistory(false);
  };

  return (
    <div style={{ fontFamily: "var(--font-sans)", maxWidth: 720, margin: "0 auto", padding: "1.5rem 1rem 3rem" }}>
      <h2 className="sr-only">Prompt Studio</h2>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0, color: "var(--color-text-primary)" }}>Prompt Studio</h1>
          <p style={{ fontSize: 14, color: "var(--color-text-secondary)", margin: "4px 0 0" }}>Choose a learning tool and let AI guide your next step.</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => setShowHistory((v) => !v)}
            style={{ fontSize: 13, padding: "6px 14px", borderRadius: "var(--border-radius-md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
          >
            <i className="ti ti-history" style={{ fontSize: 15 }} aria-hidden="true" />
            History ({history.length})
          </button>
        )}
      </div>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "1rem", marginBottom: "1.25rem" }}>
          <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 0.75rem", color: "var(--color-text-secondary)" }}>Recent sessions</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => loadHistory(item)}
                style={{ textAlign: "left", padding: "8px 12px", borderRadius: "var(--border-radius-md)", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}
              >
                <span style={{ fontSize: 16 }}>{item.modeIcon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.input.slice(0, 60)}{item.input.length > 60 ? "…" : ""}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--color-text-secondary)" }}>{item.mode} · {item.ts}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mode selector */}
      <div style={{ marginBottom: "1.25rem" }}>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: "0.5rem", marginTop: 0 }}>Select a mode</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8 }}>
          {MODES.map((mode) => {
            const active = selectedMode.id === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => { setSelectedMode(mode); setOutput(""); setError(""); }}
                style={{
                  padding: "10px 12px",
                  borderRadius: "var(--border-radius-md)",
                  border: active ? `2px solid ${mode.color}` : "0.5px solid var(--color-border-tertiary)",
                  background: active ? mode.bg : "var(--color-background-primary)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "border 0.15s, background 0.15s",
                }}
              >
                <div style={{ fontSize: 18, marginBottom: 4 }}>{mode.icon}</div>
                <div style={{ fontSize: 13, fontWeight: active ? 500 : 400, color: active ? mode.color : "var(--color-text-primary)" }}>{mode.label}</div>
                <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2, lineHeight: 1.4 }}>{mode.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
          <label htmlFor="main-input" style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
            Your input
          </label>
          <span style={{ fontSize: 12, color: charCount > 2000 ? "var(--color-text-danger)" : "var(--color-text-secondary)" }}>{charCount}/2000</span>
        </div>
        <textarea
          id="main-input"
          ref={textareaRef}
          value={input}
          onChange={(e) => { setInput(e.target.value.slice(0, 2000)); setError(""); }}
          onKeyDown={handleKeyDown}
          placeholder={`Enter text for "${selectedMode.label}"…`}
          rows={5}
          style={{
            width: "100%",
            resize: "vertical",
            padding: "10px 12px",
            borderRadius: "var(--border-radius-md)",
            border: error ? "1px solid var(--color-border-danger)" : "0.5px solid var(--color-border-secondary)",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            fontSize: 15,
            lineHeight: 1.6,
            boxSizing: "border-box",
            fontFamily: "var(--font-sans)",
          }}
        />
        {error && (
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-danger)", display: "flex", alignItems: "center", gap: 4 }}>
            <i className="ti ti-alert-circle" style={{ fontSize: 14 }} aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: "1.5rem" }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            padding: "9px 20px",
            borderRadius: "var(--border-radius-md)",
            border: `1.5px solid ${selectedMode.color}`,
            background: selectedMode.color,
            color: "#fff",
            fontWeight: 500,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {loading ? (
            <><i className="ti ti-loader-2" style={{ fontSize: 15, animation: "spin 1s linear infinite" }} aria-hidden="true" />Generating…</>
          ) : (
            <><i className="ti ti-sparkles" style={{ fontSize: 15 }} aria-hidden="true" />Generate</>
          )}
        </button>
        <button onClick={handleClear} style={{ padding: "9px 16px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-secondary)" }}>
          <i className="ti ti-eraser" style={{ fontSize: 15 }} aria-hidden="true" />Clear
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Output */}
      {(loading || output) && (
        <div
          ref={outputRef}
          style={{
            background: "var(--color-background-primary)",
            border: `0.5px solid var(--color-border-tertiary)`,
            borderLeft: `3px solid ${selectedMode.color}`,
            borderRadius: "var(--border-radius-lg)",
            padding: "1rem 1.25rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{selectedMode.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: selectedMode.color }}>{selectedMode.label}</span>
            </div>
            {output && (
              <button
                onClick={handleCopy}
                style={{ fontSize: 12, padding: "4px 10px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: "var(--color-text-secondary)" }}
              >
                <i className="ti ti-copy" style={{ fontSize: 13 }} aria-hidden="true" />Copy
              </button>
            )}
          </div>

          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "0.75rem", color: "var(--color-text-primary)" }}>
            {loading && !output ? (
              <div style={{ padding: "0.5rem 0" }}><TypingDots /></div>
            ) : (
              <SimpleMarkdown text={output} />
            )}
          </div>

          {output && (
            <p style={{ margin: "0.75rem 0 0", fontSize: 12, color: "var(--color-text-secondary)", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "0.5rem" }}>
              Press <kbd style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 4, padding: "1px 5px", fontSize: 11 }}>⌘ Enter</kbd> to generate again
            </p>
          )}
        </div>
      )}

      {!loading && !output && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--color-text-secondary)" }}>
          <i className="ti ti-wand" style={{ fontSize: 32, display: "block", marginBottom: 8 }} aria-hidden="true" />
          <p style={{ margin: 0, fontSize: 14 }}>Your generated response will appear here.</p>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--color-text-secondary)" }}>Choose a mode above, enter your text, and hit Generate.</p>
        </div>
      )}
    </div>
  );
}
