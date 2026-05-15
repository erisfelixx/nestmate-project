from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.profile_service import get_profile_by_user_id
from app.services.matching_service import get_matches
from app.models.user import User
from typing import List

router = APIRouter(prefix="/matches", tags=["matching"])

@router.get("/")
def list_matches(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Спочатку створи профіль")
    if not profile.is_active_search:
        raise HTTPException(status_code=400, detail="Увімкни активний пошук у профілі")

    matches = get_matches(db, profile, limit)

    return [
        {
            "profile_id": m["profile"].id,
            "user_id": m["profile"].user_id,
            "name": m["profile"].name,
            "age": m["profile"].age,
            "city": m["profile"].city,
            "photo_url": m["profile"].photo_url,
            "bio": m["profile"].bio,
            "interests": m["profile"].interests,
            "role": m["profile"].role,
            "budget_min": m["profile"].budget_min,
            "budget_max": m["profile"].budget_max,
            "gender": m["profile"].gender,
            "move_in_date": str(m["profile"].move_in_date) if m["profile"].move_in_date else None,
            "schedule": m["profile"].schedule,
            "cleanliness": m["profile"].cleanliness,
            "noise_level": m["profile"].noise_level,
            "guests_frequency": m["profile"].guests_frequency,
            "has_pets": m["profile"].has_pets,
            "ok_with_pets": m["profile"].ok_with_pets,
            "smoking": m["profile"].smoking,
            "ok_with_smoking": m["profile"].ok_with_smoking,
            "has_children": m["profile"].has_children,
            "has_gas_appliances": m["profile"].has_gas_appliances,
            "has_shelter": m["profile"].has_shelter,
            "compatibility": m["compatibility"],
            "breakdown": m["breakdown"]
        }
        for m in matches
    ]