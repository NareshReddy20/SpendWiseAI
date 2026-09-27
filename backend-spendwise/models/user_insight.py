from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Text,
    ForeignKey
)

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from core.database import Base


class UserInsight(Base):

    __tablename__ = "user_insights"

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

    generation_id = Column(
        Integer,
        ForeignKey(
            "ai_insight_generations.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    insight_type = Column(
        String(50),
        nullable=False
    )

    title = Column(
        String(255),
        nullable=False
    )

    message = Column(
        Text,
        nullable=False
    )

    source = Column(
        String(20),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="insights"
    )

    generation = relationship(
        "AIInsightGeneration",
        back_populates="insights"
    )