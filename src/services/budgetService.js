// This service will later connect to FastAPI backend
// Currently using localStorage for demo

import { initialBudgets } from '../data/budgets';

const STORAGE_KEY = 'spendwise_budgets';

export const getBudgets = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialBudgets));
  return initialBudgets;
};

export const addBudget = (budget) => {
  const budgets = getBudgets();
  const newBudget = {
    id: Math.max(0, ...budgets.map(b => b.id)) + 1,
    ...budget
  };
  budgets.push(newBudget);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  return newBudget;
};

export const updateBudget = (id, updatedData) => {
  const budgets = getBudgets();
  const index = budgets.findIndex(b => b.id === id);
  if (index !== -1) {
    budgets[index] = { ...budgets[index], ...updatedData };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    return budgets[index];
  }
  return null;
};

export const deleteBudget = (id) => {
  const budgets = getBudgets();
  const filtered = budgets.filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};