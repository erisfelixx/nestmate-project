import pytest

class TestGroupsAPI:
    def test_create_group_success(self, auth_client):
        """Перевірка успішного створення групи співмешканців"""
        # Спочатку створюємо профіль, оскільки бекенд вимагає його наявності
        auth_client.post("/profiles/", json={
            "name": "Влад", "city": "Львів", "is_active_search": True
        })
        
        res = auth_client.post("/groups/", json={
            "name": "Організовані програмісти",
            "city": "Львів",
            "budget_min": 5000,
            "budget_max": 8000,
            "target_size": 3,
            "description": "Шукаємо третю людину"
        })
        assert res.status_code == 201
        # Перевіряємо наявність ID групи у відповіді
        assert "group_id" in res.json()

    def test_get_groups_list(self, auth_client):
        """Перевірка, що список груп доступний авторизованим користувачам"""
        auth_client.post("/profiles/", json={"name": "Влад", "is_active_search": True})
        res = auth_client.get("/groups/")
        assert res.status_code == 200
        assert isinstance(res.json(), list)

    def test_apply_to_group_success(self, auth_client, client):
        """Тест подачі заявки до групи від ІНШОГО користувача"""
        # 1. Перший юзер (auth_client) створює профіль і групу
        auth_client.post("/profiles/", json={"name": "Лідер", "is_active_search": True})
        group_res = auth_client.post("/groups/", json={
            "name": "Dream Team", "city": "Київ", "target_size": 3, "budget_max": 10000
        })
        group_id = group_res.json()["group_id"]

        # 2. Другий юзер (звичайний client) реєструється, авторизується і створює свій профіль
        client.post("/auth/register", json={"email": "second@test.com", "password": "pass"})
        login_res = client.post("/auth/login", data={"username": "second@test.com", "password": "pass"})
        
        # Додаємо токен другого юзера в заголовки
        token = login_res.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token}"})
        
        # Другий юзер створює свій профіль
        client.post("/profiles/", json={"name": "Кандидат", "is_active_search": True})

        # 3. Подаємо заявку від ДРУГОГО юзера
        apply_res = client.post(f"/groups/{group_id}/apply")
        assert apply_res.status_code == 201