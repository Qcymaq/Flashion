"""Tests for how the JWT secret is chosen from ENV / JWT_SECRET."""
import pytest

from app.utils import auth


@pytest.fixture
def clean_env(monkeypatch):
    for name in ("ENV", "ENVIRONMENT", "JWT_SECRET", "SECRET_KEY"):
        monkeypatch.delenv(name, raising=False)
    return monkeypatch


def test_real_secret_is_used(clean_env):
    clean_env.setenv("ENV", "production")
    clean_env.setenv("JWT_SECRET", "test-only-real-looking-secret")
    assert auth._load_jwt_secret() == "test-only-real-looking-secret"


@pytest.mark.parametrize("env", [None, "development", "dev", "DEVELOPMENT"])
def test_development_without_secret_uses_a_random_secret(clean_env, env):
    if env is not None:
        clean_env.setenv("ENV", env)
    first = auth._load_jwt_secret()
    second = auth._load_jwt_secret()
    assert first and second and first != second


@pytest.mark.parametrize("env", ["production", "prod", "staging", "prodution"])
def test_other_environments_refuse_to_start_without_secret(clean_env, env):
    clean_env.setenv("ENV", env)
    with pytest.raises(RuntimeError):
        auth._load_jwt_secret()


@pytest.mark.parametrize("env", ["production", "staging"])
def test_placeholder_secret_is_refused_outside_development(clean_env, env):
    clean_env.setenv("ENV", env)
    clean_env.setenv("JWT_SECRET", "change-me")
    with pytest.raises(RuntimeError):
        auth._load_jwt_secret()


def test_environment_alias_is_used_when_env_is_missing(clean_env):
    clean_env.setenv("ENVIRONMENT", "staging")
    with pytest.raises(RuntimeError):
        auth._load_jwt_secret()
