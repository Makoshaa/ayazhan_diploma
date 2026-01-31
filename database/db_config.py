"""Database configuration and connection management."""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
import logging

logger = logging.getLogger(__name__)


class DatabaseConfig:
    """PostgreSQL database configuration."""

    def __init__(self):
        self.host = os.getenv('DB_HOST', 'localhost')
        self.port = os.getenv('DB_PORT', '5432')
        self.database = os.getenv('DB_NAME', 'ayazhan_db')
        self.user = os.getenv('DB_USER', 'postgres')
        self.password = os.getenv('DB_PASSWORD', 'postgres')

    def get_connection_string(self):
        """Get database connection string."""
        return f"host={self.host} port={self.port} dbname={self.database} user={self.user} password={self.password}"

    def get_connection(self):
        """Create a new database connection."""
        try:
            conn = psycopg2.connect(
                host=self.host,
                port=self.port,
                database=self.database,
                user=self.user,
                password=self.password
            )
            return conn
        except psycopg2.Error as e:
            logger.error(f"Database connection error: {e}")
            raise


db_config = DatabaseConfig()


@contextmanager
def get_db_connection():
    """Context manager for database connections."""
    conn = db_config.get_connection()
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database transaction error: {e}")
        raise
    finally:
        conn.close()


@contextmanager
def get_db_cursor(commit=True):
    """Context manager for database cursor with dictionary results."""
    conn = db_config.get_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    try:
        yield cursor
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database cursor error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()


def init_database():
    """Initialize database with schema."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()

            # Read and execute init script
            init_script_path = os.path.join(
                os.path.dirname(__file__),
                'init_db.sql'
            )

            with open(init_script_path, 'r', encoding='utf-8') as f:
                sql_script = f.read()
                cursor.execute(sql_script)

            cursor.close()
            logger.info("Database initialized successfully")
            return True
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        return False


def test_connection():
    """Test database connection."""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()
            cursor.close()
            logger.info(f"Database connection successful. PostgreSQL version: {version[0]}")
            return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
