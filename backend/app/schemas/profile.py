from pydantic import BaseModel
from typing import Optional
from datetime import date

class ProfileCreate(BaseModel):
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None      # "male" / "female" / "other"
    city: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    contact_info: Optional[str] = None
    interests: Optional[str] = None   # вільний текст

    role: Optional[str] = None        # "looking" / "hosting"
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    move_in_date: Optional[date] = None

    schedule: Optional[str] = None    # "early_bird" / "night_owl"
    cleanliness: Optional[int] = None       # 1-7
    noise_level: Optional[int] = None       # 1-7
    guests_frequency: Optional[int] = None  # 1-7

    has_pets: Optional[bool] = False
    ok_with_pets: Optional[bool] = True
    smoking: Optional[bool] = False
    ok_with_smoking: Optional[bool] = False
    has_children: Optional[bool] = False
    ok_with_children: Optional[bool] = True

    has_gas_appliances: Optional[bool] = False
    floor: Optional[int] = None
    has_shelter: Optional[bool] = False
    shelter_type: Optional[str] = None  # "basement" / "parking" / "both"

    is_active_search: Optional[bool] = False

class ProfileUpdate(ProfileCreate):
    pass  # ті самі поля, всі опціональні

class ProfileOut(ProfileCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True