from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from core.database import Base


class AIInsightGeneration(Base):

    __tablename__ = "ai_insight_generations"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True
    )

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    financial_hash = Column(
        String(64),
        nullable=False
    )

    source = Column(
        String(20),
        nullable=False
    )

    generated_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="insight_generations"
    )

    insights = relationship(
        "UserInsight",
        back_populates="generation",
        cascade="all, delete-orphan"
    )