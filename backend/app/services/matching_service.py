from sqlalchemy.orm import Session
from app.models.profile import Profile
from app.ai.scoring import calculate_compatibility

def get_matches(db: Session, current_profile: Profile, limit: int = 20) -> list:
    """
    Знаходить всі активні анкети (крім своєї),
    рахує сумісність і повертає відсортований список.
    """
    # всі активні профілі крім свого
    candidates = (
        db.query(Profile)
        .filter(
            Profile.is_active_search == True,
            Profile.id != current_profile.id
        )
        .all()
    )

    results = []
    for candidate in candidates:
        compat = calculate_compatibility(current_profile, candidate)
        results.append({
            "profile": candidate,
            "compatibility": compat["total"],
            "breakdown": compat["breakdown"]
        })

    # сортуємо за % сумісності — найвищий першим
    results.sort(key=lambda x: x["compatibility"], reverse=True)

    return results[:limit]