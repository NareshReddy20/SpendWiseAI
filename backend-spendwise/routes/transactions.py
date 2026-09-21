from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from schemas.transaction import TransactionFilterSchema, ExpenseCreateSchema, IncomeCreateSchema, TransactionUpdateSchema
from core.database import get_db
from core.dependency import get_current_user

from models import Transaction, Category


router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


# Get transactions
@router.get("/")
def get_transactions(
    page: int = 1,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        user_id = current_user.id

        # Get total transactions
        total_transactions = (
            db.query(Transaction)
            .filter(Transaction.user_id == user_id)
            .count()
        )

        # Calculate offset
        offset = (page - 1) * limit

        # Get transactions
        transactions = (
            db.query(Transaction, Category.name.label("category_name"))
            .join(Category, Transaction.category_id == Category.id)
            .filter(Transaction.user_id == user_id)
            .order_by(Transaction.date.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        transaction_list = []

        for transaction, category_name in transactions:

            transaction_list.append({
                "id": transaction.id,
                "description": transaction.description,
                "amount": transaction.amount,
                "category": category_name,
                "type": transaction.type,
                "date": transaction.date,
                "payment_method": transaction.payment_method,
                "notes": transaction.notes
            })

        total_pages = (total_transactions + limit - 1) // limit

        return {
            "message": "Transactions fetched successfully",
            "transactions": transaction_list,
            "page": page,
            "limit": limit,
            "total_transactions": total_transactions,
            "total_pages": total_pages
        }

    except Exception as e:

        print("Error in get_transactions:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error fetching transactions"
        )


# Filter transactions
@router.post("/filter")
def filter_transactions(
    filters: TransactionFilterSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        user_id = current_user.id

        search = filters.search
        category = filters.category
        transaction_type = filters.type
        page = filters.page
        limit = filters.limit

        # Base query
        transaction_query = (
            db.query(Transaction, Category.name.label("category_name"))
            .join(Category, Transaction.category_id == Category.id)
            .filter(Transaction.user_id == user_id)
        )

        # Search filter
        if search:
            transaction_query = transaction_query.filter(
                Transaction.description.ilike(f"%{search}%")
            )

        # Category filter
        if category and category.lower() != "all":
            transaction_query = transaction_query.filter(
                Category.name.ilike(category)
            )

        # Type filter
        if transaction_type and transaction_type.lower() != "all":
            transaction_query = transaction_query.filter(
                Transaction.type.ilike(transaction_type)
            )

        # Total filtered transactions
        total_transactions = transaction_query.count()

        # Pagination
        offset = (page - 1) * limit

        transactions = (
            transaction_query
            .order_by(Transaction.date.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

        transaction_list = []

        for transaction, category_name in transactions:

            transaction_list.append({
                "id": transaction.id,
                "description": transaction.description,
                "amount": transaction.amount,
                "category": category_name,
                "type": transaction.type,
                "date": transaction.date,
                "payment_method": transaction.payment_method
            })

        total_pages = (total_transactions + limit - 1) // limit

        return {
            "message": "Transactions filtered successfully",
            "transactions": transaction_list,
            "page": page,
            "limit": limit,
            "total_transactions": total_transactions,
            "total_pages": total_pages
        }

    except Exception as e:

        print("Error in filter_transactions:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error filtering transactions"
        )

@router.post("/expense")
def add_expense(
    expense: ExpenseCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        category = (
            db.query(Category)
            .filter(
                Category.name.ilike(expense.category),
                Category.type == "expense"
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Invalid expense category"
            )

        new_expense = Transaction(
            user_id=user_id,
            category_id=category.id,
            description=expense.description,
            amount=expense.amount,
            type="expense",
            date=expense.date,
            payment_method=expense.payment_method,
            notes=expense.notes,
            is_ai_generated=False
        )

        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)

        return {
            "message": "Expense added successfully",
            "transaction_id": new_expense.id
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in add_expense:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error adding expense"
        )

@router.post("/income")
def add_income(
    income: IncomeCreateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        user_id = current_user.id

        category = (
            db.query(Category)
            .filter(
                Category.name.ilike(income.category),
                Category.type == "income"
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Invalid income category"
            )

        new_income = Transaction(
            user_id=user_id,
            category_id=category.id,
            description=income.description,
            amount=income.amount,
            type="income",
            date=income.date,
            payment_method=income.payment_method,
            notes=income.notes,
            is_ai_generated=False
        )

        db.add(new_income)
        db.commit()
        db.refresh(new_income)

        return {
            "message": "Income added successfully",
            "transaction_id": new_income.id
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in add_income:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Error adding income"
        )

# Update transaction
@router.put("/{transaction_id}")
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionUpdateSchema,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        user_id = current_user.id

        # Find transaction belonging to current user
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id
            )
            .first()
        )

        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found"
            )

        # Find category based on category name and transaction type
        category = (
            db.query(Category)
            .filter(
                Category.name.ilike(transaction_data.category),
                Category.type == transaction_data.type
            )
            .first()
        )

        if not category:
            raise HTTPException(
                status_code=400,
                detail="Invalid category for transaction type"
            )

        # Update transaction
        transaction.description = transaction_data.description
        transaction.amount = transaction_data.amount
        transaction.category_id = category.id
        transaction.type = transaction_data.type
        transaction.date = transaction_data.date
        transaction.payment_method = transaction_data.payment_method
        transaction.notes = transaction_data.notes

        db.commit()
        db.refresh(transaction)

        return {
            "message": "Transaction updated successfully",
            "transaction_id": transaction.id
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        print(
            "Error in update_transaction:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Error updating transaction"
        )

# Delete transaction
@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:

        user_id = current_user.id

        # Find transaction belonging to current user
        transaction = (
            db.query(Transaction)
            .filter(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id
            )
            .first()
        )

        if not transaction:
            raise HTTPException(
                status_code=404,
                detail="Transaction not found"
            )

        db.delete(transaction)
        db.commit()

        return {
            "message": "Transaction deleted successfully"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        print(
            "Error in delete_transaction:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Error deleting transaction"
        )