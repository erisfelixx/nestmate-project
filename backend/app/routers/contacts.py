from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.contact_service import (
    send_request, respond_to_request,
    get_incoming_requests, get_accepted_contacts
)
from app.services.profile_service import get_profile_by_user_id
from app.models.user import User

router = APIRouter(prefix="/contacts", tags=["contacts"])

@router.post("/request/{receiver_id}", status_code=201)
def send_contact_request(
    receiver_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request, error = send_request(db, current_user.id, receiver_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Запит надіслано", "request_id": request.id}

@router.post("/request/{request_id}/accept")
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request, error = respond_to_request(db, request_id, current_user.id, accept=True)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Запит прийнято"}

@router.post("/request/{request_id}/decline")
def decline_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    request, error = respond_to_request(db, request_id, current_user.id, accept=False)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Запит відхилено"}

@router.get("/incoming")
def incoming_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Вхідні запити, що очікують відповіді"""
    requests = get_incoming_requests(db, current_user.id)
    return [
        {
            "request_id": r.id,
            "from_user_id": r.sender_id,
            "created_at": r.created_at
        }
        for r in requests
    ]

@router.get("/accepted")
def accepted_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Прийняті контакти — з розблокованими даними"""
    requests = get_accepted_contacts(db, current_user.id)
    result = []
    for r in requests:
        #визначаємо хто є "інший" юзер
        other_user_id = r.receiver_id if r.sender_id == current_user.id else r.sender_id
        other_profile = get_profile_by_user_id(db, other_user_id)

        result.append({
            "request_id": r.id,
            "user_id": other_user_id,
            "name": other_profile.name if other_profile else None,
            "contact_info": other_profile.contact_info if other_profile else None  # розблоковано!
        })
    return result