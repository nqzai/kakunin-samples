'use client';

import React from 'react';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div style={{
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Kakunin Agent Compliance</h1>
        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
          Test cryptographic scope validation and behavioral audit logs powered by Vercel AI SDK tools.
        </p>
      </header>

      <main style={{ flex: 1, marginBottom: '80px' }}>
        {messages.map(m => (
          <div key={m.id} style={{ marginBottom: '16px', lineHeight: '1.5' }}>
            <strong style={{ display: 'block', fontSize: '12px', color: '#888', textTransform: 'uppercase' }}>
              {m.role === 'user' ? 'User' : 'Assistant'}
            </strong>
            <div style={{ fontSize: '16px', color: '#333', marginTop: '4px' }}>
              {m.content}
            </div>
          </div>
        ))}
      </main>

      <form onSubmit={handleSubmit} style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '560px',
        padding: '0 20px',
        boxSizing: 'border-box'
      }}>
        <input
          value={input}
          placeholder="Ask agent to check scopes or register a trade..."
          onChange={handleInputChange}
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </form>
    </div>
  );
}
