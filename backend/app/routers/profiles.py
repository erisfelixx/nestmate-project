from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileOut
from app.services.profile_service import (
    get_profile_by_user_id, get_profile_by_id,
    create_profile, update_profile,
    delete_profile, get_active_profiles
)
from app.services.auth_service import get_current_user
from app.services.contact_service import are_users_connected
from app.models.user import User
from typing import List

router = APIRouter(prefix="/profiles", tags=["profiles"])

# Створити свій профіль
@router.post("/", response_model=ProfileOut, status_code=201)
def create_my_profile(
    data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = get_profile_by_user_id(db, current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Профіль вже існує")
    return create_profile(db, current_user.id, data)

# Отримати свій профіль
@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Профіль не знайдено")
    return profile

# Оновити свій профіль
@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Профіль не знайдено")
    return update_profile(db, profile, data)

# Видалити свій профіль
@router.delete("/me", status_code=204)
def delete_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Профіль не знайдено")
    delete_profile(db, profile)

# Переглянути профіль іншого користувача
@router.get("/{profile_id}", response_model=ProfileOut)
def get_profile(
    profile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile_by_id(db, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Профіль не знайдено")
    if not are_users_connected(db, current_user.id, profile.user_id):
        profile.contact_info = None
    return profile

# Список всіх активних анкет
@router.get("/", response_model=List[ProfileOut])
def list_active_profiles(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profiles = get_active_profiles(db, skip, limit)
    for p in profiles:
        if not are_users_connected(db, current_user.id, p.user_id):
            p.contact_info = None
            
    return profiles

#Oтримати профіль по user_id
@router.get("/user/{user_id}", response_model=ProfileOut)
def get_profile_by_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile_by_user_id(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Профіль не знайдено")
        if not are_users_connected(db, current_user.id, profile.user_id):
            profile.contact_info = None
            
    return profile