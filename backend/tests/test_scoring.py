import pytest
from unittest.mock import MagicMock
from app.ai.scoring import (
    calculate_compatibility,
    score_schedule,
    score_numeric,
    score_pets,
    score_smoking,
    score_children,
)

def make_profile(**kwargs):
    """Створює mock-профіль з дефолтними значеннями"""
    defaults = {
        "schedule": "early_bird",
        "cleanliness": 4,
        "noise_level": 4,
        "guests_frequency": 4,
        "has_pets": False,
        "ok_with_pets": True,
        "smoking": False,
        "ok_with_smoking": False,
        "has_children": False,
        "ok_with_children": True,
    }
    defaults.update(kwargs)
    profile = MagicMock()
    for key, val in defaults.items():
        setattr(profile, key, val)
    return profile


class TestScoreSchedule:
    def test_same_schedule_returns_1(self):
        a = make_profile(schedule="early_bird")
        b = make_profile(schedule="early_bird")
        assert score_schedule(a, b) == 1.0

    def test_different_schedule_returns_0(self):
        a = make_profile(schedule="early_bird")
        b = make_profile(schedule="night_owl")
        assert score_schedule(a, b) == 0.0

    def test_none_schedule_returns_neutral(self):
        a = make_profile(schedule=None)
        b = make_profile(schedule="early_bird")
        assert score_schedule(a, b) == 0.5


class TestScoreNumeric:
    def test_identical_values_returns_1(self):
        assert score_numeric(5, 5) == 1.0

    def test_max_difference_returns_0(self):
        assert score_numeric(1, 7) == 0.0

    def test_partial_difference(self):
        # |4 - 6| / 6 = 0.333 → 0.667
        result = score_numeric(4, 6)
        assert abs(result - 0.667) < 0.01

    def test_none_value_returns_neutral(self):
        assert score_numeric(None, 5) == 0.5


class TestScorePets:
    def test_no_pets_both_ok(self):
        a = make_profile(has_pets=False, ok_with_pets=True)
        b = make_profile(has_pets=False, ok_with_pets=True)
        assert score_pets(a, b) == 1.0

    def test_a_has_pets_b_not_ok(self):
        a = make_profile(has_pets=True, ok_with_pets=True)
        b = make_profile(has_pets=False, ok_with_pets=False)
        assert score_pets(a, b) == 0.0

    def test_a_has_pets_b_ok(self):
        a = make_profile(has_pets=True)
        b = make_profile(ok_with_pets=True)
        assert score_pets(a, b) == 1.0


class TestScoreSmoking:
    def test_neither_smokes(self):
        a = make_profile(smoking=False)
        b = make_profile(smoking=False, ok_with_smoking=False)
        assert score_smoking(a, b) == 1.0

    def test_a_smokes_b_not_ok(self):
        a = make_profile(smoking=True)
        b = make_profile(ok_with_smoking=False)
        assert score_smoking(a, b) == 0.0

    def test_a_smokes_b_ok(self):
        a = make_profile(smoking=True)
        b = make_profile(ok_with_smoking=True)
        assert score_smoking(a, b) == 1.0

    def test_neither_smokes_b_not_ok(self):
        """Якщо А не курить — Б не ок з курінням не має значення"""
        a = make_profile(smoking=False)
        b = make_profile(ok_with_smoking=False)
        assert score_smoking(a, b) == 1.0


class TestScoreChildren:
    def test_no_children_b_not_ok(self):
        """Якщо А не має дітей — не ок з дітьми у Б не має значення"""
        a = make_profile(has_children=False)
        b = make_profile(ok_with_children=False)
        assert score_children(a, b) == 1.0

    def test_a_has_children_b_not_ok(self):
        a = make_profile(has_children=True)
        b = make_profile(ok_with_children=False)
        assert score_children(a, b) == 0.0

    def test_a_has_children_b_ok(self):
        a = make_profile(has_children=True)
        b = make_profile(ok_with_children=True)
        assert score_children(a, b) == 1.0


class TestCalculateCompatibility:
    def test_identical_profiles_returns_100(self):
        a = make_profile()
        b = make_profile()
        result = calculate_compatibility(a, b)
        assert result["total"] == 100.0

    def test_result_never_exceeds_100(self):
        a = make_profile()
        b = make_profile()
        result = calculate_compatibility(a, b)
        assert result["total"] <= 100.0

    def test_result_never_below_0(self):
        a = make_profile(
            schedule="early_bird", smoking=True,
            has_children=True, has_pets=True
        )
        b = make_profile(
            schedule="night_owl", ok_with_smoking=False,
            ok_with_children=False, ok_with_pets=False
        )
        result = calculate_compatibility(a, b)
        assert result["total"] >= 0.0

    def test_smoking_conflict_reduces_score_by_20(self):
        """Куріння має вагу 0.20 → конфлікт зменшує на 20%"""
        perfect = make_profile()
        with_smoking_conflict = make_profile(smoking=True)
        not_ok_smoking = make_profile(ok_with_smoking=False)

        perfect_score = calculate_compatibility(perfect, perfect)["total"]
        conflict_score = calculate_compatibility(
            with_smoking_conflict, not_ok_smoking
        )["total"]

        assert abs(perfect_score - conflict_score - 20.0) < 0.1

    def test_breakdown_contains_all_criteria(self):
        a = make_profile()
        b = make_profile()
        result = calculate_compatibility(a, b)
        expected_keys = {
            "Режим дня", "Чистота", "Рівень шуму",
            "Гості", "Тварини", "Куріння"
        }
        assert set(result["breakdown"].keys()) == expected_keys

    def test_breakdown_values_between_0_and_100(self):
        a = make_profile()
        b = make_profile(schedule="night_owl", cleanliness=1)
        result = calculate_compatibility(a, b)
        for val in result["breakdown"].values():
            assert 0 <= val <= 100