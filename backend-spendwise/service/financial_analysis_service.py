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

    def get_financial_data(self, user_id: int):

        today = date.today()
        year = today.year
        month = today.month

        # ==================================================
        # 1. TOTAL INCOME
        # ==================================================
        # Same logic as Dashboard.
        # Includes all income transactions.

        total_income = (
            self.db.query(
                func.coalesce(
                    func.sum(Transaction.amount),
                    0
                )
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "income"
            )
            .scalar()
        )
        
        # ==================================================
        # 2. TOTAL EXPENSE
        # ==================================================
        # Same logic as Dashboard.
        # Includes all expense transactions.

        total_expense = (
            self.db.query(
                func.coalesce(
                    func.sum(Transaction.amount),
                    0
                )
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense"
            )
            .scalar()
        )
       
        total_income = Decimal(str(total_income))
        total_expense = Decimal(str(total_expense))

        savings = total_income - total_expense

        if total_income > 0:
            savings_percentage = (
                savings / total_income
            ) * Decimal("100")
        else:
            savings_percentage = Decimal("0")

        # ==================================================
        # 3. CATEGORY SPENDING
        # ==================================================
        # Same logic as Dashboard.
        # Includes all expense transactions.

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
                Transaction.type == "expense"
            )
            .group_by(Category.name)
            .order_by(
                func.sum(
                    Transaction.amount
                ).desc()
            )
            .all()
        )

        category_spending = []

        for category_name, amount in category_data:

            category_spending.append({
                "category": category_name,
                "amount": float(amount)
            })

        # ==================================================
        # 4. BUDGET DATA
        # ==================================================
        # Budgets remain monthly because budgets belong
        # to a specific year and month.

        budgets = (
            self.db.query(
                Budget,
                Category.name
            )
            .join(
                Category,
                Budget.category_id == Category.id
            )
            .filter(
                Budget.user_id == user_id,
                Budget.year == year,
                Budget.month == month
            )
            .all()
        )

        budget_data = []

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

                    # Budget spending is still
                    # calculated for the current month.
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

            spent = Decimal(str(spent))

            limit = Decimal(
                str(budget.monthly_limit)
            )

            budget_data.append({
                "category": category_name,
                "budget_limit": float(limit),
                "spent": float(spent),
                "remaining": float(
                    limit - spent
                )
            })

        # ==================================================
        # 5. LARGEST TRANSACTIONS
        # ==================================================
        # Same financial scope as Dashboard:
        # all expense transactions.

        largest_transactions = (
            self.db.query(
                Transaction,
                Category.name
            )
            .join(
                Category,
                Transaction.category_id
                == Category.id
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense"
            )
            .order_by(
                Transaction.amount.desc()
            )
            .limit(5)
            .all()
        )

        largest_transaction_data = []

        for transaction, category_name in (
            largest_transactions
        ):

            largest_transaction_data.append({
                "date": str(transaction.date),
                "category": category_name,
                "amount": float(
                    transaction.amount
                ),
                "description": (
                    transaction.description
                ),
                "payment_method": (
                    transaction.payment_method
                )
            })

        # ==================================================
        # 6. TRANSACTION COUNTS
        # ==================================================
        # Same scope as Dashboard:
        # all transactions.

        expense_count = (
            self.db.query(
                func.count(Transaction.id)
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense"
            )
            .scalar()
        )

        income_count = (
            self.db.query(
                func.count(Transaction.id)
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "income"
            )
            .scalar()
        )

        # ==================================================
        # FINAL FINANCIAL DATA
        # ==================================================

        return {

            "year": year,

            "month": month,

            "summary": {

                "total_income":
                    float(total_income),

                "total_expense":
                    float(total_expense),

                "savings":
                    float(savings),

                "savings_percentage":
                    float(savings_percentage)
            },

            "category_spending":
                category_spending,

            "budgets":
                budget_data,

            "largest_transactions":
                largest_transaction_data,

            "transaction_counts": {

                "income":
                    income_count,

                "expense":
                    expense_count
            }
        }