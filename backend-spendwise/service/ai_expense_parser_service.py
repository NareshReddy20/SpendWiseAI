import re
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

from models.transaction import Transaction
from models.category import Category
from models.transaction_ai_result import TransactionAIResult


class AIExpenseParserService:

    ALLOWED_TRANSACTION_TYPES = {"expense", "income"}

    EXPENSE_CATEGORIES = {
        "Food": [
            "food",
            "dinner",
            "lunch",
            "breakfast",
            "restaurant",
            "zomato",
            "swiggy",
            "groceries",
            "grocery",
            "big bazaar",
        ],
        "Transport": [
            "uber",
            "ola",
            "bus",
            "train",
            "transport",
            "auto",
            "cab",
        ],
        "Shopping": [
            "shopping",
            "amazon",
            "flipkart",
            "clothes",
        ],
        "Bills": [
            "electricity",
            "bill",
            "rent",
            "recharge",
        ],
    }

    INCOME_CATEGORIES = {
        "Salary": [
            "salary",
            "paycheck",
            "monthly salary",
        ],
        "Freelance": [
            "freelance",
            "freelancing",
            "freelance payment",
        ],
        "Interest": [
            "interest",
            "interest income",
            "fixed deposit",
            "fd interest",
        ],
    }

    PAYMENT_METHODS = {
        "UPI": [
            "upi",
            "google pay",
            "gpay",
            "phonepe",
            "paytm",
        ],
        "Credit Card": [
            "credit card",
            "creditcard",
        ],
        "Debit Card": [
            "debit card",
            "debitcard",
        ],
        "Cash": [
            "cash",
        ],
        "Bank Transfer": [
            "bank transfer",
            "bank",
            "neft",
            "imps",
            "rtgs",
        ],
    }

    def __init__(self, db: Session):
        self.db = db

    # =====================================================
    # VALIDATE TRANSACTION TYPE
    # =====================================================

    def _validate_transaction_type(self, transaction_type: str):

        if transaction_type not in self.ALLOWED_TRANSACTION_TYPES:
            raise ValueError(
                "Transaction type must be expense or income."
            )

    # =====================================================
    # EXTRACT AMOUNT
    # =====================================================

    def _extract_amount(self, text: str) -> Decimal:

        # Supports:
        # ₹450
        # ₹1,500
        # Rs 450
        # Rs. 450
        # INR 450
        # 450

        amount_match = re.search(
            r"(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)",
            text.lower()
        )

        if not amount_match:
            raise ValueError(
                "Could not identify the transaction amount."
            )

        amount_string = amount_match.group(1).replace(",", "")

        try:
            amount = Decimal(amount_string)
        except InvalidOperation:
            raise ValueError(
                "Invalid transaction amount."
            )

        if amount <= 0:
            raise ValueError(
                "Transaction amount must be greater than zero."
            )

        return amount

    # =====================================================
    # DETECT CATEGORY
    # =====================================================

    def _detect_category(
        self,
        text: str,
        transaction_type: str
    ) -> str:

        if transaction_type == "expense":

            categories = self.EXPENSE_CATEGORIES

        else:

            categories = self.INCOME_CATEGORIES

        for category, keywords in categories.items():

            if any(
                keyword in text
                for keyword in keywords
            ):
                return category

        return "Other"

    # =====================================================
    # DETECT PAYMENT METHOD
    # =====================================================

    def _detect_payment_method(self, text: str) -> str:

        for payment_method, keywords in self.PAYMENT_METHODS.items():

            if any(
                keyword in text
                for keyword in keywords
            ):
                return payment_method

        return "Other"

    # =====================================================
    # DETECT DATE
    # =====================================================

    def _detect_date(self, text: str) -> date:

        today = date.today()

        if "day before yesterday" in text:
            return today - timedelta(days=2)

        if "yesterday" in text:
            return today - timedelta(days=1)

        if "today" in text:
            return today

        return today

    # =====================================================
    # CALCULATE CONFIDENCE
    # =====================================================

    def _calculate_confidence(
        self,
        amount: Decimal,
        category: str,
        payment_method: str
    ) -> Decimal:

        score = Decimal("0.60")

        # Amount detected
        if amount:
            score += Decimal("0.15")

        # Known category
        if category != "Other":
            score += Decimal("0.15")

        # Known payment method
        if payment_method != "Other":
            score += Decimal("0.10")

        return min(score, Decimal("1.00"))

    # =====================================================
    # PARSE TRANSACTION
    # =====================================================

    def parse_transaction(
        self,
        user_id: int,
        text: str,
        transaction_type: str
    ):

        if not text or not text.strip():
            raise ValueError(
                "Transaction description cannot be empty."
            )

        transaction_type = transaction_type.lower().strip()

        self._validate_transaction_type(
            transaction_type
        )

        text_lower = text.lower().strip()

        # -----------------------------
        # Amount
        # -----------------------------

        amount = self._extract_amount(
            text_lower
        )

        # -----------------------------
        # Category
        # -----------------------------

        category = self._detect_category(
            text_lower,
            transaction_type
        )

        # -----------------------------
        # Payment Method
        # -----------------------------

        payment_method = self._detect_payment_method(
            text_lower
        )

        # -----------------------------
        # Date
        # -----------------------------

        transaction_date = self._detect_date(
            text_lower
        )

        # -----------------------------
        # Description
        # -----------------------------

        description = text.strip()

        # -----------------------------
        # Confidence
        # -----------------------------

        confidence = self._calculate_confidence(
            amount,
            category,
            payment_method
        )

        # -----------------------------
        # Save AI result
        # -----------------------------

        ai_result = TransactionAIResult(
            user_id=user_id,
            original_text=text.strip(),
            parsed_amount=amount,
            parsed_category=category,
            parsed_description=description,
            parsed_date=transaction_date,
            parsed_payment_method=payment_method,
            confidence_score=confidence,
            was_confirmed=False
        )

        try:

            self.db.add(ai_result)
            self.db.commit()
            self.db.refresh(ai_result)

        except Exception:
            self.db.rollback()
            raise

        return ai_result

    # =====================================================
    # CONFIRM TRANSACTION
    # =====================================================

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

        transaction_type = transaction_type.lower().strip()

        self._validate_transaction_type(
            transaction_type
        )

        # -----------------------------
        # Validate amount
        # -----------------------------

        try:
            amount = Decimal(str(amount))
        except (InvalidOperation, TypeError, ValueError):

            raise ValueError(
                "Invalid transaction amount."
            )

        if amount <= 0:
            raise ValueError(
                "Transaction amount must be greater than zero."
            )

        # -----------------------------
        # Validate category
        # -----------------------------

        if not category:
            category = "Other"

        category_obj = (
            self.db.query(Category)
            .filter(
                Category.name == category,
                Category.type == transaction_type
            )
            .first()
        )

        # -----------------------------
        # Fallback to Other
        # -----------------------------

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
                f"No valid category found for "
                f"transaction type '{transaction_type}'."
            )

        # -----------------------------
        # Create transaction
        # -----------------------------

        transaction = Transaction(
            user_id=user_id,
            category_id=category_obj.id,
            description=description.strip(),
            amount=amount,
            type=transaction_type,
            date=transaction_date,
            payment_method=payment_method or "Other",
            notes="Created from AI Transaction Parser",
            is_ai_generated=True
        )

        try:

            self.db.add(transaction)
            self.db.commit()
            self.db.refresh(transaction)

        except Exception:
            self.db.rollback()
            raise

        return transaction