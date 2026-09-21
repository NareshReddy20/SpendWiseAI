import React from 'react';

import { useAIInsights } from '../../tanstack/alltanstack';

import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';


const AIInsights = () => {

  // =========================================
  // FETCH AI INSIGHTS FROM BACKEND
  // =========================================

  const {
    data,
    isLoading,
    isError,
    error
  } = useAIInsights();


  // =========================================
  // LOADING
  // =========================================

  if (isLoading) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px'
        }}
      >
        Loading insights...
      </div>
    );
  }


  // =========================================
  // ERROR
  // =========================================

  if (isError) {
    console.error('AI Insights Error:', error);

    return (
      <div
        style={{
          textAlign: 'center',
          padding: '40px',
          color: 'red'
        }}
      >
        Failed to load financial insights.
      </div>
    );
  }


  // =========================================
  // GET DATA FROM API RESPONSE
  // =========================================

  const insights = data?.data?.insights || [];

  const summary = data?.data?.summary || {};


  // =========================================
  // ICONS
  // =========================================

  const getIconForType = (type) => {

    const icons = {

      highest_spending: '📊',

      second_highest_spending: '📈',

      savings: '🌟',

      budget_exceeded: '⚠️',

      budget_warning: '⚠️',

      overspending: '🚨',

      no_savings: '💡',

      no_data: '🤖'

    };

    return icons[type] || '💡';
  };


  // =========================================
  // TITLES
  // =========================================

  const getTitleForType = (type) => {

    const titles = {

      highest_spending: 'Highest Spending',

      second_highest_spending: 'Second Highest Spending',

      savings: 'Savings',

      budget_exceeded: 'Budget Exceeded',

      budget_warning: 'Budget Warning',

      overspending: 'Overspending',

      no_savings: 'Savings',

      no_data: 'Financial Insight'

    };

    return titles[type] || 'Financial Insight';
  };


  // =========================================
  // UI
  // =========================================

  return (

    <div>

      <h2 style={{ marginBottom: '20px' }}>
        AI Financial Insights
      </h2>


      <p
        style={{
          color: '#666',
          marginBottom: '24px'
        }}
      >
        Smart insights based on your spending patterns
        and financial data.
      </p>


      {/* =====================================
          FINANCIAL SUMMARY
      ====================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}
      >

        <Card>

          <h4>Total Income</h4>

          <p style={{ fontSize: '22px' }}>
            ₹{summary.total_income?.toLocaleString('en-IN') || 0}
          </p>

        </Card>


        <Card>

          <h4>Total Expenses</h4>

          <p style={{ fontSize: '22px' }}>
            ₹{summary.total_expense?.toLocaleString('en-IN') || 0}
          </p>

        </Card>


        <Card>

          <h4>Savings</h4>

          <p style={{ fontSize: '22px' }}>
            ₹{summary.savings?.toLocaleString('en-IN') || 0}
          </p>

        </Card>


        <Card>

          <h4>Savings Rate</h4>

          <p style={{ fontSize: '22px' }}>
            {summary.savings_percentage || 0}%
          </p>

        </Card>

      </div>


      {/* =====================================
          INSIGHTS
      ====================================== */}

      {insights.length === 0 ? (

        <EmptyState
          message="No insights available yet"
          icon="🤖"
        />

      ) : (

        <div
          style={{
            display: 'grid',
            gap: '16px'
          }}
        >

          {insights.map((insight, index) => (

            <Card key={index}>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}
              >

                {/* ICON */}

                <div
                  style={{
                    fontSize: '24px'
                  }}
                >
                  {getIconForType(insight.type)}
                </div>


                {/* CONTENT */}

                <div>

                  <h3
                    style={{
                      margin: '0 0 6px 0'
                    }}
                  >
                    {getTitleForType(insight.type)}
                  </h3>


                  <p
                    style={{
                      fontSize: '16px',
                      margin: 0
                    }}
                  >
                    {insight.message}
                  </p>


                  <small
                    style={{
                      color: '#999',
                      marginTop: '6px',
                      display: 'block'
                    }}
                  >
                    Generated by SpendWise Financial Analysis
                  </small>

                </div>

              </div>

            </Card>

          ))}

        </div>

      )}

    </div>

  );

};


export default AIInsights;