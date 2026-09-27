from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.dependency import get_current_user
from service.ai_insights_service import AIInsightsService
import traceback

router = APIRouter(prefix="/ai", tags=["AI Insights"])


# ---------------------------------------------------------
# GET AI INSIGHTS
# ---------------------------------------------------------

@router.get("/insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        service = AIInsightsService(db)

        # IMPORTANT:
        # This only reads saved insights.
        # It NEVER generates Gemini insights.
        result = service.get_or_generate_insights(
            current_user.id
        )

        return {
            "message": "AI insights retrieved successfully",
            "data": result
        }

    except Exception as e:

        print("ERROR IN GET AI INSIGHTS:")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ---------------------------------------------------------
# GENERATE AI INSIGHTS
# ---------------------------------------------------------

@router.post("/insights/generate")
def generate_ai_insights(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:


        service = AIInsightsService(db)

        # IMPORTANT:
        # This performs hash checking.
        # Gemini is called ONLY if financial data changed.
        result = service.generate_if_changed(
            current_user.id
        )

        print("AI INSIGHT GENERATION CHECK COMPLETED")
        print("========================================\n")

        return {
            "message": "AI financial insights generated successfully",
            "data": result
        }

    except Exception as e:

        print("ERROR IN GENERATE AI INSIGHTS:")
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )