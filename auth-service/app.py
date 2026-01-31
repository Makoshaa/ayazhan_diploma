"""REST API server for authentication service."""

import json
import logging
import os
import sys
from datetime import timedelta
from pathlib import Path

from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.exceptions import HTTPException

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from database.db_config import init_database, test_connection
from models.user import User

DEFAULT_PORT = "3002"

# JWT Configuration
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)


class AuthServer:
    """HTTP Server for authentication."""

    def __init__(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger("auth-service")
        self.app = Flask(__name__)

        # Configure JWT
        self.app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
        self.app.config['JWT_ACCESS_TOKEN_EXPIRES'] = JWT_ACCESS_TOKEN_EXPIRES
        self.app.config['JWT_REFRESH_TOKEN_EXPIRES'] = JWT_REFRESH_TOKEN_EXPIRES

        CORS(self.app)
        self.jwt = JWTManager(self.app)

        # Initialize database
        self.logger.info("Initializing database...")
        if not test_connection():
            self.logger.error("Failed to connect to database!")
        else:
            init_database()
            self.logger.info("Database initialized successfully")

        self.logger.info("Auth service starting...")

        @self.app.route("/health")
        def health() -> str:
            """Return basic health probe result."""
            return "Auth service is up"

        @self.app.route("/api/auth/register", methods=["POST"])
        def register():
            """Register a new user."""
            try:
                data = request.get_json()

                if not data:
                    return jsonify({"error": "No data provided"}), 400

                username = data.get('username', '').strip()
                email = data.get('email', '').strip()
                password = data.get('password', '')

                # Validation
                if not username or len(username) < 3:
                    return jsonify({"error": "Username must be at least 3 characters"}), 400

                if not email or '@' not in email:
                    return jsonify({"error": "Valid email is required"}), 400

                if not password or len(password) < 6:
                    return jsonify({"error": "Password must be at least 6 characters"}), 400

                # Check if user already exists
                existing_user = User.find_by_username(username)
                if existing_user:
                    return jsonify({"error": "Username already exists"}), 409

                existing_email = User.find_by_email(email)
                if existing_email:
                    return jsonify({"error": "Email already exists"}), 409

                # Create new user
                user = User.create(username=username, email=email, password=password)

                if not user:
                    return jsonify({"error": "Failed to create user"}), 500

                # Generate tokens
                access_token = create_access_token(identity=user.id)
                refresh_token = create_refresh_token(identity=user.id)

                self.logger.info(f"New user registered: {username}")

                return jsonify({
                    "message": "User registered successfully",
                    "user": user.to_dict(),
                    "access_token": access_token,
                    "refresh_token": refresh_token
                }), 201

            except Exception as e:
                self.logger.error(f"Registration error: {e}")
                return jsonify({"error": "Internal server error"}), 500

        @self.app.route("/api/auth/login", methods=["POST"])
        def login():
            """Login user."""
            try:
                data = request.get_json()

                if not data:
                    return jsonify({"error": "No data provided"}), 400

                username = data.get('username', '').strip()
                password = data.get('password', '')

                if not username or not password:
                    return jsonify({"error": "Username and password are required"}), 400

                # Find user
                user = User.find_by_username(username)

                if not user:
                    return jsonify({"error": "Invalid username or password"}), 401

                # Verify password
                if not User.verify_password(password, user.password_hash):
                    return jsonify({"error": "Invalid username or password"}), 401

                # Update last login
                user.update_last_login()

                # Generate tokens
                access_token = create_access_token(identity=user.id)
                refresh_token = create_refresh_token(identity=user.id)

                self.logger.info(f"User logged in: {username}")

                return jsonify({
                    "message": "Login successful",
                    "user": user.to_dict(),
                    "access_token": access_token,
                    "refresh_token": refresh_token
                }), 200

            except Exception as e:
                self.logger.error(f"Login error: {e}")
                return jsonify({"error": "Internal server error"}), 500

        @self.app.route("/api/auth/refresh", methods=["POST"])
        @jwt_required(refresh=True)
        def refresh():
            """Refresh access token."""
            try:
                current_user_id = get_jwt_identity()

                # Verify user still exists and is active
                user = User.find_by_id(current_user_id)
                if not user:
                    return jsonify({"error": "User not found"}), 404

                # Generate new access token
                access_token = create_access_token(identity=current_user_id)

                return jsonify({
                    "access_token": access_token
                }), 200

            except Exception as e:
                self.logger.error(f"Token refresh error: {e}")
                return jsonify({"error": "Internal server error"}), 500

        @self.app.route("/api/auth/me", methods=["GET"])
        @jwt_required()
        def get_current_user():
            """Get current user info."""
            try:
                current_user_id = get_jwt_identity()

                user = User.find_by_id(current_user_id)
                if not user:
                    return jsonify({"error": "User not found"}), 404

                return jsonify({
                    "user": user.to_dict()
                }), 200

            except Exception as e:
                self.logger.error(f"Get user error: {e}")
                return jsonify({"error": "Internal server error"}), 500

        @self.app.route("/api/auth/verify", methods=["GET"])
        @jwt_required()
        def verify_token():
            """Verify JWT token."""
            try:
                current_user_id = get_jwt_identity()

                user = User.find_by_id(current_user_id)
                if not user:
                    return jsonify({"valid": False, "error": "User not found"}), 404

                return jsonify({
                    "valid": True,
                    "user": user.to_dict()
                }), 200

            except Exception as e:
                self.logger.error(f"Token verification error: {e}")
                return jsonify({"valid": False, "error": "Invalid token"}), 401

        @self.app.errorhandler(HTTPException)
        def http_exception(e):
            return jsonify(error=e.description), e.code

        @self.jwt.expired_token_loader
        def expired_token_callback(jwt_header, jwt_payload):
            return jsonify({"error": "Token has expired"}), 401

        @self.jwt.invalid_token_loader
        def invalid_token_callback(error):
            return jsonify({"error": "Invalid token"}), 401

        @self.jwt.unauthorized_loader
        def missing_token_callback(error):
            return jsonify({"error": "Authorization token is missing"}), 401


def create_app():
    """Create Flask app."""
    server = AuthServer()
    return server.app


if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", DEFAULT_PORT))
    app.run(host="0.0.0.0", port=port, debug=True)
