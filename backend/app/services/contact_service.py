from sqlalchemy.orm import Session
from app.models.contact_request import ContactRequest
from app.models.profile import Profile

def get_existing_request(db: Session, sender_id: int, receiver_id: int):
    return db.query(ContactRequest).filter(
        ContactRequest.sender_id == sender_id,
        ContactRequest.receiver_id == receiver_id
    ).first()

def send_request(db: Session, sender_id: int, receiver_id: int):
    #перевіряємо чи вже існує запит
    existing = get_existing_request(db, sender_id, receiver_id)
    if existing:
        return None, "Запит вже надіслано"

    #не можна надіслати самому собі
    if sender_id == receiver_id:
        return None, "Не можна надіслати запит самому собі"

    request = ContactRequest(sender_id=sender_id, receiver_id=receiver_id)
    db.add(request)
    db.commit()
    db.refresh(request)
    return request, None

def respond_to_request(db: Session, request_id: int, user_id: int, accept: bool):
    request = db.query(ContactRequest).filter(
        ContactRequest.id == request_id,
        ContactRequest.receiver_id == user_id  # тільки отримувач може відповісти
    ).first()

    if not request:
        return None, "Запит не знайдено"
    if request.status != "pending":
        return None, "Запит вже оброблено"

    request.status = "accepted" if accept else "declined"
    db.commit()
    db.refresh(request)
    return request, None

def get_incoming_requests(db: Session, user_id: int):
    """Вхідні запити — де ти отримувач"""
    return db.query(ContactRequest).filter(
        ContactRequest.receiver_id == user_id,
        ContactRequest.status == "pending"
    ).all()

def get_accepted_contacts(db: Session, user_id: int):
    """Прийняті контакти — де ти або відправник або отримувач"""
    return db.query(ContactRequest).filter(
        ContactRequest.status == "accepted",
        (ContactRequest.sender_id == user_id) |
        (ContactRequest.receiver_id == user_id)
    ).all()