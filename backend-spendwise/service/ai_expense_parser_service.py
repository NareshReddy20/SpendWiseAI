import re
from datetime import date, timedelta
from decimal import Decimal
from models.transaction import Transaction
from models.category import Category
from sqlalchemy.orm import Session
from models.transaction_ai_result import TransactionAIResult


class AIExpenseParserService:

    def __init__(self, db: Session):
        self.db = db

    def parse_transaction(
        self,
        user_id: int,
        text: str,
        transaction_type: str
    ):

        text_lower = text.lower()

        # =====================================
        # VALIDATE TRANSACTION TYPE
        # =====================================

        if transaction_type not in ["expense", "income"]:
            raise ValueError(
                "Transaction type must be expense or income."
            )

        # =====================================
        # AMOUNT
        # =====================================

        amount_match = re.search(
            r'(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)',
            text_lower
        )

        if not amount_match:
            raise ValueError(
                "Could not identify the amount."
            )

        amount = Decimal(
            amount_match.group(1)
        )

        # =====================================
        # CATEGORY
        # =====================================

        if transaction_type == "expense":

            category = "Other"

            if any(word in text_lower for word in [
                "food",
                "dinner",
                "lunch",
                "breakfast",
                "restaurant",
                "zomato",
                "swiggy",
                "groceries",
                "grocery",
                "big bazaar"
            ]):
                category = "Food"

            elif any(word in text_lower for word in [
                "uber",
                "ola",
                "bus",
                "train",
                "transport",
                "auto",
                "cab"
            ]):
                category = "Transport"

            elif any(word in text_lower for word in [
                "shopping",
                "amazon",
                "flipkart",
                "clothes"
            ]):
                category = "Shopping"

            elif any(word in text_lower for word in [
                "electricity",
                "bill",
                "rent",
                "recharge"
            ]):
                category = "Bills"

        else:

            category = "Other"

            if any(word in text_lower for word in [
                "salary",
                "paycheck",
                "monthly salary"
            ]):
                category = "Salary"

            elif any(word in text_lower for word in [
                "freelance",
                "freelancing",
                "freelance payment"
            ]):
                category = "Freelance"

            elif any(word in text_lower for word in [
                "interest",
                "interest income"
            ]):
                category = "Interest"

        # =====================================
        # PAYMENT METHOD
        # =====================================

        payment_method = "Other"

        if "upi" in text_lower:
            payment_method = "UPI"

        elif "credit card" in text_lower:
            payment_method = "Credit Card"

        elif "cash" in text_lower:
            payment_method = "Cash"

        elif "bank transfer" in text_lower:
            payment_method = "Bank Transfer"

        # =====================================
        # DATE
        # =====================================

        transaction_date = date.today()

        if "yesterday" in text_lower:

            transaction_date = (
                date.today() - timedelta(days=1)
            )

        # =====================================
        # DESCRIPTION
        # =====================================

        description = text.strip()

        # =====================================
        # CONFIDENCE
        # =====================================

        confidence = Decimal("0.80")

        # =====================================
        # SAVE PARSED RESULT
        # =====================================

        ai_result = TransactionAIResult(
            user_id=user_id,
            original_text=text,
            parsed_amount=amount,
            parsed_category=category,
            parsed_description=description,
            parsed_date=transaction_date,
            parsed_payment_method=payment_method,
            confidence_score=confidence,
            was_confirmed=False
        )

        self.db.add(ai_result)
        self.db.commit()
        self.db.refresh(ai_result)

        return ai_result
    def confirm_transaction(
    self,
    user_id: int,
    amount,
    category: str,
    description: str,
    transaction_date,
    payment_method: str,
    transaction_type: str
):
        # Find category
        category_obj = (
            self.db.query(Category)
            .filter(
                Category.name == category,
                Category.type == transaction_type
            )
            .first()
        )

        # If category does not exist, use Other
        if not category_obj:
            category_obj = (
                self.db.query(Category)
                .filter(
                    Category.name == "Other",
                    Category.type == transaction_type
                )
                .first()
            )

        if not category_obj:
            raise ValueError(
                f"Category '{category}' not found."
            )

        # Create actual transaction
        transaction = Transaction(
            user_id=user_id,
            category_id=category_obj.id,
            description=description,
            amount=amount,
            type=transaction_type,
            date=transaction_date,
            payment_method=payment_method or "Other",
            notes="Created from AI Transaction Parser",
            is_ai_generated=True
        )

        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)

        return transaction