from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from routes import auth
from core.database import get_db
from models.user import User
from schemas.auth import (
    RegisterSchema,
    LoginSchema,
    RegisterResponse,
    LoginResponse
)
from core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/register", response_model=RegisterResponse)
def register_user(
    user: RegisterSchema,
    db: Session = Depends(get_db)
):
    try:

        # Check if email already exists
        existing_user = db.query(User).filter(
            User.email == user.email
        ).first()

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered"
            )

        # Hash password
        hashed_password = hash_password(user.password)

        # Create new user
        new_user = User(
            name=user.name,
            email=user.email,
            password_hash=hashed_password
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        return new_user

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in register_user:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Internal server error during registration"
        )


@router.post("/login", response_model=LoginResponse)
def login_user(
    user: LoginSchema,
    db: Session = Depends(get_db)
):
    try:

        # Find user by email
        user_details = db.query(User).filter(
            User.email == user.email
        ).first()

        if not user_details:
            raise HTTPException(
                status_code=400,
                detail="User Not Found"
            )

        # Verify password
        password_check = verify_password(
            user.password,
            user_details.password_hash
        )

        if not password_check:
            raise HTTPException(
                status_code=400,
                detail="Password is wrong"
            )

        # Create JWT token
        token = create_access_token({
            "user_id": user_details.id,
            "email": user_details.email,
            "name": user_details.name
        })

        return {
            "message": "Login successful",
            "user": user_details,
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print("Error in login_user:", str(e))

        raise HTTPException(
            status_code=500,
            detail="Internal server error during login"
        )