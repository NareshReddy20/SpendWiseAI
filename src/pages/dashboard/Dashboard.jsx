import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
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
import SummaryCard from '../../components/dashboard/SummaryCard';
import AIInsightCard from '../../components/dashboard/AIInsightCard';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import { getTransactions } from '../../services/transactionService';
import { getBudgets } from '../../services/budgetService';
import { getAIInsights } from '../../services/aiService';
import { initialInsights } from '../../data/insights';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const txns = getTransactions();
    setTransactions(txns);
    setBudgets(getBudgets());
    
    // Generate AI insights based on actual data
    const aiInsights = getAIInsights(txns);
    setInsights(aiInsights.length > 0 ? aiInsights : initialInsights);
    setLoading(false);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;
  const totalSavings = totalIncome - totalExpenses;

  // Income vs Expense chart data
  const incomeVsExpenseData = [
    { name: 'Income', amount: totalIncome },
    { name: 'Expenses', amount: totalExpenses },
    { name: 'Savings', amount: totalSavings > 0 ? totalSavings : 0 }
  ];

  // Expense by category chart data
  const expenseByCategory = categories.map(cat => {
    const total = transactions
      .filter(t => t.type === 'expense' && t.category === cat)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0);

  const COLORS = ['#667eea', '#764ba2', '#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#795548'];

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Budget progress
  const budgetProgress = budgets.map(budget => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    return { ...budget, spent };
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Summary Cards */}
      <div className="summary-grid">
        <SummaryCard label="Total Balance" value={totalBalance} />
        <SummaryCard label="Total Income" value={totalIncome} type="income" />
        <SummaryCard label="Total Expenses" value={totalExpenses} type="expenses" />
        <SummaryCard label="Total Savings" value={totalSavings > 0 ? totalSavings : 0} type="savings" />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <Card title="Income vs Expenses">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={incomeVsExpenseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="amount" fill="#667eea" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Expense by Category">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={expenseByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* AI Insight */}
      {insights.length > 0 && (
        <AIInsightCard insight={insights[0].message} icon={insights[0].icon || '💡'} />
      )}

      {/* Recent Transactions */}
      <Card title="Recent Transactions" style={{ marginTop: '16px' }}>
        {recentTransactions.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(t => (
                  <tr key={t.id}>
                    <td>{t.description}</td>
                    <td><span className="badge">{t.category}</span></td>
                    <td style={{ 
                      color: t.type === 'income' ? '#4caf50' : '#f44336',
                      fontWeight: '500'
                    }}>
                      ₹{parseFloat(t.amount).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${t.type}`}>
                        {t.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="No recent transactions" icon="📭" />
        )}
        <div style={{ marginTop: '12px', textAlign: 'right' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/transactions')}
          >
            View All Transactions →
          </button>
        </div>
      </Card>

      {/* Budget Overview */}
      <Card title="Budget Overview" style={{ marginTop: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {budgetProgress.map(budget => {
            const percentage = Math.min((budget.spent / budget.monthlyLimit) * 100, 100);
            const getClass = () => {
              if (percentage < 70) return 'good';
              if (percentage < 90) return 'warning';
              return 'danger';
            };
            return (
              <div key={budget.id} style={{ padding: '12px', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{budget.category}</strong>
                  <span>₹{budget.spent.toLocaleString()} / ₹{budget.monthlyLimit.toLocaleString()}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-bar-fill ${getClass()}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  {percentage.toFixed(0)}% used
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: '12px', textAlign: 'right' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => navigate('/budgets')}
          >
            Manage Budgets →
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;