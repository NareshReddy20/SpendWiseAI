import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Transactions from './pages/transactions/Transactions';
import AddExpense from './pages/transactions/AddExpense';
import AddIncome from './pages/transactions/AddIncome';
import Budgets from './pages/budgets/Budgets';
import AIInsights from './pages/ai/AIInsights';
import AIExpenseParser from './pages/ai/AIExpenseParser';
import AIChat from './pages/ai/AIChat';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="add-expense" element={<AddExpense />} />
              <Route path="add-income" element={<AddIncome />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="ai-insights" element={<AIInsights />} />
              <Route path="ai-parser" element={<AIExpenseParser />} />
              <Route path="ai-chat" element={<AIChat />} />
              <Route path="reports" element={<Reports />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;