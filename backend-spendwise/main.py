from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from core.database import engine, create_tables
from core.config import settings

from routes.auth import router as auth_router
from routes.transactions import router as transactions_router
from routes.categories import router as categories_router
from routes.budgets import router as budgets_router
from routes.reports import router as reports_router
from routes.profile import router as profile_router
from routes.dashboard import router as dashboard_router
from routes.ai_insights import router as ai_insights_router
from routes.ai_expense import router as ai_expense_router

# Import models so they are registered with Base
from models.user import (User)
from models.category import (Category)
from models.budget import Budget
from models.transaction import Transaction
from models.transaction_ai_result import TransactionAIResult
from models.ai_chat_history import AIChatHistory
from models.user_insight import UserInsight


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting SpendWise AI Backend...")
    print("Creating database tables...")
    create_tables()
    print("Database setup complete!")
    yield
    # yield tells FastAPI: "Startup is finished; now run the application. When the application stops, continue from here.
    print("Shutting down SpendWise AI Backend...")

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(transactions_router)
app.include_router(categories_router)
app.include_router(budgets_router)
app.include_router(reports_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(ai_insights_router)
app.include_router(ai_expense_router)

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }

# Import and include routers (will be added in Phase 3)
# from routes.auth import router as auth_router
# from routes.transactions import router as transaction_router
# from routes.budgets import router as budget_router
# from routes.ai import router as ai_router
# from routes.profile import router as profile_router
# from routes.reports import router as reports_router

# app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
# app.include_router(transaction_router, prefix="/api/transactions", tags=["Transactions"])
# app.include_router(budget_router, prefix="/api/budgets", tags=["Budgets"])
# app.include_router(ai_router, prefix="/api/ai", tags=["AI"])
# app.include_router(profile_router, prefix="/api/profile", tags=["Profile"])
# app.include_router(reports_router, prefix="/api/reports", tags=["Reports"])