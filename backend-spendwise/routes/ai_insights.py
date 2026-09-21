from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.dependency import get_current_user

from service.financial_analysis_service import FinancialAnalysisService


router = APIRouter(
    prefix="/ai",
    tags=["AI Insights"]
)


@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        service = FinancialAnalysisService(db)

        insights = service.generate_rule_based_insights(
            user_id
        )

        return {
            "message": "AI financial insights fetched successfully",
            "data": insights
        }

    except Exception as e:
        print("Error in get_ai_insights:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error generating AI financial insights"
        )