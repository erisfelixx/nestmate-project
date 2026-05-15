from app.models.profile import Profile

# ваги критеріїв (сума = 1.0)
WEIGHTS = {
    "schedule":        0.20,  # режим дня
    "cleanliness":     0.20,  # чистота
    "noise_level":     0.15,  # рівень шуму
    "guests_frequency": 0.15, # частота гостей
    "pets":            0.15,  # сумісність з тваринами
    "smoking":         0.15,  # куріння
    "children":        0.15,  # діти
}

def score_schedule(a: Profile, b: Profile) -> float:
    """режим дня: або збігається або ні"""
    if a.schedule is None or b.schedule is None:
        return 0.5  # невідомо = нейтральна оцінка
    return 1.0 if a.schedule == b.schedule else 0.0

def score_numeric(val_a: int, val_b: int, scale: int = 6) -> float:
    """
    числова шкала 1-7.
    sᵢ = 1 - |A - B| / scale
    """
    if val_a is None or val_b is None:
        return 0.5
    return 1.0 - abs(val_a - val_b) / scale

def score_pets(a: Profile, b: Profile) -> float:
    """
    логіка для pets:
    - якщо А має тварин, Б має бути ok_with_pets
    - якщо Б має тварин, А має бути ok_with_pets
    """
    if a.has_pets and not b.ok_with_pets:
        return 0.0
    if b.has_pets and not a.ok_with_pets:
        return 0.0
    return 1.0

def score_smoking(a: Profile, b: Profile) -> float:
    """
    логіка куріння:
    - якщо А курить, Б має бути ok_with_smoking
    - якщо Б курить, А має бути ok_with_smoking
    """
    if a.smoking and not b.ok_with_smoking:
        return 0.0
    if b.smoking and not a.ok_with_smoking:
        return 0.0
    return 1.0

def score_children(a: Profile, b: Profile) -> float:
    """аналогічно тваринам"""
    if a.has_children and not b.ok_with_children:
        return 0.0
    if b.has_children and not a.ok_with_children:
        return 0.0
    return 1.0

def calculate_compatibility(a: Profile, b: Profile) -> dict:
    """
    головна функція розрахунку сумісності:
    повертає загальний % та розбивку по кожному критерію.
    """
    scores = {
        "schedule":         score_schedule(a, b),
        "cleanliness":      score_numeric(a.cleanliness, b.cleanliness),
        "noise_level":      score_numeric(a.noise_level, b.noise_level),
        "guests_frequency": score_numeric(a.guests_frequency, b.guests_frequency),
        "pets":             score_pets(a, b),
        "smoking":          score_smoking(a, b),
        "children":         score_children(a, b),
    }

    # зважена сума: S = Σ (wᵢ × sᵢ)
    total = sum(WEIGHTS[key] * scores[key] for key in WEIGHTS)
    percentage = round(total * 100, 1)

    return {
        "total": percentage,
        "breakdown": {
            "Режим дня":    round(scores["schedule"] * 100),
            "Чистота":      round(scores["cleanliness"] * 100),
            "Рівень шуму":  round(scores["noise_level"] * 100),
            "Гості":        round(scores["guests_frequency"] * 100),
            "Тварини":      round(scores["pets"] * 100),
            "Куріння":      round(scores["smoking"] * 100),
        }
    }