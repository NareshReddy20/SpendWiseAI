import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/authService';

import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Profile = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currency: 'INR',
    monthlyIncomeTarget: '',
    savingsGoal: ''
  });

  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load user information
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        currency: user.currency || 'INR',
        monthlyIncomeTarget: user.monthlyIncomeTarget || '',
        savingsGoal: user.savingsGoal || ''
      });
    }
  }, [user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Get transactions
  const transactions = JSON.parse(
    localStorage.getItem('spendwise_transactions') || '[]'
  );

  // Calculate total income
  const totalIncome = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

  // Calculate total expenses
  const totalExpenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce(
      (total, transaction) => total + Number(transaction.amount || 0),
      0
    );

  // Save profile
  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);

    const updatedUser = updateUserProfile({
      name: formData.name,
      currency: formData.currency,
      monthlyIncomeTarget:
        parseFloat(formData.monthlyIncomeTarget) || 0,
      savingsGoal:
        parseFloat(formData.savingsGoal) || 0
    });

    if (updatedUser) {
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Profile</h2>

      {/* Profile Information */}
      <Card>
        <h3 style={{ marginBottom: '20px' }}>
          Profile Information
        </h3>

        {success && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '8px',
              marginBottom: '20px'
            }}
          >
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Input
              label="Email"
              name="email"
              value={formData.email}
              disabled
              style={{
                background: '#f5f5f5'
              }}
            />
          </div>

          <h3 style={{ margin: '25px 0 20px' }}>
            Financial Preferences
          </h3>

          <div className="form-row">
            <Input
              label="Currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="INR"
              required
            />

            <Input
              label="Monthly Income Target"
              name="monthlyIncomeTarget"
              type="number"
              value={formData.monthlyIncomeTarget}
              onChange={handleChange}
              placeholder="50000"
              min="0"
            />
          </div>

          <Input
            label="Monthly Savings Goal"
            name="savingsGoal"
            type="number"
            value={formData.savingsGoal}
            onChange={handleChange}
            placeholder="10000"
            min="0"
          />

          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Account Summary */}
      <Card style={{ marginTop: '20px' }}>
        <h3 style={{ marginBottom: '20px' }}>
          Account Summary
        </h3>

        <div className="form-row">
          <div>
            <p><strong>Account Type</strong></p>
            <p>Personal</p>
          </div>

          <div>
            <p><strong>Total Transactions</strong></p>
            <p>{transactions.length}</p>
          </div>
        </div>

        <div className="form-row">
          <div>
            <p><strong>Total Income</strong></p>
            <p>
              {formData.currency} {totalIncome.toLocaleString()}
            </p>
          </div>

          <div>
            <p><strong>Total Expenses</strong></p>
            <p>
              {formData.currency} {totalExpenses.toLocaleString()}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '15px' }}>
          <p><strong>Current Balance</strong></p>
          <p>
            {formData.currency}{' '}
            {(totalIncome - totalExpenses).toLocaleString()}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Profile;