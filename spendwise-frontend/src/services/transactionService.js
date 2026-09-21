// This service will later connect to FastAPI backend
// Currently using localStorage for demo

import { initialTransactions } from '../data/transactions';

const STORAGE_KEY = 'spendwise_transactions';

export const getTransactions = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // Initialize with mock data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialTransactions));
  return initialTransactions;
};

export const addTransaction = (transaction) => {
  const transactions = getTransactions();
  const newTransaction = {
    id: Math.max(0, ...transactions.map(t => t.id)) + 1,
    ...transaction,
    date: transaction.date || new Date().toISOString().split('T')[0]
  };
  transactions.push(newTransaction);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  return newTransaction;
};

export const updateTransaction = (id, updatedData) => {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return transactions[index];
  }
  return null;
};

export const deleteTransaction = (id) => {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

export const getTransactionById = (id) => {
  const transactions = getTransactions();
  return transactions.find(t => t.id === id) || null;
};