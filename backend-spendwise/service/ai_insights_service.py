import hashlib
import json

from service.financial_analysis_service import (
    FinancialAnalysisService
)

from service.llm_service import (
    generate_financial_insights
)

from models.user_insight import UserInsight
from models.ai_insight_generation import AIInsightGeneration


class AIInsightsService:

    def __init__(self, db):

        self.db = db

        self.financial_service = (
            FinancialAnalysisService(db)
        )

    # --------------------------------------------------
    # CREATE FINANCIAL HASH
    # --------------------------------------------------

    def create_financial_hash(
        self,
        financial_data
    ):

        snapshot = {
            "year": financial_data["year"],
            "month": financial_data["month"],

            "summary": financial_data["summary"],

            "category_spending": (
                financial_data["category_spending"]
            ),

            "budgets": (
                financial_data["budgets"]
            ),

            "largest_transactions": (
                financial_data["largest_transactions"]
            ),

            "transaction_counts": (
                financial_data["transaction_counts"]
            )
        }

        serialized_data = json.dumps(
            snapshot,
            sort_keys=True,
            separators=(",", ":")
        )

        financial_hash = hashlib.sha256(
            serialized_data.encode("utf-8")
        ).hexdigest()

        return financial_hash

    # --------------------------------------------------
    # PYTHON DECISION INSIGHTS
    # --------------------------------------------------

    def generate_decision_insights(
        self,
        financial_data
    ):

        insights = []

        summary = financial_data["summary"]

        category_spending = (
            financial_data["category_spending"]
        )

        budgets = financial_data["budgets"]

        largest_transactions = (
            financial_data["largest_transactions"]
        )

        # ----------------------------------------------
        # Budget exceeded
        # ----------------------------------------------

        for budget in budgets:

            if (
                budget["spent"]
                > budget["budget_limit"]
            ):

                exceeded_by = (
                    budget["spent"]
                    - budget["budget_limit"]
                )

                insights.append({

                    "type": "budget_alert",

                    "title": (
                        f"{budget['category']} "
                        f"Budget Exceeded"
                    ),

                    "message": (
                        f"You spent "
                        f"₹{budget['spent']:,.2f} "
                        f"on {budget['category']} "
                        f"against a budget of "
                        f"₹{budget['budget_limit']:,.2f}. "
                        f"This exceeds the budget by "
                        f"₹{exceeded_by:,.2f}."
                    )
                })

        # ----------------------------------------------
        # Highest spending category
        # ----------------------------------------------

        if category_spending:

            highest_category = (
                category_spending[0]
            )

            insights.append({

                "type": "spending_behavior",

                "title": "Highest Spending Category",

                "message": (
                    f"{highest_category['category']} "
                    f"is your highest spending category "
                    f"this month at "
                    f"₹{highest_category['amount']:,.2f}."
                )
            })

        # ----------------------------------------------
        # Largest transaction
        # ----------------------------------------------

        if largest_transactions:

            largest_transaction = (
                largest_transactions[0]
            )

            insights.append({

                "type": "unusual_spending",

                "title": "Largest Expense",

                "message": (
                    f"Your largest expense this month "
                    f"was "
                    f"₹{largest_transaction['amount']:,.2f} "
                    f"for "
                    f"{largest_transaction['description']} "
                    f"under "
                    f"{largest_transaction['category']}."
                )
            })

        # ----------------------------------------------
        # Savings
        # ----------------------------------------------

        if summary["savings"] > 0:

            insights.append({

                "type": "positive_behavior",

                "title": "Positive Savings",

                "message": (
                    f"You currently have savings of "
                    f"₹{summary['savings']:,.2f}, "
                    f"which represents a savings rate of "
                    f"{summary['savings_percentage']:.2f}%."
                )
            })

        elif summary["savings"] < 0:

            insights.append({

                "type": "savings_opportunity",

                "title": "Expenses Exceed Income",

                "message": (
                    f"Your expenses of "
                    f"₹{summary['total_expense']:,.2f} "
                    f"are higher than your income of "
                    f"₹{summary['total_income']:,.2f} "
                    f"this month."
                )
            })

        return insights[:5]

    # --------------------------------------------------
    # FORMAT RESPONSE
    # --------------------------------------------------

    def format_result(
        self,
        financial_data,
        insights,
        source,
        cached=False
    ):

        return {

            "month": (
                f"{financial_data['year']}-"
                f"{financial_data['month']:02d}"
            ),

            "summary": (
                financial_data["summary"]
            ),

            "insights": insights,

            "source": source,

            "cached": cached
        }

    def get_or_generate_insights(self, user_id: int):
        """
        Read-only method.

        Gets the latest financial numbers and saved AI insights.
        It does NOT generate new AI insights.
        It does NOT call Gemini.
        """

        financial_data = self.financial_service.get_financial_data(user_id)

        latest_generation = (
            self.db.query(AIInsightGeneration)
            .filter(
                AIInsightGeneration.user_id == user_id
            )
            .order_by(AIInsightGeneration.id.desc())
            .first()
        )

        # No AI insights generated yet
        if not latest_generation:

            return self.format_result(
                financial_data,
                [],
                source=None,
                cached=True
            )

        # Get saved insights
        saved_insights = (
            self.db.query(UserInsight)
            .filter(
                UserInsight.generation_id == latest_generation.id
            )
            .order_by(UserInsight.id.asc())
            .all()
        )

        return self.format_result(
            financial_data,
            [
                {
                    "type": insight.insight_type,
                    "title": insight.title,
                    "message": insight.message
                }
                for insight in saved_insights
            ],
            latest_generation.source,
            cached=True
        )

    # --------------------------------------------------
    # GENERATE AND SAVE NEW INSIGHTS
    # --------------------------------------------------

    def generate_and_save_insights(
        self,
        user_id: int,
        financial_data=None,
        financial_hash=None
    ):

        # ----------------------------------------------
        # Get financial data if not provided
        # ----------------------------------------------

        if financial_data is None:

            financial_data = (
                self.financial_service
                .get_financial_data(
                    user_id
                )
            )

        # ----------------------------------------------
        # Create hash if not provided
        # ----------------------------------------------

        if financial_hash is None:

            financial_hash = (
                self.create_financial_hash(
                    financial_data
                )
            )

        # ----------------------------------------------
        # Python decision insights
        # ----------------------------------------------

        decision_insights = (
            self.generate_decision_insights(
                financial_data
            )
        )

        final_insights = (
            decision_insights
        )

        source = "python"

        # ----------------------------------------------
        # Try Gemini
        # ----------------------------------------------

        try:

            ai_result = (
                generate_financial_insights(
                    financial_data,
                    decision_insights
                )
            )

            ai_insights = (
                ai_result.get(
                    "insights",
                    []
                )
            )

            if ai_insights:

                final_insights = (
                    ai_insights
                )

                source = "gemini"

        except Exception as e:

            print(
                "Gemini unavailable."
            )

            print(
                "Using Python decision insights."
            )

            print(
                "Gemini error:",
                str(e)
            )

        # ----------------------------------------------
        # Remove previous generation
        # ----------------------------------------------

        self.db.query(
            AIInsightGeneration
        ).filter(
            AIInsightGeneration.user_id
            == user_id
        ).delete(
            synchronize_session=False
        )

        # ----------------------------------------------
        # Create new generation
        # ----------------------------------------------

        generation = AIInsightGeneration(

            user_id=user_id,

            financial_hash=(
                financial_hash
            ),

            source=source
        )

        self.db.add(generation)

        # Get generated ID
        self.db.flush()

        # ----------------------------------------------
        # Save individual insights
        # ----------------------------------------------

        for insight in final_insights:

            db_insight = UserInsight(

                user_id=user_id,

                generation_id=(
                    generation.id
                ),

                insight_type=(
                    insight.get(
                        "type",
                        "ai_analysis"
                    )
                ),

                title=(
                    insight.get(
                        "title",
                        "Financial Insight"
                    )
                ),

                message=(
                    insight.get(
                        "message",
                        ""
                    )
                ),

                source=source
            )

            self.db.add(db_insight)

        # ----------------------------------------------
        # Commit
        # ----------------------------------------------

        self.db.commit()

        return self.format_result(
            financial_data,
            final_insights,
            source,
            cached=False
        )

    def generate_if_changed(self, user_id: int):
        """
        Called only when the user clicks
        'Generate AI Insights'.

        If financial data has not changed since the last generation,
        return the saved insights without calling Gemini.

        If financial data changed, generate new insights.
        """

        financial_data = self.financial_service.get_financial_data(user_id)

        current_hash = self.create_financial_hash(financial_data)

        latest_generation = (
            self.db.query(AIInsightGeneration)
            .filter(
                AIInsightGeneration.user_id == user_id
            )
            .order_by(AIInsightGeneration.id.desc())
            .first()
        )

        # -------------------------------------------------
        # No previous generation
        # -------------------------------------------------

        if not latest_generation:

            print("NO PREVIOUS AI GENERATION")
            print(">>> GENERATING NEW AI INSIGHTS")

            return self.generate_and_save_insights(
                user_id,
                financial_data,
                current_hash
            )

        # -------------------------------------------------
        # Financial data has NOT changed
        # -------------------------------------------------

        if latest_generation.financial_hash == current_hash:

            print("AI FINANCIAL DATA HAS NOT CHANGED")
            print(">>> USING SAVED AI INSIGHTS")
            print(">>> GEMINI WILL NOT BE CALLED")

            saved_insights = (
                self.db.query(UserInsight)
                .filter(
                    UserInsight.generation_id == latest_generation.id
                )
                .order_by(UserInsight.id.asc())
                .all()
            )

            return self.format_result(
                financial_data,
                [
                    {
                        "type": insight.insight_type,
                        "title": insight.title,
                        "message": insight.message
                    }
                    for insight in saved_insights
                ],
                latest_generation.source,
                cached=True
            )

        # -------------------------------------------------
        # Financial data HAS changed
        # -------------------------------------------------

        print("AI FINANCIAL DATA HAS CHANGED")
        print("OLD HASH:", latest_generation.financial_hash)
        print("NEW HASH:", current_hash)

        print(">>> GENERATING NEW AI INSIGHTS")

        return self.generate_and_save_insights(
            user_id,
            financial_data,
            current_hash
        )