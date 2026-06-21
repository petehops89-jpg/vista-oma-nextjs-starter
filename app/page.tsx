'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import ReactMarkdown from 'react-markdown'

export default function Home() {
  const { messages, sendMessage, status, error } = useChat()
  const [input, setInput] = useState('')

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const text = input
    setInput('')
    await sendMessage({ text })
  }

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '32px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Research Team</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: 28 }}>
        Enter a topic. A <strong>researcher</strong> agent gathers information, a{' '}
        <strong>writer</strong> agent composes an article, orchestrated by
        open-multi-agent and streamed via Vercel AI SDK.
      </p>

      <div style={{ minHeight: 120 }}>
        {messages.map((m) => {
          const text = m.parts
            .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
            .map((part) => part.text)
            .join('')
          return (
            <div key={m.id} style={{ marginBottom: 24, lineHeight: 1.7 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#999', marginBottom: 4 }}>
                {m.role === 'user' ? 'You' : 'Research Team'}
              </div>
              {m.role === 'assistant' ? (
                <div style={{ fontSize: 15 }}>
                  <ReactMarkdown
                    components={{
                      h2: ({ node, ...props }) => (
                        <h2 style={{ fontSize: 19, margin: '20px 0 8px' }} {...props} />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 style={{ fontSize: 16, margin: '16px 0 6px' }} {...props} />
                      ),
                      p: ({ node, ...props }) => <p style={{ margin: '8px 0' }} {...props} />,
                      ul: ({ node, ...props }) => (
                        <ul style={{ margin: '8px 0', paddingLeft: 22 }} {...props} />
                      ),
                      ol: ({ node, ...props }) => (
                        <ol style={{ margin: '8px 0', paddingLeft: 22 }} {...props} />
                      ),
                      li: ({ node, ...props }) => <li style={{ margin: '4px 0' }} {...props} />,
                      code: ({ node, ...props }) => (
                        <code
                          style={{
                            background: '#f0f0f0',
                            padding: '1px 5px',
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                          {...props}
                        />
                      ),
                    }}
                  >
                    {text}
                  </ReactMarkdown>
                </div>
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', fontSize: 15 }}>{text}</div>
              )}
            </div>
          )
        })}

        {isLoading && status === 'submitted' && (
          <div style={{ color: '#888', fontSize: 14, padding: '8px 0' }}>
            Agents are collaborating. This may take a minute...
          </div>
        )}

        {error && (
          <div style={{ color: '#c00', fontSize: 14, padding: '8px 0' }}>
            Error: {error.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 32 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a topic to research..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #ddd',
            fontSize: 15,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: 8,
            border: 'none',
            background: isLoading ? '#ccc' : '#111',
            color: '#fff',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: 15,
          }}
        >
          Send
        </button>
      </form>
    </main>
  )
}
