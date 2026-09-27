from sqlalchemy import Column, Integer, String, DateTime, Boolean, DECIMAL, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    currency = Column(String(10), nullable=False, default="INR")
    phone = Column(String(20), nullable=True)
    occupation = Column(String(100), nullable=True)
    age = Column(Integer, nullable=True)
    monthly_income_target = Column(DECIMAL(12, 2), nullable=True, default=0.00)
    savings_goal = Column(DECIMAL(12, 2), nullable=True, default=0.00)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    ai_results = relationship("TransactionAIResult", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("AIChatHistory", back_populates="user", cascade="all, delete-orphan")
    insights = relationship("UserInsight", back_populates="user", cascade="all, delete-orphan")
    insight_generations = relationship(
    "AIInsightGeneration",
    back_populates="user",
    cascade="all, delete-orphan"
)