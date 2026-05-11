from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate

def get_profile_by_user_id(db: Session, user_id: int):
    return db.query(Profile).filter(Profile.user_id == user_id).first()

def get_profile_by_id(db: Session, profile_id: int):
    return db.query(Profile).filter(Profile.id == profile_id).first()

def create_profile(db: Session, user_id: int, data: ProfileCreate):
    profile = Profile(user_id=user_id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def update_profile(db: Session, profile: Profile, data: ProfileCreate):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile

def delete_profile(db: Session, profile: Profile):
    db.delete(profile)
    db.commit()

def get_active_profiles(db: Session, skip: int = 0, limit: int = 20):
    return (
        db.query(Profile)
        .filter(Profile.is_active_search == True)
        .offset(skip)
        .limit(limit)
        .all()
    )