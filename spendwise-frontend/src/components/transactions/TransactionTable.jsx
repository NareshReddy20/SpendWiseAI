import React, { useState } from 'react';
import TransactionRow from './TransactionRow';
import EmptyState from '../common/EmptyState';

const TransactionTable = ({
  transactions,
  onEdit,
  onDelete,
  onViewDetails,
  startIndex = 0
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const categories = [
    'Food',
    'Transport',
    'Shopping',
    'Bills',
    'Entertainment',
    'Healthcare',
    'Education',
    'Other'
  ];

  const filteredTransactions = transactions.filter(
    (transaction) => {
      const description =
        transaction.description?.toLowerCase() || '';

      const search =
        searchTerm.toLowerCase().trim();

      const matchesSearch =
        description.includes(search);

      const matchesCategory =
        !categoryFilter ||
        transaction.category === categoryFilter;

      const matchesType =
        !typeFilter ||
        transaction.type === typeFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType
      );
    }
  );

  if (transactions.length === 0) {
    return (
      <EmptyState
        message="No transactions yet"
        icon="💰"
      />
    );
  }

  return (
    <div>
      <div
        className="filter-bar"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(200px, 2fr) minmax(150px, 1fr) minmax(150px, 1fr)',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(e.target.value)
          }
          className="form-control"
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="form-control"
        >
          <option value="">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value)
          }
          className="form-control"
        >
          <option value="">
            All Types
          </option>

          <option value="income">
            Income
          </option>

          <option value="expense">
            Expense
          </option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <EmptyState
          message="No transactions match your filters"
          icon="🔍"
        />
      ) : (
        <div
          className="table-container"
          style={{
            width: '100%',
            overflowX: 'auto'
          }}
        >
          <table
            style={{
              width: '100%',
              minWidth: '950px',
              tableLayout: 'fixed',
              borderCollapse: 'collapse'
            }}
          >
            <thead>
              <tr>
                <th style={{ width: '60px' }}>
                  ID
                </th>

                <th style={{ width: '25%' }}>
                  Description
                </th>

                <th style={{ width: '110px' }}>
                  Amount
                </th>

                <th style={{ width: '120px' }}>
                  Category
                </th>

                <th style={{ width: '100px' }}>
                  Type
                </th>

                <th style={{ width: '120px' }}>
                  Date
                </th>

                <th style={{ width: '130px' }}>
                  Payment Method
                </th>

                <th style={{ width: '130px' }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.map(
                (transaction, index) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    displayId={startIndex + index + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewDetails={onViewDetails}
                  />
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;