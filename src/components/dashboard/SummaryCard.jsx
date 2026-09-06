import React from 'react';

const SummaryCard = ({ label, value, type = 'default' }) => {
  const types = {
    default: '',
    income: 'income',
    expenses: 'expenses',
    savings: 'savings'
  };

  return (
    <div className={`summary-card ${types[type] || ''}`}>
      <div className="summary-card-label">{label}</div>
      <div className="summary-card-value">₹{value.toLocaleString()}</div>
    </div>
  );
};

export default SummaryCard;