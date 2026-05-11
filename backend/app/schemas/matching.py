from pydantic import BaseModel
from typing import Optional
from app.schemas.profile import ProfileOut

class BreakdownOut(BaseModel):
    Режим_дня: Optional[int] = None
    Чистота: Optional[int] = None
    Рівень_шуму: Optional[int] = None
    Гості: Optional[int] = None
    Тварини: Optional[int] = None
    Куріння: Optional[int] = None

class MatchOut(BaseModel):
    profile: ProfileOut
    compatibility: float
    breakdown: dict

    class Config:
        from_attributes = True