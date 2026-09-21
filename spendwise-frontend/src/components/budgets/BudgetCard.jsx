import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  // Backend field names
  const monthlyLimit = Number(budget.monthly_limit) || 0;
  const spent = Number(budget.spent) || 0;

  // Use backend percentage if available
  const percentage =
    budget.percentage !== undefined
      ? Number(budget.percentage)
      : monthlyLimit > 0
      ? (spent / monthlyLimit) * 100
      : 0;

  const getProgressClass = () => {
    if (percentage < 70) return 'good';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  const remaining = monthlyLimit - spent;

  return (
    <div className="card">

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h4 style={{ marginBottom: '8px' }}>
          {budget.category}
        </h4>

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

      {/* Spending Information */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          fontSize: '14px'
        }}
      >
        <span>
          ₹{spent.toLocaleString()} spent
        </span>

        <span>
          ₹{monthlyLimit.toLocaleString()} limit
        </span>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${getProgressClass()}`}
          style={{
            width: `${Math.min(percentage, 100)}%`
          }}
        />
      </div>

      {/* Remaining */}
      <div
        style={{
          marginTop: '8px',
          fontSize: '14px',
          color: '#666'
        }}
      >
        Remaining: ₹{remaining.toLocaleString()}
      </div>

    </div>
  );
};

export default BudgetCard;