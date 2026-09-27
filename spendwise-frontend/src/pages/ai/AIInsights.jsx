import React from "react";

import Card from "../../components/common/Card";
import Button from "../../components/common/Button";

import {
  useAIInsights,
  useGenerateAIInsightsMutation
} from "../../tanstack/alltanstack";


const AIInsights = () => {

  // ==========================================
  // GET SAVED AI INSIGHTS
  // ==========================================

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useAIInsights();


  // ==========================================
  // GENERATE AI INSIGHTS
  // ==========================================

  const {
    mutate: generateInsights,
    isPending: isGenerating
  } = useGenerateAIInsightsMutation();


  // ==========================================
  // EXTRACT RESPONSE DATA
  // ==========================================

  const insightData = data?.data;

  const summary = insightData?.summary;

  const insights = insightData?.insights || [];

  const source = insightData?.source;

  const cached = insightData?.cached;


  // ==========================================
  // GENERATE HANDLER
  // ==========================================

  const handleGenerate = () => {
    generateInsights();
  };


  // ==========================================
  // INSIGHT ICON
  // ==========================================

  const getInsightIcon = (type) => {

    switch (type) {

      case "budget_alert":
        return "⚠️";

      case "unusual_spending":
        return "🔍";

      case "spending_behavior":
        return "📊";

      case "spending_pattern":
        return "📈";

      case "positive_behavior":
        return "🎯";

      case "savings_opportunity":
        return "💰";

      case "recommendation":
        return "💡";

      default:
        return "✨";
    }
  };


  // ==========================================
  // INITIAL LOADING
  // ==========================================

  if (isLoading) {

    return (
      <div style={styles.container}>

        <h2 style={styles.heading}>
          AI Financial Insights
        </h2>

        <div style={styles.loadingContainer}>

          <div style={styles.spinner}>
            ⏳
          </div>

          <p style={styles.loadingText}>
            Loading your financial insights...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================
  // ERROR
  // ==========================================

  if (isError) {

    return (
      <div style={styles.container}>

        <h2 style={styles.heading}>
          AI Financial Insights
        </h2>

        <Card>

          <div style={styles.errorContainer}>

            <div style={styles.errorIcon}>
              ❌
            </div>

            <h3>
              Unable to load insights
            </h3>

            <p style={styles.errorText}>
              {error?.response?.data?.detail ||
                "Something went wrong while loading your financial insights."
              }
            </p>

            <Button onClick={() => refetch()}>
              Try Again
            </Button>

          </div>

        </Card>

      </div>
    );
  }


  return (

    <div style={styles.container}>

      {/* =====================================
          HEADER
      ====================================== */}

      <div style={styles.header}>

        <div>

          <h2 style={styles.heading}>
            AI Financial Insights
          </h2>

          <p style={styles.subtitle}>
            Personalized insights based on your
            current financial activity.
          </p>

        </div>


        {/* =================================
            GENERATE BUTTON
        ================================== */}

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
        >

          {isGenerating
            ? "Generating..."
            : "✨ Generate AI Insights"
          }

        </Button>

      </div>


      {/* =====================================
          GENERATION STATUS
      ====================================== */}

      {/* {insightData && (

        <div style={styles.statusContainer}>

          {cached ? (

            <span style={styles.cachedStatus}>
              ✓ Using saved AI insights
            </span>

          ) : (

            <span style={styles.generatedStatus}>
              ✨ Newly generated
            </span>

          )}


          {source && (

            <span style={styles.sourceStatus}>

              {source === "gemini"
                ? "Gemini AI Analysis"
                : "Python Financial Analysis"
              }

            </span>

          )}

        </div>

      )} */}


      {/* =====================================
          MONTH
      ====================================== */}

      {/* {insightData?.month && (

        <p style={styles.monthText}>

          Financial insights for{" "}

          <strong>
            {insightData.month}
          </strong>

        </p>

      )} */}


      {/* =====================================
          SUMMARY CARDS
      ====================================== */}

      {summary && (

        <div style={styles.summaryGrid}>

          {/* Income */}

          <Card>

            <div style={styles.summaryCard}>

              <span style={styles.summaryIcon}>
                💵
              </span>

              <div>

                <p style={styles.summaryLabel}>
                  Total Income
                </p>

                <h3 style={styles.incomeValue}>

                  ₹
                  {Number(
                    summary.total_income || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2
                  })}

                </h3>

              </div>

            </div>

          </Card>


          {/* Expenses */}

          <Card>

            <div style={styles.summaryCard}>

              <span style={styles.summaryIcon}>
                💸
              </span>

              <div>

                <p style={styles.summaryLabel}>
                  Total Expenses
                </p>

                <h3 style={styles.expenseValue}>

                  ₹
                  {Number(
                    summary.total_expense || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2
                  })}

                </h3>

              </div>

            </div>

          </Card>


          {/* Savings */}

          <Card>

            <div style={styles.summaryCard}>

              <span style={styles.summaryIcon}>
                💰
              </span>

              <div>

                <p style={styles.summaryLabel}>
                  Savings
                </p>

                <h3 style={styles.savingsValue}>

                  ₹
                  {Number(
                    summary.savings || 0
                  ).toLocaleString("en-IN", {
                    minimumFractionDigits: 2
                  })}

                </h3>

              </div>

            </div>

          </Card>


          {/* Savings Rate */}

          <Card>

            <div style={styles.summaryCard}>

              <span style={styles.summaryIcon}>
                📊
              </span>

              <div>

                <p style={styles.summaryLabel}>
                  Savings Rate
                </p>

                <h3 style={styles.rateValue}>

                  {Number(
                    summary.savings_percentage || 0
                  ).toFixed(2)}

                  %

                </h3>

              </div>

            </div>

          </Card>

        </div>

      )}


      {/* =====================================
          INSIGHTS
      ====================================== */}

      <div style={styles.insightsSection}>

        <h3 style={styles.sectionTitle}>
          Your Financial Insights
        </h3>


        {insights.length === 0 ? (

          <Card>

            <div style={styles.emptyContainer}>

              <div style={styles.emptyIcon}>
                💡
              </div>

              <h3>
                No insights available
              </h3>

              <p style={styles.emptyText}>
                Click{" "}
                <strong>
                  "✨ Generate AI Insights"
                </strong>{" "}
                to generate personalized
                financial insights.
              </p>

            </div>

          </Card>

        ) : (

          <div style={styles.insightsGrid}>

            {insights.map(
              (insight, index) => (

                <Card key={index}>

                  <div style={styles.insightCard}>

                    <div style={styles.insightIcon}>

                      {getInsightIcon(
                        insight.type
                      )}

                    </div>


                    <div style={styles.insightContent}>

                      <h4 style={styles.insightTitle}>

                        {insight.title ||
                          "Financial Insight"
                        }

                      </h4>

                      <p style={styles.insightMessage}>
                        {insight.message}
                      </p>

                    </div>

                  </div>

                </Card>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
};


// ==========================================
// STYLES
// ==========================================

const styles = {

  container: {
    padding: "24px",
    maxWidth: "1200px",
    margin: "0 auto"
  },


  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "12px",
    flexWrap: "wrap"
  },


  heading: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "700"
  },


  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#666",
    fontSize: "15px"
  },


  statusContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginTop: "16px",
    marginBottom: "8px",
    flexWrap: "wrap"
  },


  cachedStatus: {
    fontSize: "14px",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#e8f5e9",
    color: "#2e7d32"
  },


  generatedStatus: {
    fontSize: "14px",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#fff3e0",
    color: "#e65100"
  },


  sourceStatus: {
    fontSize: "14px",
    color: "#666"
  },


  monthText: {
    color: "#666",
    marginBottom: "20px"
  },


  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "32px"
  },


  summaryCard: {
    display: "flex",
    alignItems: "center",
    gap: "14px"
  },


  summaryIcon: {
    fontSize: "28px"
  },


  summaryLabel: {
    margin: 0,
    color: "#666",
    fontSize: "14px"
  },


  incomeValue: {
    margin: "4px 0 0",
    fontSize: "20px"
  },


  expenseValue: {
    margin: "4px 0 0",
    fontSize: "20px"
  },


  savingsValue: {
    margin: "4px 0 0",
    fontSize: "20px"
  },


  rateValue: {
    margin: "4px 0 0",
    fontSize: "20px"
  },


  insightsSection: {
    marginTop: "10px"
  },


  sectionTitle: {
    fontSize: "21px",
    marginBottom: "16px"
  },


  insightsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "16px"
  },


  insightCard: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start"
  },


  insightIcon: {
    fontSize: "26px",
    minWidth: "32px"
  },


  insightContent: {
    flex: 1
  },


  insightTitle: {
    margin: "0 0 8px",
    fontSize: "17px"
  },


  insightMessage: {
    margin: 0,
    color: "#555",
    lineHeight: "1.6",
    fontSize: "14px"
  },


  loadingContainer: {
    textAlign: "center",
    padding: "60px 20px"
  },


  spinner: {
    fontSize: "36px",
    marginBottom: "12px"
  },


  loadingText: {
    fontSize: "17px",
    fontWeight: "600",
    marginBottom: "6px"
  },


  errorContainer: {
    textAlign: "center",
    padding: "40px 20px"
  },


  errorIcon: {
    fontSize: "36px",
    marginBottom: "10px"
  },


  errorText: {
    color: "#666",
    marginBottom: "20px"
  },


  emptyContainer: {
    textAlign: "center",
    padding: "40px 20px"
  },


  emptyIcon: {
    fontSize: "40px",
    marginBottom: "10px"
  },


  emptyText: {
    color: "#666",
    maxWidth: "500px",
    margin: "0 auto"
  }

};


export default AIInsights;