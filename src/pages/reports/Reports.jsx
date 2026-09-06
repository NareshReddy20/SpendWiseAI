import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '../../components/common/Card';
import Select from '../../components/common/Select';
import { getTransactions } from '../../services/transactionService';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];
  const COLORS = ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#795548'];

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  const getMonthData = () => {
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === month && date.getFullYear() === year;
    });
  };

  const monthData = getMonthData();

  const totalIncome = monthData
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = monthData
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const savings = totalIncome - totalExpenses;

  const categorySpending = categories.map(cat => {
    const total = monthData
      .filter(t => t.type === 'expense' && t.category === cat)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  // Monthly spending trend (last 6 months)
  const getMonthlyTrend = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = (month - i + 12) % 12;
      const y = month - i < 0 ? year - 1 : year;
      const monthName = new Date(y, m).toLocaleString('default', { month: 'short' });
      const expenses = transactions
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === m && date.getFullYear() === y && t.type === 'expense';
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      months.push({ month: monthName, expenses });
    }
    return months;
  };

  const monthlyData = getMonthlyTrend();

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Reports</h2>
      
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <Select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          options={Array.from({ length: 12 }, (_, i) => ({
            value: i,
            label: new Date(2024, i).toLocaleString('default', { month: 'long' })
          }))}
        />
        <Select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          options={[2023, 2024, 2025].map(y => ({ value: y, label: y.toString() }))}
        />
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card income">
          <div className="summary-card-label">Monthly Income</div>
          <div className="summary-card-value">₹{totalIncome.toLocaleString()}</div>
        </div>
        <div className="summary-card expenses">
          <div className="summary-card-label">Monthly Expenses</div>
          <div className="summary-card-value">₹{totalExpenses.toLocaleString()}</div>
        </div>
        <div className="summary-card savings">
          <div className="summary-card-label">Savings</div>
          <div className="summary-card-value">₹{savings.toLocaleString()}</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Card title="Category-wise Spending">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categorySpending.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Monthly Spending Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="expenses" stroke="#f44336" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {categorySpending.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No data available for this month
        </div>
      )}
    </div>
  );
};

export default Reports;