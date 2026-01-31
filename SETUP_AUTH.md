# Authentication System Setup Guide

## Overview
This guide will help you set up the authentication system with PostgreSQL for the PII Anonymization application.

## Prerequisites
- PostgreSQL 12+ installed and running
- Python 3.8+ with virtual environment
- Node.js 16+ and npm
- Database: `ayazhan_db` created in PostgreSQL

## Step 1: Database Setup

### Create Database (if not exists)
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE ayazhan_db;

# Exit psql
\q
```

### Initialize Database Schema
The database schema will be automatically initialized when you first run the auth service. The schema includes:
- `users` table - stores user credentials
- `user_sessions` table - tracks user sessions
- `auth_logs` table - audit log for authentication events

## Step 2: Install Python Dependencies

```bash
# Activate virtual environment
.venv\Scripts\activate

# Install new dependencies
pip install -r requirements.txt
```

New dependencies added:
- `psycopg2-binary` - PostgreSQL adapter
- `flask-jwt-extended` - JWT authentication
- `bcrypt` - Password hashing
- `python-dotenv` - Environment variables

## Step 3: Configure Environment Variables

The `.env` file has been updated with:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ayazhan_db
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Configuration
JWT_SECRET_KEY=my-super-secret-key-2024

# Service Ports
ANALYZER_PORT=3000
ANONYMIZER_PORT=3001
AUTH_PORT=3002
FRONTEND_PORT=5173
```

**IMPORTANT:** Change `JWT_SECRET_KEY` in production!

## Step 4: Start All Services

### Option 1: Use the batch file (Windows)
```bash
start_all.bat
```

This will start:
1. Auth Service (Port 3002)
2. Analyzer Service (Port 3000)
3. Anonymizer Service (Port 3001)
4. Frontend (Port 5173)

### Option 2: Manual start (each in separate terminal)

**Terminal 1 - Auth Service:**
```bash
cd auth-service
..\.venv\Scripts\activate
python app.py
```

**Terminal 2 - Analyzer Service:**
```bash
cd presidio-analyzer
..\.venv\Scripts\activate
python app.py
```

**Terminal 3 - Anonymizer Service:**
```bash
cd presidio-anonymizer
..\.venv\Scripts\activate
python app.py
```

**Terminal 4 - Frontend:**
```bash
cd frontend-react
npm run dev
```

## Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

You will be presented with a login screen.

## Authentication Features

### 1. User Registration
- Username (minimum 3 characters)
- Email (valid email format)
- Password (minimum 6 characters)
- Automatic login after registration

### 2. User Login
- Username and password authentication
- JWT tokens (access token + refresh token)
- Tokens stored in localStorage
- Automatic token validation on page load

### 3. Session Management
- Access tokens expire after 1 hour
- Refresh tokens expire after 30 days
- Automatic logout on token expiration
- User info displayed in header

### 4. Protected Routes
- All PII analysis features require authentication
- Unauthorized access redirects to login
- Auth token included in all API requests

## API Endpoints

### Auth Service (Port 3002)

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

Response:
{
  "message": "User registered successfully",
  "user": { ... },
  "access_token": "...",
  "refresh_token": "..."
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "access_token": "...",
  "refresh_token": "..."
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <access_token>

Response:
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "created_at": "2024-01-10T10:00:00",
    "last_login": "2024-01-10T11:00:00",
    "is_active": true
  }
}
```

#### Verify Token
```
GET /api/auth/verify
Authorization: Bearer <access_token>

Response:
{
  "valid": true,
  "user": { ... }
}
```

#### Refresh Token
```
POST /api/auth/refresh
Authorization: Bearer <refresh_token>

Response:
{
  "access_token": "..."
}
```

## Database Schema

### users table
```sql
- id (SERIAL PRIMARY KEY)
- username (VARCHAR(80) UNIQUE)
- email (VARCHAR(120) UNIQUE)
- password_hash (VARCHAR(255))
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
- is_active (BOOLEAN)
```

### user_sessions table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users)
- session_token (VARCHAR(500))
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- ip_address (VARCHAR(45))
- user_agent (TEXT)
```

### auth_logs table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER REFERENCES users)
- event_type (VARCHAR(50))
- ip_address (VARCHAR(45))
- user_agent (TEXT)
- success (BOOLEAN)
- error_message (TEXT)
- created_at (TIMESTAMP)
```

## Testing

### Test User Registration
1. Open http://localhost:5173
2. Click "Sign up"
3. Fill in registration form
4. You should be automatically logged in

### Test User Login
1. Logout (click logout button in header)
2. Enter username and password
3. Click "Sign In"
4. You should be logged in and see the main application

### Test Protected Routes
1. Try to access analyzer without login
2. You should be redirected to login page
3. After login, you can use all features

## Troubleshooting

### Database Connection Error
```
Error: Could not connect to database
Solution: Check PostgreSQL is running and credentials in .env are correct
```

### Auth Service Not Starting
```
Error: ModuleNotFoundError
Solution: Install dependencies: pip install -r requirements.txt
```

### JWT Token Error
```
Error: Invalid token
Solution: Clear localStorage and login again
```

### Port Already in Use
```
Error: Port 3002 is already in use
Solution: Kill the process using that port or change AUTH_PORT in .env
```

## Security Considerations

1. **Change JWT Secret**: Update `JWT_SECRET_KEY` in production
2. **Use HTTPS**: Enable SSL/TLS in production
3. **Password Requirements**: Enforce stronger passwords
4. **Rate Limiting**: Add rate limiting to prevent brute force
5. **CORS Configuration**: Restrict CORS origins in production
6. **Token Storage**: Consider using httpOnly cookies instead of localStorage
7. **Database Credentials**: Use environment variables, never commit to git

## Next Steps

- [ ] Add password reset functionality
- [ ] Add email verification
- [ ] Add two-factor authentication
- [ ] Add role-based access control
- [ ] Add session management UI
- [ ] Add audit log viewer
- [ ] Add user profile management

## Support

For issues or questions, refer to the main README.md or create an issue in the repository.
