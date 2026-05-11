from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserRegister, UserLogin, UserOut, Token
from app.services.auth_service import register_user, authenticate_user, create_access_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserOut, status_code=201)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Користувач з таким email вже існує"
        )
    return user

@router.post("/login", response_model=Token)
def login(data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Зверни увагу: тепер ми передаємо data.username, бо так вимагає форма
    user = authenticate_user(db, data.username, data.password)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Невірний email або пароль"
        )
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}