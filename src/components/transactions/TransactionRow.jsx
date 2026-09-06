import React from 'react';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const TransactionRow = ({ transaction, onEdit, onDelete, onViewDetails }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <tr>
      <td>{transaction.id}</td>
      <td>{transaction.description}</td>
      <td style={{ 
        color: transaction.type === 'income' ? '#4caf50' : '#f44336',
        fontWeight: '500'
      }}>
        ₹{parseFloat(transaction.amount).toLocaleString()}
      </td>
      <td>
        <span className="badge">{transaction.category}</span>
      </td>
      <td>
        <span className={`badge badge-${transaction.type}`}>
          {transaction.type === 'income' ? 'Income' : 'Expense'}
        </span>
      </td>
      <td>{formatDate(transaction.date)}</td>
      <td>{transaction.paymentMethod || 'N/A'}</td>
      <td>
        <button 
          onClick={() => onViewDetails(transaction)}
          className="btn btn-secondary btn-sm"
          style={{ marginRight: '4px' }}
        >
          <FaEye size={12} />
        </button>
        <button 
          onClick={() => onEdit(transaction)}
          className="btn btn-primary btn-sm"
          style={{ marginRight: '4px' }}
        >
          <FaEdit size={12} />
        </button>
        <button 
          onClick={() => onDelete(transaction.id)}
          className="btn btn-danger btn-sm"
        >
          <FaTrash size={12} />
        </button>
      </td>
    </tr>
  );
};

export default TransactionRow;