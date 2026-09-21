import React from 'react';

const EmptyState = ({ message = 'No data available', icon = '📊' }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '40px 20px',
      color: '#999'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;