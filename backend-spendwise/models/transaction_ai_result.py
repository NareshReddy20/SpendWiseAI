from sqlalchemy import Column, Integer, String, DateTime, DECIMAL, Date, Text, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class TransactionAIResult(Base):
    __tablename__ = "transaction_ai_results"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    original_text = Column(Text, nullable=False)
    parsed_amount = Column(DECIMAL(12, 2), nullable=False)
    parsed_category = Column(String(50), nullable=False)
    parsed_description = Column(String(255), nullable=False)
    parsed_date = Column(Date, nullable=False)
    parsed_payment_method = Column(String(50), nullable=True)
    confidence_score = Column(DECIMAL(5, 2), nullable=True)
    was_confirmed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="ai_results")
    transaction = relationship("Transaction", back_populates="ai_result")