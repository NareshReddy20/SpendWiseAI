from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.dependency import get_current_user

from models.transaction import Transaction
from models.category import Category
from models.budget import Budget


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

@router.get("/")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        # =====================================
        # TOTAL INCOME
        # =====================================

        total_income = (
            db.query(
                func.coalesce(func.sum(Transaction.amount), 0)
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "income"
            )
            .scalar()
        )

        # =====================================
        # TOTAL EXPENSES
        # =====================================

        total_expenses = (
            db.query(
                func.coalesce(func.sum(Transaction.amount), 0)
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense"
            )
            .scalar()
        )

        # =====================================
        # TOTAL BALANCE / SAVINGS
        # =====================================

        total_balance = total_income - total_expenses
        total_savings = total_income - total_expenses

        # =====================================
        # INCOME VS EXPENSES
        # =====================================

        income_vs_expenses = [
            {
                "type": "Income",
                "amount": total_income
            },
            {
                "type": "Expenses",
                "amount": total_expenses
            },
            {
                "type": "Savings",
                "amount": total_savings
            }
        ]

        # =====================================
        # EXPENSE BY CATEGORY
        # =====================================

        category_data = (
            db.query(
                Category.name,
                func.sum(Transaction.amount).label("amount")
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
            .order_by(func.sum(Transaction.amount).desc())
            .all()
        )

        expense_by_category = []

        for category_name, amount in category_data:
            expense_by_category.append({
                "category": category_name,
                "amount": amount
            })

        # =====================================
        # AI INSIGHT
        # =====================================

        ai_insight = None

        if category_data:
            highest_category = category_data[0]

            ai_insight = (
                f"{highest_category[0]} is your highest spending "
                f"category at ₹{highest_category[1]}."
            )

        # =====================================
        # RECENT TRANSACTIONS
        # =====================================

        recent_transactions = (
            db.query(
                Transaction,
                Category.name.label("category_name")
            )
            .join(
                Category,
                Transaction.category_id == Category.id
            )
            .filter(
                Transaction.user_id == user_id
            )
            .order_by(Transaction.date.desc(), Transaction.id.desc())
            .limit(5)
            .all()
        )

        transaction_list = []

        for transaction, category_name in recent_transactions:
            transaction_list.append({
                "id": transaction.id,
                "description": transaction.description,
                "category": category_name,
                "amount": transaction.amount,
                "type": transaction.type,
                "date": transaction.date
            })

        # =====================================
        # BUDGET OVERVIEW
        # =====================================

        from datetime import date

        today = date.today()
        year = today.year
        month = today.month

        budgets = (
            db.query(
                Budget,
                Category.name.label("category_name")
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
            .order_by(Category.name)
            .all()
        )

        budget_list = []

        for budget, category_name in budgets:

            spent = (
                db.query(
                    func.coalesce(func.sum(Transaction.amount), 0)
                )
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.category_id == budget.category_id,
                    Transaction.type == "expense",
                    func.extract("year", Transaction.date) == year,
                    func.extract("month", Transaction.date) == month
                )
                .scalar()
            )

            percentage = (
                (spent / budget.monthly_limit) * 100
                if budget.monthly_limit > 0
                else 0
            )

            if percentage > 100:
                percentage = 100

            budget_list.append({
                "id": budget.id,
                "category": category_name,
                "spent": spent,
                "monthly_limit": budget.monthly_limit,
                "percentage": percentage
            })

        # =====================================
        # FINAL RESPONSE
        # =====================================

        return {
            "message": "Dashboard fetched successfully",

            "summary": {
                "total_balance": total_balance,
                "total_income": total_income,
                "total_expenses": total_expenses,
                "total_savings": total_savings
            },

            "income_vs_expenses": income_vs_expenses,

            "expense_by_category": expense_by_category,

            "ai_insight": ai_insight,

            "recent_transactions": transaction_list,

            "budget_overview": budget_list
        }

    except Exception as e:
        print("Error in get_dashboard:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching dashboard"
        )