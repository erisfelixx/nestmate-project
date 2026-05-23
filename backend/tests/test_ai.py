import pytest
from unittest.mock import patch, MagicMock
from app.ai.gemini_service import build_profile_description, analyze_compatibility
from tests.test_scoring import make_profile

def test_build_profile_description_includes_bio_and_interests():
    """Перевірка, що текстовий опис профілю для ШІ правильно включає bio та інтереси"""
    profile = make_profile(
        name="Анна", 
        schedule="night_owl", 
        bio="Люблю спокій", 
        interests="Кодинг, Blender"
    )
    description = build_profile_description(profile)
    
    assert "сова" in description
    assert "Про себе: Люблю спокій" in description
    assert "Інтереси: Кодинг, Blender" in description

@patch("app.ai.gemini_service.client")
def test_analyze_compatibility_api_error_handling(mock_client):
    """Перевірка обробки помилок, якщо Google API лежить або ключ недійсний"""
    # Імітуємо викидання виключення при виклику generate_content
    mock_client.models.generate_content.side_effect = Exception("API Key expired")
    
    profile_a = make_profile(name="Алекс")
    profile_b = make_profile(name="Влад")
    
    result = analyze_compatibility(profile_a, profile_b, 85.0)
    
    # Метод має не падати, а повернути зрозумілий користувачеві текст помилки
    assert "Не вдалося отримати AI-аналіз" in result