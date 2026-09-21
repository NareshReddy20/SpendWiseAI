from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependency import get_current_user

from models.category import Category


router = APIRouter(
    prefix="/categories",
    tags=["Categories"]
)


@router.get("/expense")
def get_expense_categories(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        categories = (
            db.query(Category)
            .filter(Category.type == "expense")
            .order_by(Category.id)
            .all()
        )

        return {
            "message": "Expense categories fetched successfully",
            "categories": [
                {
                    "id": category.id,
                    "name": category.name
                }
                for category in categories
            ]
        }

    except Exception as e:
        print("Error in get_expense_categories:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching expense categories"
        )