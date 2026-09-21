import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import {
  loginAPI,
  getDashboardAPI,
  addExpenseAPI,
  addIncomeAPI,
  getTransactionsAPI,
  filterTransactionsAPI,
  getBudgetsAPI,
  addBudgetAPI,
  updateBudgetAPI,
  deleteBudgetAPI,
  getReportAPI,
  getProfileAPI,
  getProfileSummaryAPI,
  updateProfileAPI,
  updateTransactionAPI,
  deleteTransactionAPI,
  getAIInsightsAPI,
  parseAITransaction,
  confirmAITransaction
} from "../services/AllApi";


// ===============================
// LOGIN
// ===============================

export const useLoginMutation = () => {

  return useMutation({
    mutationFn: loginAPI,
  });

};


// ===============================
// DASHBOARD
// ===============================

export const useDashboardQuery = () => {

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardAPI,
  });

};

// ===============================
// ADD EXPENSE
// ===============================

export const useAddExpenseMutation = () => {
  return useMutation({
    mutationFn: addExpenseAPI,
  });
};

// ===============================
// ADD INCOME
// ===============================

export const useAddIncomeMutation = () => {
  return useMutation({
    mutationFn: addIncomeAPI,
  });
};

// ===============================
// TRANSACTIONS
// ===============================

export const useTransactionsQuery = (page, limit) => {
  return useQuery({
    queryKey: ["transactions", page, limit],
    queryFn: () => getTransactionsAPI({ page, limit })
  });
};

// ===============================
// FILTER TRANSACTIONS
// ===============================

export const useFilterTransactionsMutation = () => {
  return useMutation({
    mutationFn: filterTransactionsAPI
  });
};

// ===============================
// GET BUDGETS
// ===============================

export const useBudgetsQuery = () => {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: getBudgetsAPI,
  });
};


// ===============================
// ADD BUDGET
// ===============================

export const useAddBudgetMutation = () => {
  return useMutation({
    mutationFn: addBudgetAPI,
  });
};


// ===============================
// UPDATE BUDGET
// ===============================

export const useUpdateBudgetMutation = () => {
  return useMutation({
    mutationFn: updateBudgetAPI,
  });
};


// ===============================
// DELETE BUDGET
// ===============================

export const useDeleteBudgetMutation = () => {
  return useMutation({
    mutationFn: deleteBudgetAPI,
  });
};

export const useReportMutation = () => {
  return useMutation({
    mutationFn: getReportAPI,
  });
};


// =========================
// PROFILE
// =========================

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileAPI
  });
};


// =========================
// UPDATE PROFILE
// =========================

export const useUpdateProfileMutation = () => {
  return useMutation({
    mutationFn: updateProfileAPI
  });
};


// =========================
// PROFILE SUMMARY
// =========================

export const useProfileSummaryQuery = () => {
  return useQuery({
    queryKey: ["profile-summary"],
    queryFn: getProfileSummaryAPI
  });
};

// =========================
// UPDATE TRANSACTION
// =========================

export const useUpdateTransactionMutation = () => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: updateTransactionAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

    }

  });
};


// =========================
// DELETE TRANSACTION
// =========================

export const useDeleteTransactionMutation = () => {

  const queryClient = useQueryClient();

  return useMutation({

    mutationFn: deleteTransactionAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

    }

  });
};

export const useAIInsights = () => {
  return useQuery({
    queryKey: ["aiInsights"],
    queryFn: getAIInsightsAPI,
  });
};

export const useParseAITransaction = () => {
  return useMutation({
    mutationFn: parseAITransaction,
  });
};

export const useConfirmAITransaction = () => {
  return useMutation({
    mutationFn: confirmAITransaction,
  });
};