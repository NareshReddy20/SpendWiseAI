import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { getChatResponse } from '../../services/aiService';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { type: 'ai', text: 'Hello! I\'m your financial AI assistant. Ask me anything about your finances!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = getChatResponse(input);
      setMessages(prev => [...prev, { type: 'ai', text: response }]);
      setLoading(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>AI Financial Assistant</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Ask questions about your spending, savings, and get personalized advice.
      </p>

      <Card>
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.type}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="chat-message ai" style={{ opacity: 0.6 }}>
                Thinking...
              </div>
            )}
          </div>
          <div className="chat-input-area">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your finances..."
              disabled={loading}
            />
            <Button variant="primary" onClick={handleSend} disabled={loading || !input.trim()}>
              Send
            </Button>
          </div>
        </div>

        <div style={{ 
          marginTop: '12px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666'
        }}>
          <strong>Example questions:</strong><br />
          "Where am I spending the most?" • "How can I save more?" • "Give me budget advice"
        </div>
      </Card>
    </div>
  );
};

export default AIChat;