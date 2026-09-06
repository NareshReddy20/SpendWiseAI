import React, { useState, useEffect } from 'react';
import TransactionTable from '../../components/transactions/TransactionTable';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { getTransactions, deleteTransaction, updateTransaction } from '../../services/transactionService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'UPI', 'Bank Transfer', 'Other'];

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = () => {
    setTransactions(getTransactions());
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      deleteTransaction(id);
      loadTransactions();
      setSuccessMessage('Transaction deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setEditForm({ ...transaction });
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateTransaction(selectedTransaction.id, editForm);
    setIsEditModalOpen(false);
    loadTransactions();
    setSuccessMessage('Transaction updated successfully');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Transactions</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-success" onClick={() => window.location.href = '/add-income'}>
            + Add Income
          </button>
          <button className="btn btn-primary" onClick={() => window.location.href = '/add-expense'}>
            + Add Expense
          </button>
        </div>
      </div>

      {successMessage && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {successMessage}
        </div>
      )}

      <Card>
        <TransactionTable 
          transactions={transactions}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewDetails={handleViewDetails}
        />
      </Card>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Transaction">
        <form onSubmit={handleEditSubmit}>
          <Input
            label="Description"
            name="description"
            value={editForm.description || ''}
            onChange={handleEditChange}
            required
          />
          <Input
            label="Amount"
            name="amount"
            type="number"
            value={editForm.amount || ''}
            onChange={handleEditChange}
            required
          />
          <Select
            label="Category"
            name="category"
            value={editForm.category || ''}
            onChange={handleEditChange}
            options={categories.map(c => ({ value: c, label: c }))}
            required
          />
          <Select
            label="Type"
            name="type"
            value={editForm.type || ''}
            onChange={handleEditChange}
            options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' }
            ]}
            required
          />
          <Input
            label="Date"
            name="date"
            type="date"
            value={editForm.date || ''}
            onChange={handleEditChange}
            required
          />
          <Select
            label="Payment Method"
            name="paymentMethod"
            value={editForm.paymentMethod || ''}
            onChange={handleEditChange}
            options={paymentMethods.map(p => ({ value: p, label: p }))}
          />
          <Input
            label="Notes"
            name="notes"
            value={editForm.notes || ''}
            onChange={handleEditChange}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button type="submit" variant="primary">Save Changes</Button>
            <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Details Modal */}
      <Modal isOpen={isDetailsModalOpen} onClose={() => setIsDetailsModalOpen(false)} title="Transaction Details">
        {selectedTransaction && (
          <div>
            <p><strong>ID:</strong> {selectedTransaction.id}</p>
            <p><strong>Description:</strong> {selectedTransaction.description}</p>
            <p><strong>Amount:</strong> ₹{parseFloat(selectedTransaction.amount).toLocaleString()}</p>
            <p><strong>Category:</strong> {selectedTransaction.category}</p>
            <p><strong>Type:</strong> {selectedTransaction.type}</p>
            <p><strong>Date:</strong> {new Date(selectedTransaction.date).toLocaleDateString('en-IN')}</p>
            <p><strong>Payment Method:</strong> {selectedTransaction.paymentMethod || 'N/A'}</p>
            <p><strong>Notes:</strong> {selectedTransaction.notes || 'No notes'}</p>
          </div>
        )}
        <Button variant="secondary" onClick={() => setIsDetailsModalOpen(false)} style={{ marginTop: '16px' }}>
          Close
        </Button>
      </Modal>
    </div>
  );
};

export default Transactions;