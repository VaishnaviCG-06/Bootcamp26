import './Sidebar.css'

const EXAMPLE_QUERIES = [
  "What is quantum computing and how does it work?",
  "Compare electric vs hydrogen fuel cell cars",
  "What is the GDP of India in 2024?",
  "Explain machine learning with examples",
  "How does the human immune system work?",
  "Calculate compound interest: 10000 at 8% for 5 years",
]

export default function Sidebar({ sessionId, messageCount, onNewSession, onClearSession }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🔬</span>
          <div>
            <h1>ResearchAI</h1>
            <p>Agentic Research Assistant</p>
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        <h3>Agent Capabilities</h3>
        <ul className="capability-list">
          <li>
            <span className="cap-icon">🌐</span>
            <div>
              <strong>Web Search</strong>
              <p>DuckDuckGo instant answers</p>
            </div>
          </li>
          <li>
            <span className="cap-icon">📚</span>
            <div>
              <strong>Wikipedia</strong>
              <p>Detailed encyclopedia data</p>
            </div>
          </li>
          <li>
            <span className="cap-icon">🧮</span>
            <div>
              <strong>Calculator</strong>
              <p>Math & expression evaluator</p>
            </div>
          </li>
          <li>
            <span className="cap-icon">📝</span>
            <div>
              <strong>Summarizer</strong>
              <p>AI-powered text synthesis</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="sidebar-section">
        <h3>Try These</h3>
        <ul className="example-list">
          {EXAMPLE_QUERIES.map((q, i) => (
            <li key={i} className="example-item" onClick={() => {
              // Send to parent via custom event
              window.dispatchEvent(new CustomEvent('example-query', { detail: q }))
            }}>
              {q}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="session-info">
          <span className="session-dot" />
          <div>
            <strong>Session Active</strong>
            <p>{messageCount} messages in memory</p>
            <p className="session-id">{sessionId.slice(0, 8)}…</p>
          </div>
        </div>
        <div className="session-actions">
          <button className="btn-secondary" onClick={onClearSession}>
            🗑 Clear Memory
          </button>
          <button className="btn-primary" onClick={onNewSession}>
            ✨ New Session
          </button>
        </div>
      </div>
    </aside>
  )
}
