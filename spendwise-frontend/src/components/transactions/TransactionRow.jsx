import React from 'react';
import {
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';

const TransactionRow = ({
  transaction,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
      return '0';
    }

    return numericAmount.toLocaleString('en-IN');
  };

  const description =
    transaction.description || 'No description';

  const maxDescriptionLength = 45;

  const shortDescription =
    description.length > maxDescriptionLength
      ? `${description.substring(0, maxDescriptionLength)}...`
      : description;

  return (
    <tr>
      <td>
        {transaction.id}
      </td>

      <td
        title={description}
        style={{
          maxWidth: '280px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {shortDescription}
      </td>

      <td
        style={{
          color:
            transaction.type === 'income'
              ? '#4caf50'
              : '#f44336',
          fontWeight: '500',
          whiteSpace: 'nowrap'
        }}
      >
        ₹{formatAmount(transaction.amount)}
      </td>

      <td style={{ whiteSpace: 'nowrap' }}>
        <span className="badge">
          {transaction.category || 'Other'}
        </span>
      </td>

      <td style={{ whiteSpace: 'nowrap' }}>
        <span
          className={`badge badge-${transaction.type}`}
        >
          {transaction.type === 'income'
            ? 'Income'
            : 'Expense'}
        </span>
      </td>

      <td style={{ whiteSpace: 'nowrap' }}>
        {formatDate(transaction.date)}
      </td>

      <td style={{ whiteSpace: 'nowrap' }}>
        {transaction.payment_method || 'N/A'}
      </td>

      <td>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap'
          }}
        >
          <button
            type="button"
            onClick={() =>
              onViewDetails(transaction)
            }
            className="btn btn-secondary btn-sm"
            title="View details"
          >
            <FaEye size={12} />
          </button>

          <button
            type="button"
            onClick={() =>
              onEdit(transaction)
            }
            className="btn btn-primary btn-sm"
            title="Edit transaction"
          >
            <FaEdit size={12} />
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(transaction.id)
            }
            className="btn btn-danger btn-sm"
            title="Delete transaction"
          >
            <FaTrash size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default TransactionRow;