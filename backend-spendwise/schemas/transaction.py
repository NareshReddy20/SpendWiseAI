
from decimal import Decimal
from datetime import date
from pydantic import BaseModel

class TransactionFilterSchema(BaseModel):
    search: str | None = None
    category: str | None = None
    type: str | None = None
    page: int = 1
    limit: int = 5

class ExpenseCreateSchema(BaseModel):
    amount: Decimal
    description: str
    category: str
    date: date
    payment_method: str | None = None
    notes: str | None = None

class IncomeCreateSchema(BaseModel):
    amount: Decimal
    description: str
    category: str
    date: date
    payment_method: str | None = None
    notes: str | None = None

class TransactionUpdateSchema(BaseModel):
    description: str
    amount: Decimal
    category: str
    type: str
    date: date
    payment_method: str | None = None
    notes: str | None = None


