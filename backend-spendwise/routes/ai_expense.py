from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependency import get_current_user

from schemas.ai_expense import (
    AIExpenseParseRequest,
    AIExpenseParseResponse,
    AIExpenseConfirmRequest,
    AIExpenseConfirmResponse
)

from service.ai_expense_parser_service import (
    AIExpenseParserService
)


router = APIRouter(
    prefix="/ai",
    tags=["AI Expense Parser"]
)


# =========================================================
# PARSE TRANSACTION
# =========================================================

@router.post(
    "/parse-expense",
    response_model=AIExpenseParseResponse
)
def parse_expense(
    request: AIExpenseParseRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        service = AIExpenseParserService(db)

        result = service.parse_transaction(
            user_id=current_user.id,
            text=request.text,
            transaction_type=request.transaction_type
        )

        return {
            "amount": result.parsed_amount,
            "category": result.parsed_category,
            "description": result.parsed_description,
            "date": result.parsed_date,
            "payment_method": result.parsed_payment_method,
            "confidence_score": result.confidence_score,
            "transaction_type": request.transaction_type
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print(
            "Error in parse_expense:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Error parsing transaction."
        )


# =========================================================
# CONFIRM TRANSACTION
# =========================================================

@router.post(
    "/confirm-expense",
    response_model=AIExpenseConfirmResponse
)
def confirm_expense(
    request: AIExpenseConfirmRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    try:

        service = AIExpenseParserService(db)

        transaction = service.confirm_transaction(
            user_id=current_user.id,
            amount=request.amount,
            category=request.category,
            description=request.description,
            transaction_date=request.date,
            payment_method=request.payment_method,
            transaction_type=request.transaction_type
        )

        return {
            "message": "Transaction saved successfully",
            "transaction_id": transaction.id
        }

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception as e:

        print(
            "Error in confirm_expense:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Error saving transaction."
        )