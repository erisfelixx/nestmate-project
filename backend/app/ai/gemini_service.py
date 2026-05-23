from google import genai
from app.config import settings
from app.models import Profile 

client = genai.Client(api_key=settings.gemini_api_key)

def build_profile_description(profile: Profile) -> str:
    schedule = "жайворонок" if profile.schedule == "early_bird" else "сова"
    parts = [
        f"- Режим дня: {schedule}",
        f"- Чистота: {profile.cleanliness}/7",
        f"- Рівень шуму: {profile.noise_level}/7",
        f"- Частота гостей: {profile.guests_frequency}/7",
        f"- Є тварини: {'так' if profile.has_pets else 'ні'}",
        f"- Ок з тваринами: {'так' if profile.ok_with_pets else 'ні'}",
        f"- Курить: {'так' if profile.smoking else 'ні'}",
        f"- Ок з курінням: {'так' if profile.ok_with_smoking else 'ні'}",
        f"- Є діти: {'так' if profile.has_children else 'ні'}",
        f"- Ок з дітьми: {'так' if profile.ok_with_children else 'ні'}",
    ]
    if profile.bio:
        parts.append(f"- Про себе: {profile.bio}")
    if profile.interests:
        parts.append(f"- Інтереси: {profile.interests}")
    return "\n".join(parts)

def analyze_compatibility(profile_a: Profile, profile_b: Profile, score: float) -> str:
    prompt = f"""
Ти — дружній асистент сервісу пошуку співмешканців nestmate.
Проаналізуй двох людей і напиши короткий живий коментар українською мовою.
Звертайся до першого користувача на "Ви" (шанобливо, але тепло).

Ви ({profile_a.name}):
{build_profile_description(profile_a)}

Потенційний співмешканець ({profile_b.name}):
{build_profile_description(profile_b)}

Загальна сумісність: {score}%

Напиши відповідь СТРОГО у такому форматі (3 рядки, без зайвих слів, без зірочок та markdown):

✅ [1 речення про спільне — що добре збігається]
⚠️ [1 речення про можливий конфлікт — якщо є, інакше ще одне позитивне]
💡 [1 конкретна практична порада]
"""
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text.strip()
    except Exception as e:
        print(f"Помилка Gemini: {e}") # Виведе помилку в термінал для дебагу
        return "Не вдалося отримати AI-аналіз. Спробуй пізніше."