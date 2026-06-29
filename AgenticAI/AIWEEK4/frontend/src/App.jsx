import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Sidebar from './components/Sidebar.jsx'
import ChatPanel from './components/ChatPanel.jsx'
import WorkflowPanel from './components/WorkflowPanel.jsx'
import './App.css'

const API_BASE = '/api'

export default function App() {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('research_session_id') || uuidv4()
  })
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastWorkflow, setLastWorkflow] = useState(null)
  const [showWorkflow, setShowWorkflow] = useState(false)

  useEffect(() => {
    localStorage.setItem('research_session_id', sessionId)
    initSession()
    loadHistory()
  }, [sessionId])

  const initSession = async () => {
    try {
      await fetch(`${API_BASE}/session/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
    } catch (e) {
      console.error('Session init error:', e)
    }
  }

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history/${sessionId}`)
      const data = await res.json()
      if (data.history && data.history.length > 0) {
        const formatted = data.history.map((msg, i) => ({
          id: i,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp,
        }))
        setMessages(formatted)
      }
    } catch (e) {
      console.error('History load error:', e)
    }
  }

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      })
      const data = await res.json()

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.final_answer,
        workflow: {
          plan: data.plan,
          tool_calls: data.tool_calls,
          key_findings: data.key_findings,
        },
        timestamp: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
      setLastWorkflow(assistantMsg.workflow)
      setShowWorkflow(true)
    } catch (e) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '⚠️ Error connecting to the backend. Make sure the server is running on port 8000.',
        timestamp: new Date().toISOString(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const newSession = async () => {
    const newId = uuidv4()
    setSessionId(newId)
    setMessages([])
    setLastWorkflow(null)
    setShowWorkflow(false)
  }

  const clearSession = async () => {
    try {
      await fetch(`${API_BASE}/session/${sessionId}`, { method: 'DELETE' })
      setMessages([])
      setLastWorkflow(null)
      setShowWorkflow(false)
    } catch (e) {}
  }

  return (
    <div className="app-layout">
      <Sidebar
        sessionId={sessionId}
        messageCount={messages.length}
        onNewSession={newSession}
        onClearSession={clearSession}
      />
      <main className="main-area">
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={sendMessage}
          onViewWorkflow={(workflow) => {
            setLastWorkflow(workflow)
            setShowWorkflow(true)
          }}
        />
      </main>
      {showWorkflow && lastWorkflow && (
        <WorkflowPanel
          workflow={lastWorkflow}
          onClose={() => setShowWorkflow(false)}
        />
      )}
    </div>
  )
}
