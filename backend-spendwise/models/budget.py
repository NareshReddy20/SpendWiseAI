from sqlalchemy import Column, Integer, DateTime, DECIMAL, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False)
    monthly_limit = Column(DECIMAL(12, 2), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="budgets")
    category = relationship("Category", back_populates="budgets")

    # Constraints
    __table_args__ = (
        UniqueConstraint('user_id', 'category_id', 'year', 'month', name='uq_budget_user_category_month'),
        CheckConstraint("monthly_limit > 0", name='chk_budget_limit_positive'),
        CheckConstraint("month BETWEEN 1 AND 12", name='chk_budget_month_range'),
        CheckConstraint("year >= 2000", name='chk_budget_year_valid'),
    )

