import axios from "axios";
import api from "../lib/axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});


API.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


export const loginAPI = async (data) => {

  const response = await API.post(
    "/auth/login",
    data
  );

  return response.data;
};


export const getDashboardAPI = async () => {

  const response = await API.get(
    "/dashboard/"
  );

  return response.data;
};

// =========================
// GET PROFILE
// =========================

export const getProfileAPI = async () => {
  const response = await api.get("/profile/");
  return response.data;
};


// =========================
// UPDATE PROFILE
// =========================

export const updateProfileAPI = async (data) => {
  const response = await api.put("/profile/update", data);
  return response.data;
};


// =========================
// GET PROFILE SUMMARY
// =========================

export const getProfileSummaryAPI = async () => {
  const response = await api.get("/profile/summary");
  return response.data;
};

// ===============================
// ADD EXPENSE
// ===============================

export const addExpenseAPI = async (expenseData) => {
  const response = await api.post(
    "/transactions/expense",
    expenseData
  );

  return response.data;
};

// ===============================
// ADD INCOME
// ===============================

export const addIncomeAPI = async (incomeData) => {
  const response = await api.post(
    "/transactions/income",
    incomeData
  );

  return response.data;
};

// ===============================
// GET TRANSACTIONS
// ===============================

export const getTransactionsAPI = async ({ page = 1, limit = 5 }) => {
  const response = await api.get("/transactions/", {
    params: {
      page,
      limit
    }
  });

  return response.data;
};


// ===============================
// FILTER TRANSACTIONS
// ===============================

export const filterTransactionsAPI = async (filterData) => {
  const response = await api.post(
    "/transactions/filter",
    filterData
  );

  return response.data;
};

// ===============================
// GET BUDGETS
// ===============================

export const getBudgetsAPI = async () => {
  const response = await api.get("/budgets/");

  return response.data;
};


// ===============================
// ADD BUDGET
// ===============================

export const addBudgetAPI = async (budgetData) => {
  const response = await api.post(
    "/budgets/add",
    budgetData
  );

  return response.data;
};


// ===============================
// UPDATE BUDGET
// ===============================

export const updateBudgetAPI = async (budgetData) => {
  const response = await api.put(
    "/budgets/update",
    budgetData
  );

  return response.data;
};


// ===============================
// DELETE BUDGET
// ===============================

export const deleteBudgetAPI = async (budgetData) => {
  const response = await api.delete(
    "/budgets/delete",
    {
      data: budgetData
    }
  );

  return response.data;
};

export const getReportAPI = async (reportData) => {
  const response = await api.post("/reports/", reportData);
  return response.data;
};

// =========================
// UPDATE TRANSACTION
// =========================

export const updateTransactionAPI = async ({
  transactionId,
  transactionData
}) => {

  const response = await api.put(
    `/transactions/${transactionId}`,
    transactionData
  );

  return response.data;
};


// =========================
// DELETE TRANSACTION
// =========================

export const deleteTransactionAPI = async (
  transactionId
) => {

  const response = await api.delete(
    `/transactions/${transactionId}`
  );

  return response.data;
};

export const getAIInsightsAPI = async () => {
  const response = await api.get("/ai/insights");
  return response.data;
};

export const parseAITransaction = async (data) => {
  const response = await api.post("/ai/parse-expense", data);
  return response.data;
};

export const confirmAITransaction = async (data) => {
  const response = await api.post("/ai/confirm-expense", data);
  return response.data;
};

export default API;