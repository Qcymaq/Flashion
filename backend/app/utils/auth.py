from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.schemas.user import User, UserInDB
from app.utils.database import get_database
import os
import logging
import secrets
from dotenv import load_dotenv
from bson import ObjectId

load_dotenv()

logger = logging.getLogger(__name__)

# Example values from .env.example / old docs. They must never be used as a real secret.
_PLACEHOLDER_SECRETS = {"change-me", "changeme", "your-secret-key"}

# Only these ENV values allow running without a real JWT_SECRET.
_DEVELOPMENT_ENVIRONMENTS = {"development", "dev"}
_PRODUCTION_ENVIRONMENTS = {"production", "prod"}


def get_environment() -> str:
    """Return the deployment environment from ENV (or ENVIRONMENT), lower-cased.

    Defaults to "development" when neither variable is set. backend/startup.sh
    uses the same rule, and the backend Docker image sets ENV=production.
    """
    return (os.getenv("ENV") or os.getenv("ENVIRONMENT") or "development").strip().lower()


def is_development() -> bool:
    return get_environment() in _DEVELOPMENT_ENVIRONMENTS


def is_production() -> bool:
    return get_environment() in _PRODUCTION_ENVIRONMENTS


def _is_placeholder_secret(value: str) -> bool:
    lowered = value.lower()
    return lowered in _PLACEHOLDER_SECRETS or lowered.startswith("your-super-secret")


def _load_jwt_secret() -> str:
    """Read the JWT signing secret from JWT_SECRET (preferred) or SECRET_KEY.

    Only in development (ENV=development or dev, or no ENV at all) is a random
    secret generated for this process. In every other environment, including
    unknown values such as "staging" or a typo, a missing or placeholder secret
    stops the app from starting (fail closed).
    """
    secret = (os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or "").strip()
    if secret and not _is_placeholder_secret(secret):
        return secret

    if not is_development():
        raise RuntimeError(
            f"JWT_SECRET is not set or still uses an example placeholder (ENV={get_environment()}). "
            "Refusing to start: a random secret is only allowed when ENV is development or dev. "
            "Set JWT_SECRET to a long random value, "
            "for example the output of: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
        )

    logger.warning(
        "\n"
        "**********************************************************************\n"
        "* WARNING: JWT_SECRET is not set (ENV=%s).\n"
        "* Using a random secret for this process only. All login tokens\n"
        "* become invalid when the server restarts. Set JWT_SECRET in your\n"
        "* .env file. Never run like this in production.\n"
        "**********************************************************************",
        get_environment(),
    )
    return secrets.token_urlsafe(64)


# Security
SECRET_KEY = _load_jwt_secret()
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 43200))  # 1 month default

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    db = get_database()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise credentials_exception
    
    return UserInDB(**user)

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    if not getattr(current_user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return current_user

async def get_current_admin_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to perform admin actions"
        )
    return current_user 