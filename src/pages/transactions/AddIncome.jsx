import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { addTransaction } from '../../services/transactionService';

const AddIncome = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Salary',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
  const paymentMethods = ['Cash', 'Credit Card', 'UPI', 'Bank Transfer', 'Other'];

  const validate = () => {
    const newErrors = {};
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      type: 'income'
    });

    setSuccess(true);
    setTimeout(() => {
      navigate('/transactions');
    }, 1500);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Add Income</h2>
      
      <Card>
        {success ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#4caf50'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3>Income Added Successfully!</h3>
            <p>Redirecting to transactions...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <Input
              label="Amount (₹)"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0"
              error={errors.amount}
              required
            />

            <Input
              label="Source / Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="e.g., Monthly salary"
              error={errors.description}
              required
            />

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={incomeCategories.map(c => ({ value: c, label: c }))}
              error={errors.category}
              required
            />

            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              error={errors.date}
              required
            />

            <Select
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              options={paymentMethods.map(p => ({ value: p, label: p }))}
            />

            <Input
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about this income"
            />

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <Button type="submit" variant="success">Add Income</Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default AddIncome;