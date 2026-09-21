from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class AIExpenseParseRequest(BaseModel):
    text: str
    transaction_type: str


class AIExpenseParseResponse(BaseModel):
    amount: Decimal
    category: str
    description: str
    date: date
    payment_method: str | None = None
    confidence_score: Decimal
    transaction_type: str

class AIExpenseConfirmRequest(BaseModel):
    amount: Decimal
    category: str
    description: str
    date: date
    payment_method: str | None = None
    transaction_type: str


class AIExpenseConfirmResponse(BaseModel):
    message: str
    transaction_id: int