import './WorkflowPanel.css'

const TOOL_META = {
  web_search: { icon: '🌐', color: '#3b82f6', label: 'Web Search' },
  wikipedia:  { icon: '📚', color: '#22c55e', label: 'Wikipedia' },
  calculator: { icon: '🧮', color: '#eab308', label: 'Calculator' },
  summarize:  { icon: '📝', color: '#a855f7', label: 'Summarizer' },
}

export default function WorkflowPanel({ workflow, onClose }) {
  const { plan = [], tool_calls = [], key_findings = [] } = workflow

  return (
    <div className="workflow-panel">
      <div className="wf-header">
        <div>
          <h3>🧠 Agent Workflow</h3>
          <p>Step-by-step plan & tool execution</p>
        </div>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="wf-body">

        {/* Plan */}
        {plan.length > 0 && (
          <section className="wf-section">
            <h4>📋 Execution Plan</h4>
            <ol className="plan-list">
              {plan.map((step, i) => (
                <li key={i}>
                  <span className="step-num">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* Tool Calls */}
        {tool_calls.length > 0 && (
          <section className="wf-section">
            <h4>🔧 Tool Executions</h4>
            <div className="tool-calls">
              {tool_calls.map((tc, i) => {
                const meta = TOOL_META[tc.tool] || { icon: '🔧', color: '#888', label: tc.tool }
                return (
                  <div key={i} className="tool-card" style={{ '--tool-color': meta.color }}>
                    <div className="tool-card-header">
                      <span className="tool-icon">{meta.icon}</span>
                      <div>
                        <strong>{meta.label}</strong>
                        {tc.reason && <p className="tool-reason">{tc.reason}</p>}
                      </div>
                      <span className="tool-step">Step {i + 1}</span>
                    </div>
                    <div className="tool-io">
                      <div className="tool-input">
                        <label>INPUT</label>
                        <code>{tc.input}</code>
                      </div>
                      {tc.output && (
                        <div className="tool-output">
                          <label>OUTPUT</label>
                          <div className="output-text">
                            {tc.output.slice(0, 400)}
                            {tc.output.length > 400 && <span className="truncated">… (truncated)</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Key Findings */}
        {key_findings.length > 0 && (
          <section className="wf-section">
            <h4>🔑 Key Findings</h4>
            <ul className="findings-list">
              {key_findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Summary */}
        <section className="wf-section wf-summary">
          <div className="summary-stats">
            <div className="stat">
              <strong>{plan.length}</strong>
              <span>Plan Steps</span>
            </div>
            <div className="stat">
              <strong>{tool_calls.length}</strong>
              <span>Tools Used</span>
            </div>
            <div className="stat">
              <strong>{new Set(tool_calls.map(t => t.tool)).size}</strong>
              <span>Unique Tools</span>
            </div>
            <div className="stat">
              <strong>{key_findings.length}</strong>
              <span>Key Findings</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
