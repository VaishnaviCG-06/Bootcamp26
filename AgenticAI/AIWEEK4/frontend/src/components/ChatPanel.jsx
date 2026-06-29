import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import './ChatPanel.css'

const TOOL_ICONS = {
  web_search: '🌐',
  wikipedia: '📚',
  calculator: '🧮',
  summarize: '📝',
}

const TOOL_COLORS = {
  web_search: '#3b82f6',
  wikipedia: '#22c55e',
  calculator: '#eab308',
  summarize: '#a855f7',
}

function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="msg-avatar">🤖</div>
      <div className="msg-body">
        <div className="typing-indicator">
          <span>Agent is researching</span>
          <div className="dots">
            <div /><div /><div />
          </div>
        </div>
      </div>
    </div>
  )
}

function Message({ msg, onViewWorkflow }) {
  const isUser = msg.role === 'user'
  const hasWorkflow = msg.workflow && (
    msg.workflow.plan?.length > 0 || msg.workflow.tool_calls?.length > 0
  )

  return (
    <div className={`message ${isUser ? 'user' : 'assistant'}`}>
      <div className="msg-avatar">{isUser ? '👤' : '🤖'}</div>
      <div className="msg-body">
        {isUser ? (
          <div className="msg-text user-text">{msg.content}</div>
        ) : (
          <div className="msg-text assistant-text">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}

        {!isUser && msg.workflow?.key_findings?.length > 0 && (
          <div className="key-findings">
            <h4>🔑 Key Findings</h4>
            <ul>
              {msg.workflow.key_findings.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}

        {!isUser && msg.workflow?.tool_calls?.length > 0 && (
          <div className="tools-used">
            <span>Tools used:</span>
            {msg.workflow.tool_calls.map((t, i) => (
              <span
                key={i}
                className="tool-badge"
                style={{ borderColor: TOOL_COLORS[t.tool] || '#888' }}
              >
                {TOOL_ICONS[t.tool] || '🔧'} {t.tool}
              </span>
            ))}
            {hasWorkflow && (
              <button
                className="view-workflow-btn"
                onClick={() => onViewWorkflow(msg.workflow)}
              >
                View Workflow →
              </button>
            )}
          </div>
        )}

        <span className="msg-time">
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

export default function ChatPanel({ messages, isLoading, onSend, onViewWorkflow }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    const handler = (e) => {
      setInput(e.detail)
      inputRef.current?.focus()
    }
    window.addEventListener('example-query', handler)
    return () => window.removeEventListener('example-query', handler)
  }, [])

  const handleSend = () => {
    if (input.trim()) {
      onSend(input)
      setInput('')
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2>Research Chat</h2>
          <span className="status-badge">● Live</span>
        </div>
        <p className="chat-subtitle">
          Ask anything — the agent will plan, search, and synthesize an answer
        </p>
      </div>

      <div className="messages-area">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔬</div>
            <h3>ResearchAI Agent</h3>
            <p>I use multiple tools to research your questions deeply. I plan steps, search the web, check Wikipedia, and synthesize everything into a clear answer — with full workflow transparency.</p>
            <div className="empty-tips">
              <span>💡 Try asking about science, history, math, or current topics</span>
              <span>💡 Click any example in the sidebar to get started</span>
            </div>
          </div>
        )}

        {messages.map(msg => (
          <Message key={msg.id} msg={msg} onViewWorkflow={onViewWorkflow} />
        ))}

        {isLoading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <div className="input-container">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Ask anything... (e.g. 'What is CRISPR and how does it work?')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            style={{ resize: 'none' }}
          />
          <button
            className={`send-btn ${isLoading ? 'loading' : ''}`}
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '↑'}
          </button>
        </div>
        <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
