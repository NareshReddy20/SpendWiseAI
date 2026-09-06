import React, { useState, useEffect } from 'react';
import BudgetCard from '../../components/budgets/BudgetCard';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { getBudgets, addBudget, updateBudget, deleteBudget } from '../../services/budgetService';
import { getTransactions } from '../../services/transactionService';
import EmptyState from '../../components/common/EmptyState';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({ category: '', monthlyLimit: '' });
  const [errors, setErrors] = useState({});

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setBudgets(getBudgets());
    setTransactions(getTransactions());
  };

  const getSpentByCategory = (category) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  };

  const handleAddBudget = () => {
    setEditingBudget(null);
    setFormData({ category: '', monthlyLimit: '' });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setFormData({ category: budget.category, monthlyLimit: budget.monthlyLimit });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteBudget = (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(id);
      loadData();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.category) newErrors.category = 'Please select a category';
    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      newErrors.monthlyLimit = 'Please enter a valid limit';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, formData);
    } else {
      addBudget(formData);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Budgets</h2>
        <Button variant="primary" onClick={handleAddBudget}>+ Add Budget</Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState message="No budgets set up yet" icon="📊" />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {budgets.map(budget => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={getSpentByCategory(budget.category)}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add/Edit Budget">
        <form onSubmit={handleSubmit}>
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            options={categories.map(c => ({ value: c, label: c }))}
            error={errors.category}
            required
          />
          <Input
            label="Monthly Limit (₹)"
            name="monthlyLimit"
            type="number"
            value={formData.monthlyLimit}
            onChange={handleChange}
            placeholder="e.g., 15000"
            error={errors.monthlyLimit}
            required
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <Button type="submit" variant="primary">
              {editingBudget ? 'Update' : 'Add'} Budget
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;