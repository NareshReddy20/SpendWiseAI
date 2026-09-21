import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TransactionTable from '../../components/transactions/TransactionTable';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

import { useTransactionsQuery, useUpdateTransactionMutation, useDeleteTransactionMutation } from '../../tanstack/alltanstack';

const Transactions = () => {
  const navigate = useNavigate();

  // ============================================
  // STATE
  // ============================================

  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({});

  const [successMessage, setSuccessMessage] = useState('');

  // Pagination
  const [page, setPage] = useState(1);

  const limit = 5;
  const updateTransactionMutation =
  useUpdateTransactionMutation();

  const deleteTransactionMutation =
  useDeleteTransactionMutation();

  // ============================================
  // GET TRANSACTIONS FROM BACKEND
  // ============================================

  const {
    data,
    isLoading,
    isError,
    error
  } = useTransactionsQuery(page, limit);


  // ============================================
  // TRANSACTIONS DATA
  // ============================================

  const transactions = data?.transactions || [];

  const totalPages = data?.total_pages || 1;


  // ============================================
  // CATEGORIES
  // ============================================

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


  // ============================================
  // PAYMENT METHODS
  // ============================================

  const paymentMethods = [
    'Cash',
    'Credit Card',
    'UPI',
    'Bank Transfer',
    'Other'
  ];


  // ============================================
  // EDIT TRANSACTION
  // ============================================

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);

    setEditForm({
      ...transaction
    });

    setIsEditModalOpen(true);
  };


  // ============================================
  // VIEW TRANSACTION DETAILS
  // ============================================

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);

    setIsDetailsModalOpen(true);
  };


  // ============================================
  // DELETE
  // ============================================
  // Backend delete API has not been connected yet.
  // ============================================

const handleDelete = async (id) => {

  const confirmed = window.confirm(
    "Are you sure you want to delete this transaction?"
  );

  if (!confirmed) {
    return;
  }

  try {

    await deleteTransactionMutation.mutateAsync(id);

    setSuccessMessage(
      "Transaction deleted successfully!"
    );

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

  } catch (error) {

    console.error(
      "Delete transaction error:",
      error
    );

    alert(
      error?.response?.data?.detail ||
      "Failed to delete transaction"
    );

  }
};


  // ============================================
  // EDIT SUBMIT
  // ============================================
  // Backend update API has not been connected yet.
  // ============================================

const handleEditSubmit = async (e) => {

  e.preventDefault();

  try {

    await updateTransactionMutation.mutateAsync({

      transactionId: selectedTransaction.id,

      transactionData: {

        description: editForm.description,

        amount: Number(editForm.amount),

        category: editForm.category,

        type: editForm.type,

        date: editForm.date,

        payment_method:
          editForm.payment_method || null,

        notes:
          editForm.notes || null

      }

    });

    setIsEditModalOpen(false);

    setSuccessMessage(
      "Transaction updated successfully!"
    );

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

  } catch (error) {

    console.error(
      "Update transaction error:",
      error
    );

    alert(
      error?.response?.data?.detail ||
      "Failed to update transaction"
    );

  }
};


  // ============================================
  // EDIT FORM CHANGE
  // ============================================

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };


  // ============================================
  // PREVIOUS PAGE
  // ============================================

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };


  // ============================================
  // NEXT PAGE
  // ============================================

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };


  // ============================================
  // LOADING
  // ============================================

  if (isLoading) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>
          Transactions
        </h2>

        <Card>
          <p style={{ textAlign: 'center', padding: '30px' }}>
            Loading transactions...
          </p>
        </Card>
      </div>
    );
  }


  // ============================================
  // ERROR
  // ============================================

  if (isError) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>
          Transactions
        </h2>

        <Card>
          <p
            style={{
              color: 'red',
              textAlign: 'center',
              padding: '30px'
            }}
          >
            {error?.response?.data?.detail ||
              'Failed to load transactions'}
          </p>
        </Card>
      </div>
    );
  }


  // ============================================
  // JSX
  // ============================================

  return (
    <div>

      {/* ========================================
          HEADER
      ======================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >

        <h2>
          Transactions
        </h2>


        <div
          style={{
            display: 'flex',
            gap: '8px'
          }}
        >

          {/* ADD INCOME */}

          <button
            className="btn btn-success"
            onClick={() => navigate('/add-income')}
          >
            + Add Income
          </button>


          {/* ADD EXPENSE */}

          <button
            className="btn btn-primary"
            onClick={() => navigate('/add-expense')}
          >
            + Add Expense
          </button>

        </div>

      </div>


      {/* ========================================
          SUCCESS MESSAGE
      ======================================== */}

      {successMessage && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '8px',
            marginBottom: '16px'
          }}
        >
          {successMessage}
        </div>
      )}


      {/* ========================================
          TRANSACTION TABLE
      ======================================== */}

      <Card>

        {transactions.length === 0 ? (

          <p
            style={{
              textAlign: 'center',
              padding: '30px'
            }}
          >
            No transactions found.
          </p>

        ) : (

          <TransactionTable
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
          />

        )}


        {/* ======================================
            PAGINATION
        ====================================== */}

        {transactions.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              marginTop: '20px',
              paddingBottom: '10px'
            }}
          >

            <Button
              type="button"
              variant="secondary"
              disabled={page === 1}
              onClick={handlePreviousPage}
            >
              Previous
            </Button>


            <span>
              Page {page} of {totalPages}
            </span>


            <Button
              type="button"
              variant="secondary"
              disabled={page === totalPages}
              onClick={handleNextPage}
            >
              Next
            </Button>

          </div>
        )}

      </Card>


      {/* ========================================
          EDIT MODAL
      ======================================== */}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Transaction"
      >

        <form onSubmit={handleEditSubmit}>

          {/* DESCRIPTION */}

          <Input
            label="Description"
            name="description"
            value={editForm.description || ''}
            onChange={handleEditChange}
            required
          />


          {/* AMOUNT */}

          <Input
            label="Amount"
            name="amount"
            type="number"
            value={editForm.amount || ''}
            onChange={handleEditChange}
            required
          />


          {/* CATEGORY */}

          <Select
            label="Category"
            name="category"
            value={editForm.category || ''}
            onChange={handleEditChange}
            options={categories.map((category) => ({
              value: category,
              label: category
            }))}
            required
          />


          {/* TYPE */}

          <Select
            label="Type"
            name="type"
            value={editForm.type || ''}
            onChange={handleEditChange}
            options={[
              {
                value: 'income',
                label: 'Income'
              },
              {
                value: 'expense',
                label: 'Expense'
              }
            ]}
            required
          />


          {/* DATE */}

          <Input
            label="Date"
            name="date"
            type="date"
            value={editForm.date || ''}
            onChange={handleEditChange}
            required
          />


          {/* PAYMENT METHOD */}

          <Select
            label="Payment Method"
            name="payment_method"
            value={editForm.payment_method || ''}
            onChange={handleEditChange}
            options={paymentMethods.map((paymentMethod) => ({
              value: paymentMethod,
              label: paymentMethod
            }))}
          />


          {/* NOTES */}

          <Input
            label="Notes"
            name="notes"
            value={editForm.notes || ''}
            onChange={handleEditChange}
          />


          {/* BUTTONS */}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              marginTop: '16px'
            }}
          >

            <Button
              type="submit"
              variant="primary"
              disabled={updateTransactionMutation.isPending}
            >
              {updateTransactionMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </Button>


            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>

          </div>

        </form>

      </Modal>


      {/* ========================================
          DETAILS MODAL
      ======================================== */}

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="Transaction Details"
      >

        {selectedTransaction && (

          <div>

            <p>
              <strong>ID:</strong>{' '}
              {selectedTransaction.id}
            </p>


            <p>
              <strong>Description:</strong>{' '}
              {selectedTransaction.description}
            </p>


            <p>
              <strong>Amount:</strong>{' '}
              ₹
              {parseFloat(
                selectedTransaction.amount
              ).toLocaleString('en-IN')}
            </p>


            <p>
              <strong>Category:</strong>{' '}
              {selectedTransaction.category}
            </p>


            <p>
              <strong>Type:</strong>{' '}
              {selectedTransaction.type}
            </p>


            <p>
              <strong>Date:</strong>{' '}
              {new Date(
                selectedTransaction.date
              ).toLocaleDateString('en-IN')}
            </p>


            <p>
              <strong>Payment Method:</strong>{' '}
              {selectedTransaction.payment_method || 'N/A'}
            </p>


            <p>
              <strong>Notes:</strong>{' '}
              {selectedTransaction.notes || 'No notes'}
            </p>

          </div>

        )}


        <Button
          variant="secondary"
          onClick={() => setIsDetailsModalOpen(false)}
          style={{ marginTop: '16px' }}
        >
          Close
        </Button>

      </Modal>

    </div>
  );
};

export default Transactions;