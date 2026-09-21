import React, { useEffect, useState } from 'react';

import {
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

import { useReportMutation } from '../../tanstack/alltanstack';


const Reports = () => {

  // Current month and year
  const currentDate = new Date();

  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  const {
    mutate: getReport,
    data,
    isPending,
    isError,
    error
  } = useReportMutation();


  // =========================
  // FETCH REPORT
  // =========================

  useEffect(() => {

    getReport({
      month: month,
      year: year
    });

  }, [month, year, getReport]);


  // =========================
  // REPORT DATA
  // =========================

  const totalIncome = Number(data?.monthly_income || 0);

  const totalExpenses = Number(data?.monthly_expenses || 0);

  const savings = Number(data?.savings || 0);


  // =========================
  // CATEGORY-WISE SPENDING
  // =========================

  const categorySpending = (data?.category_wise_spending || []).map(
    (item) => ({
      name: item.category,
      value: Number(item.amount || 0)
    })
  );


  // =========================
  // MONTHLY TREND
  // =========================

  const monthlyData = (data?.monthly_spending_trend || []).map(
    (item) => {

      const date = new Date(
        item.year,
        item.month - 1
      );

      return {
        month: date.toLocaleString('default', {
          month: 'short'
        }),
        expenses: Number(item.expenses || 0)
      };

    }
  );


  // =========================
  // PIE CHART COLORS
  // =========================

  const COLORS = [
    '#667eea',
    '#764ba2',
    '#4caf50',
    '#ff9800',
    '#f44336',
    '#2196f3',
    '#9c27b0',
    '#795548'
  ];


  // =========================
  // MONTH OPTIONS
  // =========================

  const monthOptions = Array.from(
    { length: 12 },
    (_, index) => ({
      value: index + 1,
      label: new Date(
        2024,
        index
      ).toLocaleString('default', {
        month: 'long'
      })
    })
  );


  // =========================
  // YEAR OPTIONS
  // =========================

  const yearOptions = [
    2023,
    2024,
    2025,
    2026
  ].map((yearValue) => ({
    value: yearValue,
    label: yearValue.toString()
  }));


  // =========================
  // LOADING
  // =========================

  if (isPending) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>
          Reports
        </h2>

        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666'
          }}
        >
          Loading report...
        </div>
      </div>
    );
  }


  // =========================
  // ERROR
  // =========================

  if (isError) {
    return (
      <div>
        <h2 style={{ marginBottom: '20px' }}>
          Reports
        </h2>

        <div
          style={{
            textAlign: 'center',
            padding: '40px',
            color: '#f44336'
          }}
        >
          Failed to load report.

          <div style={{ marginTop: '8px' }}>
            {error?.response?.data?.detail ||
              error?.message ||
              'Something went wrong'}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div>

      {/* =========================
          PAGE TITLE
      ========================= */}

      <h2 style={{ marginBottom: '20px' }}>
        Reports
      </h2>


      {/* =========================
          MONTH & YEAR FILTER
      ========================= */}

      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '24px'
        }}
      >

        <Select
          value={month}
          onChange={(e) =>
            setMonth(parseInt(e.target.value))
          }
          options={monthOptions}
        />

        <Select
          value={year}
          onChange={(e) =>
            setYear(parseInt(e.target.value))
          }
          options={yearOptions}
        />

      </div>


      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="summary-grid">

        <div className="summary-card income">

          <div className="summary-card-label">
            Monthly Income
          </div>

          <div className="summary-card-value">
            ₹{totalIncome.toLocaleString()}
          </div>

        </div>


        <div className="summary-card expenses">

          <div className="summary-card-label">
            Monthly Expenses
          </div>

          <div className="summary-card-value">
            ₹{totalExpenses.toLocaleString()}
          </div>

        </div>


        <div className="summary-card savings">

          <div className="summary-card-label">
            Savings
          </div>

          <div className="summary-card-value">
            ₹{savings.toLocaleString()}
          </div>

        </div>

      </div>


      {/* =========================
          CHARTS
      ========================= */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}
      >

        {/* CATEGORY PIE CHART */}

        <Card title="Category-wise Spending">

          {categorySpending.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={categorySpending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >

                  {categorySpending.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          COLORS[
                            index % COLORS.length
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

            <div
              style={{
                textAlign: 'center',
                padding: '100px 20px',
                color: '#999'
              }}
            >
              No category spending data
            </div>

          )}

        </Card>


        {/* MONTHLY TREND */}

        <Card title="Monthly Spending Trend">

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <LineChart data={monthlyData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
              />

              <YAxis />

              <Tooltip
                formatter={(value) =>
                  `₹${Number(value).toLocaleString()}`
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="expenses"
                stroke="#f44336"
              />

            </LineChart>

          </ResponsiveContainer>

        </Card>

      </div>


      {/* =========================
          NO DATA
      ========================= */}

      {categorySpending.length === 0 &&
        monthlyData.every(
          (item) => item.expenses === 0
        ) && (

          <div
            style={{
              textAlign: 'center',
              padding: '40px',
              color: '#999'
            }}
          >
            No data available for this month
          </div>

        )}

    </div>
  );
};


export default Reports;