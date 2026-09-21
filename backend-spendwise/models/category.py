from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(50), nullable=False)
    type = Column(String(10), nullable=False)
    icon = Column(String(50), nullable=True)
    color = Column(String(20), nullable=True)
    is_system = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    transactions = relationship("Transaction", back_populates="category")
    budgets = relationship("Budget", back_populates="category")

    # Constraints
    __table_args__ = (
        UniqueConstraint('name', 'type', name='uq_category_name_type'),
        CheckConstraint("type IN ('income', 'expense')", name='chk_category_type'),
    )
