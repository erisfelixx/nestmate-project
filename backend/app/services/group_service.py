from sqlalchemy.orm import Session
from app.models.group import Group, GroupMember, GroupRequest
from app.models.profile import Profile
from app.ai.scoring import calculate_compatibility

def create_group(db: Session, creator_id: int, name: str, city: str,
                 budget_min: int, budget_max: int, target_size: int):
    #один користувач — одна група
    existing = db.query(GroupMember).filter(
        GroupMember.user_id == creator_id
    ).first()
    if existing:
        return None, "Ти вже є учасником групи"

    group = Group(
        name=name, city=city,
        budget_min=budget_min, budget_max=budget_max,
        target_size=target_size, creator_id=creator_id
    )
    db.add(group)
    db.flush()

    member = GroupMember(group_id=group.id, user_id=creator_id)
    db.add(member)
    db.commit()
    db.refresh(group)
    return group, None

def get_my_group(db: Session, user_id: int):
    member = db.query(GroupMember).filter(
        GroupMember.user_id == user_id
    ).first()
    if not member:
        return None
    return db.query(Group).filter(Group.id == member.group_id).first()

def invite_to_group(db: Session, group_id: int, inviter_id: int, invitee_user_id: int):
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group or group.creator_id != inviter_id:
        return None, "Тільки засновник може запрошувати"

    already = db.query(GroupMember).filter(
        GroupMember.group_id == group_id,
        GroupMember.user_id == invitee_user_id
    ).first()
    if already:
        return None, "Користувач вже в групі"

    member = GroupMember(group_id=group_id, user_id=invitee_user_id)
    db.add(member)
    db.commit()
    return member, None

def apply_to_group(db: Session, group_id: int, applicant_user_id: int):
    existing = db.query(GroupRequest).filter(
        GroupRequest.group_id == group_id,
        GroupRequest.applicant_user_id == applicant_user_id
    ).first()
    if existing:
        return None, "Запит вже надіслано"

    req = GroupRequest(group_id=group_id, applicant_user_id=applicant_user_id)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req, None

def respond_group_request(db: Session, request_id: int, user_id: int, accept: bool):
    req = db.query(GroupRequest).filter(GroupRequest.id == request_id).first()
    if not req:
        return None, "Запит не знайдено"

    #перевіряємо що відповідає учасник групи
    is_member = db.query(GroupMember).filter(
        GroupMember.group_id == req.group_id,
        GroupMember.user_id == user_id
    ).first()
    if not is_member:
        return None, "Немає доступу"

    if accept:
        req.status = "accepted"
        new_member = GroupMember(
            group_id=req.group_id,
            user_id=req.applicant_user_id
        )
        db.add(new_member)
    else:
        req.status = "declined"

    db.commit()
    return req, None

def get_group_compatibility(db: Session, group: Group, candidate_user_id: int) -> dict:
    """
    Рахує сумісність кандидата з групою.
    S(C, G) = середнє S(C, gᵢ) для кожного учасника групи.
    """
    candidate_profile = db.query(Profile).filter(
        Profile.user_id == candidate_user_id
    ).first()
    if not candidate_profile:
        return {"total": 0, "breakdown_per_member": []}

    scores = []
    breakdown_per_member = []

    for member in group.members:
        if member.user_id == candidate_user_id:
            continue
        member_profile = db.query(Profile).filter(
            Profile.user_id == member.user_id
        ).first()
        if not member_profile:
            continue
        compat = calculate_compatibility(candidate_profile, member_profile)
        scores.append(compat["total"])
        breakdown_per_member.append({
            "user_id": member.user_id,
            "name": member_profile.name,
            "compatibility": compat["total"],
            "breakdown": compat["breakdown"]
        })

    total = round(sum(scores) / len(scores), 1) if scores else 0
    return {"total": total, "breakdown_per_member": breakdown_per_member}

def get_active_groups(db: Session, skip: int = 0, limit: int = 20):
    return db.query(Group).filter(
        Group.is_active_search == True
    ).offset(skip).limit(limit).all()