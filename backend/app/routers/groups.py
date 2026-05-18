from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import get_current_user
from app.services.group_service import (
    create_group, get_my_group, invite_to_group,
    apply_to_group, respond_group_request,
    get_group_compatibility, get_active_groups
)
from app.services.profile_service import get_profile_by_user_id
from app.models.user import User
from app.models.group import GroupMember, GroupRequest
from pydantic import BaseModel
from typing import Optional
from app.models.group import GroupMember, GroupRequest

router = APIRouter(prefix="/groups", tags=["groups"])

class GroupCreate(BaseModel):
    name: str
    city: Optional[str] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    target_size: int = 3
    description: Optional[str] = None

class GroupUpdate(BaseModel):
    is_active_search: bool
    description: Optional[str] = None

# cтворити групу
@router.post("/", status_code=201)
def create_my_group(
    data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group, error = create_group(
        db, current_user.id, data.name, data.city,
        data.budget_min, data.budget_max, data.target_size,
        data.description
    )
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"group_id": group.id, "message": "Групу створено"}

# отримати свою групу
@router.get("/me")
def get_my_group_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = get_my_group(db, current_user.id)
    if not group:
        raise HTTPException(status_code=404, detail="Група не знайдена")

    members_info = []
    for m in group.members:
        profile = get_profile_by_user_id(db, m.user_id)
        members_info.append({
            "user_id": m.user_id,
            "is_creator": m.user_id == group.creator_id,
            "name": profile.name if profile else None,
            "age": profile.age if profile else None,
            "schedule": profile.schedule if profile else None,
            "cleanliness": profile.cleanliness if profile else None,
        })

    # вхідні запити до групи
    pending = db.query(GroupRequest).filter(
        GroupRequest.group_id == group.id,
        GroupRequest.status == "pending"
    ).all()
    pending_info = []
    for req in pending:
        profile = get_profile_by_user_id(db, req.applicant_user_id)
        compat = get_group_compatibility(db, group, req.applicant_user_id)
        pending_info.append({
            "request_id": req.id,
            "user_id": req.applicant_user_id,
            "name": profile.name if profile else None,
            "age": profile.age if profile else None,
            "compatibility": compat["total"],
            "breakdown_per_member": compat["breakdown_per_member"]
        })

    return {
        "id": group.id,
        "name": group.name,
        "city": group.city,
        "budget_min": group.budget_min,
        "budget_max": group.budget_max,
        "target_size": group.target_size,
        "is_active_search": group.is_active_search,
        "current_size": len(group.members),
        "description": group.description,
        "members": members_info,
        "pending_requests": pending_info
    }

# запросити у групу (засновник запрошує з контактів)
@router.post("/me/invite/{invitee_user_id}")
def invite_user(
    invitee_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = get_my_group(db, current_user.id)
    if not group:
        raise HTTPException(status_code=404, detail="Спочатку створи групу")
    _, error = invite_to_group(db, group.id, current_user.id, invitee_user_id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Користувача додано до групи"}

# всі активні групи (для пошуку)
@router.get("/")
def list_groups(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    groups = get_active_groups(db)
    result = []
    for group in groups:
        compat = get_group_compatibility(db, group, current_user.id)
        members_info = []
        for m in group.members:
            profile = get_profile_by_user_id(db, m.user_id)
            members_info.append({
                "name": profile.name if profile else None,
                "age": profile.age if profile else None,
            })
        result.append({
            "group_id": group.id,
            "name": group.name,
            "city": group.city,
            "budget_min": group.budget_min,
            "budget_max": group.budget_max,
            "target_size": group.target_size,
            "current_size": len(group.members),
            "description": group.description,
            "members": members_info,
            "compatibility": compat["total"],
            "breakdown_per_member": compat["breakdown_per_member"]
        })

    result.sort(key=lambda x: x["compatibility"], reverse=True)
    return result

# подати запит на вступ до групи
@router.post("/{group_id}/apply", status_code=201)
def apply(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _, error = apply_to_group(db, group_id, current_user.id)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Запит надіслано"}

#прийняти або відхилити запит на вступ
@router.post("/requests/{request_id}/accept")
def accept_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _, error = respond_group_request(db, request_id, current_user.id, accept=True)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Кандидата прийнято"}

@router.post("/requests/{request_id}/decline")
def decline_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    _, error = respond_group_request(db, request_id, current_user.id, accept=False)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return {"message": "Запит відхилено"}

#видалити групу
@router.delete("/me")
def delete_group(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = get_my_group(db, current_user.id)
    if not group:
        raise HTTPException(status_code=404, detail="Група не знайдена")
    if group.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Тільки засновник може видалити групу")

    # видаляємо учасників і запити
    db.query(GroupMember).filter(GroupMember.group_id == group.id).delete()
    db.query(GroupRequest).filter(GroupRequest.group_id == group.id).delete()
    db.delete(group)
    db.commit()
    return {"message": "Групу видалено"}

# деактивація групи
@router.put("/me")
def update_group(
    data: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = get_my_group(db, current_user.id)
    if not group:
        raise HTTPException(status_code=404, detail="Група не знайдена")
    group.is_active_search = data.is_active_search
    if data.description is not None:
        group.description = data.description
    db.commit()
    return {"message": "Оновлено"}