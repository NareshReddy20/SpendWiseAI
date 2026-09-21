from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.transaction import Transaction
from models.category import Category
from models.budget import Budget


class FinancialAnalysisService:

    def __init__(self, db: Session):
        self.db = db

    def get_monthly_financial_data(self, user_id: int):

        today = date.today()

        year = today.year
        month = today.month

        # =====================================
        # TOTAL INCOME
        # =====================================

        total_income = (
            self.db.query(
                func.coalesce(
                    func.sum(Transaction.amount),
                    0
                )
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "income",
                func.extract(
                    "year",
                    Transaction.date
                ) == year,
                func.extract(
                    "month",
                    Transaction.date
                ) == month
            )
            .scalar()
        )

        # =====================================
        # TOTAL EXPENSES
        # =====================================

        total_expense = (
            self.db.query(
                func.coalesce(
                    func.sum(Transaction.amount),
                    0
                )
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                func.extract(
                    "year",
                    Transaction.date
                ) == year,
                func.extract(
                    "month",
                    Transaction.date
                ) == month
            )
            .scalar()
        )

        # =====================================
        # SAVINGS
        # =====================================

        total_income = Decimal(str(total_income))
        total_expense = Decimal(str(total_expense))

        savings = total_income - total_expense

        # =====================================
        # SAVINGS PERCENTAGE
        # =====================================

        if total_income > 0:

            savings_percentage = (
                savings / total_income
            ) * Decimal("100")

        else:

            savings_percentage = Decimal("0")

        # =====================================
        # EXPENSE BY CATEGORY
        # =====================================

        category_data = (
            self.db.query(
                Category.name,
                func.sum(
                    Transaction.amount
                ).label("amount")
            )
            .join(
                Transaction,
                Transaction.category_id == Category.id
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                func.extract(
                    "year",
                    Transaction.date
                ) == year,
                func.extract(
                    "month",
                    Transaction.date
                ) == month
            )
            .group_by(Category.name)
            .order_by(
                func.sum(
                    Transaction.amount
                ).desc()
            )
            .all()
        )

        return {
            "year": year,
            "month": month,
            "total_income": total_income,
            "total_expense": total_expense,
            "savings": savings,
            "savings_percentage": savings_percentage,
            "category_data": category_data
        }

    # =========================================
    # RULE-BASED AI INSIGHTS
    # =========================================

    def generate_rule_based_insights(
        self,
        user_id: int
    ):

        data = self.get_monthly_financial_data(
            user_id
        )

        total_income = data["total_income"]
        total_expense = data["total_expense"]
        savings = data["savings"]
        savings_percentage = data["savings_percentage"]
        category_data = data["category_data"]

        insights = []

        # =====================================
        # 1. HIGHEST SPENDING CATEGORY
        # =====================================

        if len(category_data) >= 1:

            highest_category = category_data[0]

            category_name = highest_category[0]
            amount = highest_category[1]

            insights.append({
                "type": "highest_spending",
                "category": category_name,
                "amount": float(amount),
                "message": (
                    f"{category_name} is your highest "
                    f"spending category at "
                    f"₹{amount:,.2f}."
                )
            })

        # =====================================
        # 2. SECOND HIGHEST CATEGORY
        # =====================================

        if len(category_data) >= 2:

            second_category = category_data[1]

            category_name = second_category[0]
            amount = second_category[1]

            insights.append({
                "type": "second_highest_spending",
                "category": category_name,
                "amount": float(amount),
                "message": (
                    f"{category_name} is your "
                    f"second-highest expense category "
                    f"at ₹{amount:,.2f}."
                )
            })

        # =====================================
        # 3. SAVINGS INSIGHT
        # =====================================

        if total_income > 0:

            if savings > 0:

                insights.append({
                    "type": "savings",
                    "amount": float(savings),
                    "percentage": float(
                        savings_percentage
                    ),
                    "message": (
                        f"Great job! You're saving "
                        f"{savings_percentage:.0f}% "
                        f"of your income."
                    )}
                )

            elif savings == 0:

                insights.append({
                    "type": "no_savings",
                    "amount": 0,
                    "percentage": 0,
                    "message": (
                        "Your income and expenses are "
                        "equal this month. Try to save "
                        "a portion of your income."
                    )
                })

            else:

                insights.append({
                    "type": "overspending",
                    "amount": float(
                        abs(savings)
                    ),
                    "percentage": float(
                        savings_percentage
                    ),
                    "message": (
                        f"Your expenses are higher than "
                        f"your income by "
                        f"₹{abs(savings):,.2f} this month."
                    )
                })

        # =====================================
        # 4. BUDGET INSIGHTS
        # =====================================

        today = date.today()

        budgets = (
            self.db.query(
                Budget,
                Category.name.label(
                    "category_name"
                )
            )
            .join(
                Category,
                Budget.category_id == Category.id
            )
            .filter(
                Budget.user_id == user_id,
                Budget.year == today.year,
                Budget.month == today.month
            )
            .all()
        )

        for budget, category_name in budgets:

            spent = (
                self.db.query(
                    func.coalesce(
                        func.sum(
                            Transaction.amount
                        ),
                        0
                    )
                )
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.category_id
                    == budget.category_id,
                    Transaction.type == "expense",
                    func.extract(
                        "year",
                        Transaction.date
                    ) == today.year,
                    func.extract(
                        "month",
                        Transaction.date
                    ) == today.month
                )
                .scalar()
            )

            spent = Decimal(str(spent))
            limit = Decimal(
                str(budget.monthly_limit)
            )

            if limit > 0:

                percentage = (
                    spent / limit
                ) * Decimal("100")

                # Budget exceeded
                if percentage > 100:

                    exceeded_amount = (
                        spent - limit
                    )

                    insights.append({
                        "type": "budget_exceeded",
                        "category": category_name,
                        "amount": float(
                            exceeded_amount
                        ),
                        "message": (
                            f"You've exceeded your "
                            f"{category_name} budget by "
                            f"₹{exceeded_amount:,.2f}."
                        )}
                    )

                # Budget almost exceeded
                elif percentage >= 80:

                    remaining = limit - spent

                    insights.append({
                        "type": "budget_warning",
                        "category": category_name,
                        "amount": float(
                            remaining
                        ),
                        "message": (
                            f"You're using "
                            f"{percentage:.0f}% of your "
                            f"{category_name} budget. "
                            f"₹{remaining:,.2f} remains."
                        )
                    })

        # =====================================
        # NO DATA
        # =====================================

        if not insights:

            insights.append({
                "type": "no_data",
                "message": (
                    "Add some income or expense "
                    "transactions to receive "
                    "financial insights."
                )
            })

        # =====================================
        # FINAL RESPONSE
        # =====================================

        return {
            "month": f"{data['year']}-{data['month']:02d}",

            "summary": {
                "total_income": float(
                    total_income
                ),
                "total_expense": float(
                    total_expense
                ),
                "savings": float(
                    savings
                ),
                "savings_percentage": float(
                    savings_percentage
                )
            },

            "insights": insights,

            "source": "rule_based"
        }