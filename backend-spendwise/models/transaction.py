from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, Date, Boolean, Text, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    description = Column(String(255), nullable=False)
    amount = Column(DECIMAL(12, 2), nullable=False)
    type = Column(String(10), nullable=False)
    date = Column(Date, nullable=False)
    payment_method = Column(String(50), nullable=True, default="Other")
    notes = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    category = relationship("Category", back_populates="transactions")
    ai_result = relationship("TransactionAIResult", back_populates="transaction", uselist=False, cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        CheckConstraint("amount > 0", name='chk_transaction_amount_positive'),
        CheckConstraint("type IN ('income', 'expense')", name='chk_transaction_type'),
        CheckConstraint(
            "payment_method IN ('Cash', 'Credit Card', 'UPI', 'Bank Transfer', 'Other')",
            name='chk_transaction_payment_method'
        ),
    )

