import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { parseExpenseText } from '../../services/aiService';
import { addTransaction } from '../../services/transactionService';

const AIExpenseParser = () => {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');

  const handleParse = () => {
    if (!text.trim()) {
      setError('Please describe your transaction');
      return;
    }
    setError('');
    setLoading(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const result = parseExpenseText(text, transactionType);
      setParsedData(result);
      setShowResult(true);
      setLoading(false);
    }, 800);
  };

  const handleConfirm = () => {
    if (parsedData) {
      addTransaction({
        ...parsedData,
        amount: parseFloat(parsedData.amount),
        type: transactionType,
        paymentMethod: parsedData.paymentMethod || 'Other',
        notes: `AI-parsed: ${text}`
      });
      navigate('/transactions');
    }
  };

  const handleEdit = () => {
    setShowResult(false);
    setParsedData(null);
  };

  const handleTypeChange = (e) => {
    setTransactionType(e.target.value);
    setShowResult(false);
    setParsedData(null);
  };

  const getExamples = () => {
    if (transactionType === 'expense') {
      return [
        "I spent ₹450 on dinner yesterday",
        "Bought groceries for ₹2000 at Big Bazaar",
        "Paid ₹1500 for electricity bill",
        "Uber ride cost ₹350"
      ];
    } else {
      return [
        "Received salary of ₹45000",
        "Got ₹5000 from freelance work",
        "₹2000 interest from fixed deposit",
        "Received ₹1500 as gift"
      ];
    }
  };

  const examples = getExamples();

  return (
    <div>
      <h2 style={{ marginBottom: '8px' }}>AI Transaction Parser</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Describe your expense or income in natural language and let AI parse it for you.
      </p>

      <Card>
        <div style={{ marginBottom: '16px' }}>
          <Select
            label="Transaction Type"
            value={transactionType}
            onChange={handleTypeChange}
            options={[
              { value: 'expense', label: '💰 Expense' },
              { value: 'income', label: '📈 Income' }
            ]}
            style={{ marginBottom: '16px' }}
          />

          <Input
            label="Describe your transaction"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={transactionType === 'expense' 
              ? "e.g., I spent ₹450 on dinner yesterday" 
              : "e.g., Received salary of ₹45000"
            }
            disabled={showResult}
            error={error}
          />
          
          <Button 
            variant="primary" 
            onClick={handleParse}
            disabled={!text.trim() || loading || showResult}
            style={{ marginTop: '8px' }}
          >
            {loading ? 'Parsing...' : '🤖 Parse with AI'}
          </Button>
        </div>

        {/* Example suggestions */}
        <div style={{ 
          marginTop: '12px',
          padding: '12px',
          background: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666'
        }}>
          <strong>💡 Try these examples:</strong><br />
          {examples.map((example, index) => (
            <span 
              key={index}
              onClick={() => {
                setText(example);
                setError('');
              }}
              style={{
                display: 'inline-block',
                margin: '4px 4px 0 0',
                padding: '4px 10px',
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#666';
                e.target.style.borderColor = '#e9ecef';
              }}
            >
              {example}
            </span>
          ))}
        </div>

        {showResult && parsedData && (
          <div style={{ 
            marginTop: '20px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{ margin: 0 }}>📋 Parsed Result</h4>
              <span style={{ 
                padding: '4px 12px',
                borderRadius: '20px',
                background: transactionType === 'income' ? '#e8f5e9' : '#fce4ec',
                color: transactionType === 'income' ? '#4caf50' : '#f44336',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {transactionType === 'income' ? 'INCOME' : 'EXPENSE'}
              </span>
            </div>
            
            <div style={{ display: 'grid', gap: '8px' }}>
              <p><strong>Amount:</strong> ₹{parsedData.amount}</p>
              <p><strong>Category:</strong> {parsedData.category}</p>
              <p><strong>Description:</strong> {parsedData.description}</p>
              <p><strong>Date:</strong> {parsedData.date}</p>
              {parsedData.paymentMethod && (
                <p><strong>Payment Method:</strong> {parsedData.paymentMethod}</p>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button variant="success" onClick={handleConfirm}>
                ✅ Confirm & Save
              </Button>
              <Button variant="secondary" onClick={handleEdit}>
                ✏️ Edit
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowResult(false);
                setParsedData(null);
                setText('');
              }}>
                🔄 Start Over
              </Button>
            </div>
          </div>
        )}

        {!showResult && !loading && text.trim() && (
          <div style={{ 
            marginTop: '12px',
            padding: '12px',
            background: '#e3f2fd',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1565c0'
          }}>
            💡 Click "Parse with AI" to extract transaction details from your description
          </div>
        )}
      </Card>

      {/* Quick Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '16px',
        marginTop: '20px'
      }}>
        <Card>
          <h4 style={{ marginBottom: '8px' }}>💰 Expense Examples</h4>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            fontSize: '14px',
            color: '#666'
          }}>
            <li style={{ padding: '4px 0' }}>• "Spent ₹500 on groceries"</li>
            <li style={{ padding: '4px 0' }}>• "Paid ₹1500 for electricity bill"</li>
            <li style={{ padding: '4px 0' }}>• "Uber ride ₹350"</li>
          </ul>
        </Card>
        
        <Card>
          <h4 style={{ marginBottom: '8px' }}>📈 Income Examples</h4>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            fontSize: '14px',
            color: '#666'
          }}>
            <li style={{ padding: '4px 0' }}>• "Received salary of ₹45000"</li>
            <li style={{ padding: '4px 0' }}>• "Freelance payment ₹5000"</li>
            <li style={{ padding: '4px 0' }}>• "Interest income ₹2000"</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default AIExpenseParser;