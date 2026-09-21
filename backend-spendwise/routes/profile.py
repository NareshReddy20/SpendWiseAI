from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from core.database import get_db
from core.dependency import get_current_user

from models.user import User
from models.transaction import Transaction

from schemas.profile import ProfileUpdateSchema

router = APIRouter(
    prefix="/profile",
    tags=["Profile"]
)

@router.get("/")
def get_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user = (
            db.query(User)
            .filter(User.id == current_user.id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        return {
            "message": "Profile fetched successfully",
            "profile": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "currency": user.currency,
                "monthly_income_target": user.monthly_income_target,
                "savings_goal": user.savings_goal
            }
        }

    except HTTPException:
        raise

    except Exception as e:
        print("Error in get_profile:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching profile"
        )

@router.put("/update")
def update_profile(
    profile: ProfileUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user = (
            db.query(User)
            .filter(User.id == current_user.id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        user.name = profile.name
        user.currency = profile.currency
        user.monthly_income_target = profile.monthly_income_target
        user.savings_goal = profile.savings_goal

        db.commit()
        db.refresh(user)

        return {
            "message": "Profile updated successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in update_profile:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error updating profile"
        )

@router.get("/summary")
def get_account_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        total_transactions = (
            db.query(Transaction)
            .filter(Transaction.user_id == user_id)
            .count()
        )

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

        current_balance = total_income - total_expenses

        return {
            "message": "Account summary fetched successfully",
            "summary": {
                "account_type": "Personal",
                "total_transactions": total_transactions,
                "total_income": total_income,
                "total_expenses": total_expenses,
                "current_balance": current_balance
            }
        }

    except Exception as e:
        print("Error in get_account_summary:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching account summary"
        )