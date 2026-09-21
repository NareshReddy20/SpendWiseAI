from pydantic import BaseModel, EmailStr, Field


class RegisterSchema(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    email: EmailStr
    password: str


class LoginSchema(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6, max_length=12)


class RegisterResponse(BaseModel):
    id: int
    name: str
    email: EmailStr


class LoginResponse(BaseModel):
    message: str
    user: RegisterResponse
    access_token: str
    token_type: str