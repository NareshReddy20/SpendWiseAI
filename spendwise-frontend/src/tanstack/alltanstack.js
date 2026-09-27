import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";

import {
  loginAPI,
  registerAPI,
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
  generateAIInsightsAPI,
  parseAITransaction,
  confirmAITransaction
} from "../services/AllApi";


// ===============================
// LOGIN
// ===============================

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: loginAPI
  });
};


// ===============================
// REGISTER
// ===============================

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: registerAPI
  });
};


// ===============================
// DASHBOARD
// ===============================

export const useDashboardQuery = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardAPI
  });
};


// ===============================
// ADD EXPENSE
// ===============================

export const useAddExpenseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addExpenseAPI,

    onSuccess: () => {

      // Update dashboard numbers
      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      // Update transaction list
      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

      // Update financial numbers on AI Insights page.
      // GET /ai/insights only reads saved AI insights.
      // It does NOT generate Gemini insights.
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// ADD INCOME
// ===============================

export const useAddIncomeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addIncomeAPI,

    onSuccess: () => {

      // Update dashboard numbers
      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      // Update transaction list
      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

      // Update financial numbers on AI Insights page.
      // GET /ai/insights does NOT generate AI.
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// TRANSACTIONS
// ===============================

export const useTransactionsQuery = (page, limit) => {
  return useQuery({
    queryKey: ["transactions", page, limit],
    queryFn: () => getTransactionsAPI({
      page,
      limit
    })
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
    queryFn: getBudgetsAPI
  });
};


// ===============================
// ADD BUDGET
// ===============================

export const useAddBudgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBudgetAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      // Budget information is part of financial analysis
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// UPDATE BUDGET
// ===============================

export const useUpdateBudgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBudgetAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// DELETE BUDGET
// ===============================

export const useDeleteBudgetMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBudgetAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["budgets"]
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// REPORT
// ===============================

export const useReportMutation = () => {
  return useMutation({
    mutationFn: getReportAPI
  });
};


// ===============================
// PROFILE
// ===============================

export const useProfileQuery = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfileAPI
  });
};


// ===============================
// UPDATE PROFILE
// ===============================

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileAPI,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile"]
      });

      queryClient.invalidateQueries({
        queryKey: ["profile-summary"]
      });
    }
  });
};


// ===============================
// PROFILE SUMMARY
// ===============================

export const useProfileSummaryQuery = () => {
  return useQuery({
    queryKey: ["profile-summary"],
    queryFn: getProfileSummaryAPI
  });
};


// ===============================
// UPDATE TRANSACTION
// ===============================

export const useUpdateTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTransactionAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      // Refresh financial numbers only.
      // Saved AI insights are NOT regenerated.
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// DELETE TRANSACTION
// ===============================

export const useDeleteTransactionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransactionAPI,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      // Refresh financial numbers only.
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// AI TRANSACTION PARSER
// ===============================

export const useParseAITransaction = () => {
  return useMutation({
    mutationFn: parseAITransaction
  });
};


// ===============================
// CONFIRM AI TRANSACTION
// ===============================

export const useConfirmAITransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmAITransaction,

    onSuccess: () => {

      queryClient.invalidateQueries({
        queryKey: ["transactions"]
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard"]
      });

      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};


// ===============================
// AI FINANCIAL INSIGHTS
// ===============================

export const useAIInsights = () => {
  return useQuery({
    queryKey: ["ai-insights"],
    queryFn: getAIInsightsAPI
  });
};


// ===============================
// GENERATE AI INSIGHTS
// ===============================

export const useGenerateAIInsightsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateAIInsightsAPI,

    onSuccess: () => {

      // After generation, fetch the newly saved insights
      // and updated financial numbers.
      queryClient.invalidateQueries({
        queryKey: ["ai-insights"]
      });
    }
  });
};