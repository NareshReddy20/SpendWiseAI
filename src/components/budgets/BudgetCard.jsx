import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BudgetCard = ({ budget, spent, onEdit, onDelete }) => {
  const percentage = Math.min((spent / budget.monthlyLimit) * 100, 100);
  
  const getProgressClass = () => {
    if (percentage < 70) return 'good';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ marginBottom: '8px' }}>{budget.category}</h4>
        <div>
          <button 
            onClick={() => onEdit(budget)}
            className="btn btn-primary btn-sm"
            style={{ marginRight: '4px' }}
          >
            <FaEdit size={12} />
          </button>
          <button 
            onClick={() => onDelete(budget.id)}
            className="btn btn-danger btn-sm"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginBottom: '8px',
        fontSize: '14px'
      }}>
        <span>₹{spent.toLocaleString()} spent</span>
        <span>₹{budget.monthlyLimit.toLocaleString()} limit</span>
      </div>
      <div className="progress-bar">
        <div 
          className={`progress-bar-fill ${getProgressClass()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div style={{ 
        marginTop: '8px',
        fontSize: '14px',
        color: '#666'
      }}>
        Remaining: ₹{(budget.monthlyLimit - spent).toLocaleString()}
      </div>
    </div>
  );
};

export default BudgetCard;