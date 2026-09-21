from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from core.database import get_db
from core.dependency import get_current_user

from models.budget import Budget
from models.category import Category
from models.transaction import Transaction

from schemas.budget import BudgetCreateSchema, BudgetDeleteSchema, BudgetUpdateSchema
router = APIRouter(
    prefix="/budgets",
    tags=["Budgets"]
)

@router.get("/")
def get_budgets(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        today = date.today()
        year = today.year
        month = today.month

        budgets = (
            db.query(Budget, Category.name.label("category_name"))
            .join(Category, Budget.category_id == Category.id)
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
                db.query(func.coalesce(func.sum(Transaction.amount), 0))
                .filter(
                    Transaction.user_id == user_id,
                    Transaction.category_id == budget.category_id,
                    Transaction.type == "expense",
                    func.extract("year", Transaction.date) == year,
                    func.extract("month", Transaction.date) == month
                )
                .scalar()
            )

            remaining = budget.monthly_limit - spent

            percentage = (
                (spent / budget.monthly_limit) * 100
                if budget.monthly_limit > 0
                else 0
            )

            if percentage > 100:
                percentage = 100

            status = (
                "Over Budget"
                if spent > budget.monthly_limit
                else "Under Budget"
            )

            budget_list.append({
                "id": budget.id,
                "category": category_name,
                "monthly_limit": budget.monthly_limit,
                "spent": spent,
                "remaining": remaining,
                "percentage": percentage,
                "status": status
            })

        return {
            "message": "Budgets fetched successfully",
            "budgets": budget_list
        }

    except Exception as e:
        print("Error in get_budgets:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching budgets"
        )


@router.post("/add")
def add_budget(
    budget: BudgetCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        today = date.today()
        year = today.year
        month = today.month

        category = (
            db.query(Category)
            .filter(
                Category.name.ilike(budget.category),
                Category.type == "expense"
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Invalid expense category"
            )

        existing_budget = (
            db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.category_id == category.id,
                Budget.year == year,
                Budget.month == month
            )
            .first()
        )

        if existing_budget:
            raise HTTPException(
                status_code=400,
                detail="Budget already exists for this category"
            )

        new_budget = Budget(
            user_id=user_id,
            category_id=category.id,
            monthly_limit=budget.monthly_limit,
            year=year,
            month=month
        )

        db.add(new_budget)
        db.commit()
        db.refresh(new_budget)

        return {
            "message": "Budget added successfully",
            "budget_id": new_budget.id
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in add_budget:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error adding budget"
        )

@router.put("/update")
def update_budget(
    budget: BudgetUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        existing_budget = (
            db.query(Budget)
            .filter(
                Budget.id == budget.budget_id,
                Budget.user_id == user_id
            )
            .first()
        )

        if not existing_budget:
            raise HTTPException(
                status_code=404,
                detail="Budget not found"
            )

        category = (
            db.query(Category)
            .filter(
                Category.name.ilike(budget.category),
                Category.type == "expense"
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Invalid expense category"
            )

        duplicate_budget = (
            db.query(Budget)
            .filter(
                Budget.user_id == user_id,
                Budget.category_id == category.id,
                Budget.year == existing_budget.year,
                Budget.month == existing_budget.month,
                Budget.id != budget.budget_id
            )
            .first()
        )

        if duplicate_budget:
            raise HTTPException(
                status_code=400,
                detail="Budget already exists for this category"
            )

        existing_budget.category_id = category.id
        existing_budget.monthly_limit = budget.monthly_limit

        db.commit()
        db.refresh(existing_budget)

        return {
            "message": "Budget updated successfully",
            "budget_id": existing_budget.id
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in update_budget:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error updating budget"
        )

@router.delete("/delete")
def delete_budget(
    budget: BudgetDeleteSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        existing_budget = (
            db.query(Budget)
            .filter(
                Budget.id == budget.budget_id,
                Budget.user_id == user_id
            )
            .first()
        )

        if not existing_budget:
            raise HTTPException(
                status_code=404,
                detail="Budget not found"
            )

        db.delete(existing_budget)
        db.commit()

        return {
            "message": "Budget deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in delete_budget:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error deleting budget"
        )