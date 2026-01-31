"""User model for authentication."""

import bcrypt
from datetime import datetime
from typing import Optional, Dict, Any
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))

from database.db_config import get_db_cursor


class User:
    """User model with authentication methods."""

    def __init__(self, id: Optional[int] = None, username: str = "",
                 email: str = "", password_hash: str = "",
                 created_at: Optional[datetime] = None,
                 last_login: Optional[datetime] = None,
                 is_active: bool = True):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at
        self.last_login = last_login
        self.is_active = is_active

    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt."""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password: str, password_hash: str) -> bool:
        """Verify a password against its hash."""
        return bcrypt.checkpw(
            password.encode('utf-8'),
            password_hash.encode('utf-8')
        )

    @classmethod
    def create(cls, username: str, email: str, password: str) -> Optional['User']:
        """Create a new user."""
        try:
            password_hash = cls.hash_password(password)

            with get_db_cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO users (username, email, password_hash)
                    VALUES (%s, %s, %s)
                    RETURNING id, username, email, password_hash, created_at, last_login, is_active
                    """,
                    (username, email, password_hash)
                )
                row = cursor.fetchone()

                if row:
                    return cls(
                        id=row['id'],
                        username=row['username'],
                        email=row['email'],
                        password_hash=row['password_hash'],
                        created_at=row['created_at'],
                        last_login=row['last_login'],
                        is_active=row['is_active']
                    )
                return None
        except Exception as e:
            print(f"Error creating user: {e}")
            raise

    @classmethod
    def find_by_username(cls, username: str) -> Optional['User']:
        """Find a user by username."""
        try:
            with get_db_cursor(commit=False) as cursor:
                cursor.execute(
                    """
                    SELECT id, username, email, password_hash, created_at, last_login, is_active
                    FROM users
                    WHERE username = %s AND is_active = TRUE
                    """,
                    (username,)
                )
                row = cursor.fetchone()

                if row:
                    return cls(
                        id=row['id'],
                        username=row['username'],
                        email=row['email'],
                        password_hash=row['password_hash'],
                        created_at=row['created_at'],
                        last_login=row['last_login'],
                        is_active=row['is_active']
                    )
                return None
        except Exception as e:
            print(f"Error finding user by username: {e}")
            raise

    @classmethod
    def find_by_email(cls, email: str) -> Optional['User']:
        """Find a user by email."""
        try:
            with get_db_cursor(commit=False) as cursor:
                cursor.execute(
                    """
                    SELECT id, username, email, password_hash, created_at, last_login, is_active
                    FROM users
                    WHERE email = %s AND is_active = TRUE
                    """,
                    (email,)
                )
                row = cursor.fetchone()

                if row:
                    return cls(
                        id=row['id'],
                        username=row['username'],
                        email=row['email'],
                        password_hash=row['password_hash'],
                        created_at=row['created_at'],
                        last_login=row['last_login'],
                        is_active=row['is_active']
                    )
                return None
        except Exception as e:
            print(f"Error finding user by email: {e}")
            raise

    @classmethod
    def find_by_id(cls, user_id: int) -> Optional['User']:
        """Find a user by ID."""
        try:
            with get_db_cursor(commit=False) as cursor:
                cursor.execute(
                    """
                    SELECT id, username, email, password_hash, created_at, last_login, is_active
                    FROM users
                    WHERE id = %s AND is_active = TRUE
                    """,
                    (user_id,)
                )
                row = cursor.fetchone()

                if row:
                    return cls(
                        id=row['id'],
                        username=row['username'],
                        email=row['email'],
                        password_hash=row['password_hash'],
                        created_at=row['created_at'],
                        last_login=row['last_login'],
                        is_active=row['is_active']
                    )
                return None
        except Exception as e:
            print(f"Error finding user by ID: {e}")
            raise

    def update_last_login(self) -> bool:
        """Update the last login timestamp."""
        try:
            with get_db_cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE users
                    SET last_login = CURRENT_TIMESTAMP
                    WHERE id = %s
                    """,
                    (self.id,)
                )
                return True
        except Exception as e:
            print(f"Error updating last login: {e}")
            return False

    def to_dict(self) -> Dict[str, Any]:
        """Convert user to dictionary (excluding password hash)."""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }

    def __repr__(self):
        return f"<User {self.username}>"
