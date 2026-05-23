import pytest
from unittest.mock import patch


class TestAuth:
    def test_register_success(self, client):
        res = client.post("/auth/register", json={
            "email": "new@test.com",
            "password": "password123"
        })
        assert res.status_code == 201
        assert "email" in res.json()

    def test_register_duplicate_email(self, client):
        client.post("/auth/register", json={
            "email": "dup@test.com", "password": "pass"
        })
        res = client.post("/auth/register", json={
            "email": "dup@test.com", "password": "pass"
        })
        assert res.status_code == 400

    def test_login_success(self, client):
        client.post("/auth/register", json={
            "email": "login@test.com", "password": "pass123"
        })
        res = client.post("/auth/login", data={
            "username": "login@test.com", "password": "pass123"
        })
        assert res.status_code == 200
        assert "access_token" in res.json()

    def test_login_wrong_password(self, client):
        client.post("/auth/register", json={
            "email": "wrong@test.com", "password": "correct"
        })
        res = client.post("/auth/login", data={
            "username": "wrong@test.com", "password": "incorrect"
        })
        assert res.status_code == 401


class TestProfiles:
    def test_create_profile(self, auth_client):
        res = auth_client.post("/profiles/", json={
            "name": "Тест",
            "age": 22,
            "city": "Київ",
            "schedule": "early_bird",
            "cleanliness": 5,
            "noise_level": 3,
            "guests_frequency": 2,
            "is_active_search": True
        })
        assert res.status_code == 201
        assert res.json()["name"] == "Тест"

    def test_get_my_profile(self, auth_client):
        auth_client.post("/profiles/", json={"name": "Тест2"})
        res = auth_client.get("/profiles/me")
        assert res.status_code == 200

    def test_get_profile_unauthorized(self, client):
        res = client.get("/profiles/me")
        assert res.status_code == 401

    def test_update_profile(self, auth_client):
        auth_client.post("/profiles/", json={"name": "Стара"})
        res = auth_client.put("/profiles/me", json={"name": "Нова"})
        assert res.status_code == 200
        assert res.json()["name"] == "Нова"


class TestMatching:
    def test_matches_requires_auth(self, client):
        res = client.get("/matches/")
        assert res.status_code == 401

    def test_matches_without_profile_returns_404(self, auth_client):
        res = auth_client.get("/matches/")
        assert res.status_code == 404

    def test_ai_analysis_mocked(self, auth_client):
        """Тестуємо AI ендпоінт з mock — без реального запиту до Gemini"""
        auth_client.post("/profiles/", json={
            "name": "Аналіз",
            "schedule": "early_bird",
            "cleanliness": 5,
            "is_active_search": True
        })
        # патчимо новий об'єкт client, який ми створили в gemini_service
        with patch("app.ai.gemini_service.client") as mock_client:
            # Імітуємо повернення тексту за новим синтаксисом SDK
            mock_client.models.generate_content.return_value.text = (
                "✅ Тест\n⚠️ Тест\n💡 Тест"
            )
            res = auth_client.get("/matches/analyze/999")
            # Поверне 404, бо користувача 999 немає в базі тестів, 
            assert res.status_code == 404


class TestContacts:
    def test_incoming_requests_empty(self, auth_client):
        res = auth_client.get("/contacts/incoming")
        assert res.status_code == 200
        assert res.json() == []

    def test_accepted_contacts_empty(self, auth_client):
        res = auth_client.get("/contacts/accepted")
        assert res.status_code == 200
        assert res.json() == []