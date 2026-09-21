from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.dependency import get_current_user

from models.transaction import Transaction
from models.category import Category

from schemas.report import ReportFilterSchema

router = APIRouter(
    prefix="/reports",
    tags=["Reports"]
)

@router.post("/")
def get_report(
    filters: ReportFilterSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        month = filters.month
        year = filters.year

        # =========================
        # MONTHLY INCOME
        # =========================

        monthly_income = (
            db.query(
                func.coalesce(func.sum(Transaction.amount), 0)
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "income",
                func.extract("month", Transaction.date) == month,
                func.extract("year", Transaction.date) == year
            )
            .scalar()
        )

        # =========================
        # MONTHLY EXPENSES
        # =========================

        monthly_expenses = (
            db.query(
                func.coalesce(func.sum(Transaction.amount), 0)
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                func.extract("month", Transaction.date) == month,
                func.extract("year", Transaction.date) == year
            )
            .scalar()
        )

        # =========================
        # SAVINGS
        # =========================

        savings = monthly_income - monthly_expenses

        # =========================
        # CATEGORY-WISE SPENDING
        # =========================

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
                Transaction.type == "expense",
                func.extract("month", Transaction.date) == month,
                func.extract("year", Transaction.date) == year
            )
            .group_by(Category.name)
            .order_by(func.sum(Transaction.amount).desc())
            .all()
        )

        category_wise_spending = []

        for category_name, amount in category_data:
            category_wise_spending.append({
                "category": category_name,
                "amount": amount
            })

        # =========================
        # MONTHLY SPENDING TREND
        # =========================

        monthly_trend = []

        for i in range(5, -1, -1):

            trend_month = month - i
            trend_year = year

            while trend_month <= 0:
                trend_month += 12
                trend_year -= 1

            expense = (
                db.query(
                    func.coalesce(func.sum(Transaction.amount), 0)
                )
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.type == "expense",
                    func.extract(
                        "month",
                        Transaction.date
                    ) == trend_month,
                    func.extract(
                        "year",
                        Transaction.date
                    ) == trend_year
                )
                .scalar()
            )

            monthly_trend.append({
                "month": trend_month,
                "year": trend_year,
                "expenses": expense
            })

        return {
            "message": "Report fetched successfully",
            "month": month,
            "year": year,
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "savings": savings,
            "category_wise_spending": category_wise_spending,
            "monthly_spending_trend": monthly_trend
        }

    except Exception as e:
        print("Error in get_report:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching report"
        )