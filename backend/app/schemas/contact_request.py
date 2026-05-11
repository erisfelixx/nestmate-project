from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ContactRequestOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    status: str
    created_at: datetime

    #контакти - показуємо тільки якщо статус "accepted"
    sender_contact: Optional[str] = None
    receiver_contact: Optional[str] = None

    class Config:
        from_attributes = True