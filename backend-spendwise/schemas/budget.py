from pydantic import BaseModel
from decimal import Decimal


class BudgetCreateSchema(BaseModel):
    category: str
    monthly_limit: Decimal

class BudgetUpdateSchema(BaseModel):
    budget_id: int
    category: str
    monthly_limit: Decimal

class BudgetDeleteSchema(BaseModel):
    budget_id: int