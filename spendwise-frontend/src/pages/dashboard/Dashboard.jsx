import React from "react";

import {
  useNavigate
} from "react-router-dom";

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
} from "recharts";

import SummaryCard
  from "../../components/dashboard/SummaryCard";

import AIInsightCard
  from "../../components/dashboard/AIInsightCard";

import Card
  from "../../components/common/Card";

import EmptyState
  from "../../components/common/EmptyState";

import { useDashboardQuery } from "../../tanstack/alltanstack";


const Dashboard = () => {

  const navigate = useNavigate();


  const {
    data,
    isLoading,
    isError,
    error
  } = useDashboardQuery();


  if (isLoading) {

    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px"
        }}
      >
        Loading dashboard...
      </div>
    );
  }


  if (isError) {

    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          color: "#f44336"
        }}
      >
        Failed to load dashboard.

        <p>
          {error?.response?.data?.detail ||
            error?.message}
        </p>
      </div>
    );
  }


  const summary =
    data?.summary || {};

  const incomeVsExpenseData =
    data?.income_vs_expenses || [];

  const expenseByCategory =
    data?.expense_by_category || [];

  const recentTransactions =
    data?.recent_transactions || [];

  const budgetOverview =
    data?.budget_overview || [];


  const COLORS = [
    "#667eea",
    "#764ba2",
    "#4caf50",
    "#ff9800",
    "#f44336",
    "#2196f3",
    "#9c27b0",
    "#795548"
  ];


  return (
    <div>

      {/* ========================= */}
      {/* SUMMARY CARDS */}
      {/* ========================= */}

      <div className="summary-grid">

        <SummaryCard
          label="Total Balance"
          value={summary.total_balance || 0}
        />

        <SummaryCard
          label="Total Income"
          value={summary.total_income || 0}
          type="income"
        />

        <SummaryCard
          label="Total Expenses"
          value={summary.total_expenses || 0}
          type="expenses"
        />

        <SummaryCard
          label="Total Savings"
          value={
            summary.total_savings > 0
              ? summary.total_savings
              : 0
          }
          type="savings"
        />

      </div>


      {/* ========================= */}
      {/* CHARTS */}
      {/* ========================= */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "20px",
          marginBottom: "24px"
        }}
      >

        {/* Income vs Expenses */}

        <Card title="Income vs Expenses">

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <BarChart
              data={incomeVsExpenseData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis dataKey="type" />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(value).toLocaleString()}`
                }
              />

              <Legend />

              <Bar
                dataKey="amount"
                fill="#667eea"
              />

            </BarChart>

          </ResponsiveContainer>

        </Card>


        {/* Expense By Category */}

        <Card title="Expense by Category">

          {expenseByCategory.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={250}
            >

              <PieChart>

                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    category,
                    percent
                  }) =>
                    `${category} ${
                      (percent * 100).toFixed(0)
                    }%`
                  }
                  outerRadius={80}
                  dataKey="amount"
                  nameKey="category"
                >

                  {expenseByCategory.map(
                    (entry, index) => (

                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index %
                            COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString()}`
                  }
                />

              </PieChart>

            </ResponsiveContainer>

          ) : (

            <EmptyState
              message="No expense data"
              icon="📊"
            />

          )}

        </Card>

      </div>


      {/* ========================= */}
      {/* AI INSIGHT */}
      {/* ========================= */}

      {data?.ai_insight && (

        <AIInsightCard
          insight={data.ai_insight}
          icon="💡"
        />

      )}


      {/* ========================= */}
      {/* RECENT TRANSACTIONS */}
      {/* ========================= */}

      <Card
        title="Recent Transactions"
        style={{
          marginTop: "16px"
        }}
      >

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

                {recentTransactions.map(
                  (transaction) => (

                    <tr
                      key={transaction.id}
                    >

                      <td>
                        {transaction.description}
                      </td>


                      <td>

                        <span className="badge">
                          {transaction.category}
                        </span>

                      </td>


                      <td
                        style={{
                          color:
                            transaction.type ===
                            "income"
                              ? "#4caf50"
                              : "#f44336",

                          fontWeight: "500"
                        }}
                      >
                        {transaction.type ===
                        "income"
                          ? "+"
                          : "-"}

                        ₹
                        {Number(
                          transaction.amount
                        ).toLocaleString()}

                      </td>


                      <td>

                        <span
                          className={`badge badge-${transaction.type}`}
                        >
                          {transaction.type ===
                          "income"
                            ? "Income"
                            : "Expense"}
                        </span>

                      </td>


                      <td>
                        {new Date(
                          transaction.date
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        ) : (

          <EmptyState
            message="No recent transactions"
            icon="📭"
          />

        )}


        <div
          style={{
            marginTop: "12px",
            textAlign: "right"
          }}
        >

          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate("/transactions")
            }
          >
            View All Transactions →
          </button>

        </div>

      </Card>


      {/* ========================= */}
      {/* BUDGET OVERVIEW */}
      {/* ========================= */}

      <Card
        title="Budget Overview"
        style={{
          marginTop: "16px"
        }}
      >

        {budgetOverview.length > 0 ? (

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "16px"
            }}
          >

            {budgetOverview.map(
              (budget) => {

                const percentage =
                  Math.min(
                    Number(
                      budget.percentage || 0
                    ),
                    100
                  );


                const getClass = () => {

                  if (percentage < 70) {
                    return "good";
                  }

                  if (percentage < 90) {
                    return "warning";
                  }

                  return "danger";
                };


                return (

                  <div
                    key={budget.id}
                    style={{
                      padding: "12px",
                      border:
                        "1px solid #e9ecef",
                      borderRadius: "8px"
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "4px"
                      }}
                    >

                      <strong>
                        {budget.category}
                      </strong>

                      <span>
                        ₹
                        {Number(
                          budget.spent || 0
                        ).toLocaleString()}

                        {" / "}

                        ₹
                        {Number(
                          budget.monthly_limit || 0
                        ).toLocaleString()}
                      </span>

                    </div>


                    <div className="progress-bar">

                      <div
                        className={`progress-bar-fill ${getClass()}`}
                        style={{
                          width:
                            `${percentage}%`
                        }}
                      />

                    </div>


                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "4px"
                      }}
                    >
                      {percentage.toFixed(0)}%
                      {" "}used
                    </div>

                  </div>

                );

              }
            )}

          </div>

        ) : (

          <EmptyState
            message="No budgets available"
            icon="💰"
          />

        )}


        <div
          style={{
            marginTop: "12px",
            textAlign: "right"
          }}
        >

          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate("/budgets")
            }
          >
            Manage Budgets →
          </button>

        </div>

      </Card>

    </div>
  );
};


export default Dashboard;