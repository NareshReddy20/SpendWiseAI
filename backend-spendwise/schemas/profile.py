from pydantic import BaseModel
from decimal import Decimal


class ProfileUpdateSchema(BaseModel):
    name: str
    currency: str
    monthly_income_target: Decimal | None = None
    savings_goal: Decimal | None = None