# User Flow Guide - PII Anonymization Application

## Complete User Journey

### 1. Landing Page (First Visit)
- User opens http://localhost:5173
- Sees landing page with "Get Started" button
- Click "Get Started" → redirects to **Login page**

### 2. Registration Flow
**If user doesn't have account:**
- On Login page, click "Sign up" link
- Fill registration form:
  - Username (minimum 3 characters)
  - Email
  - Password (minimum 6 characters)
  - Confirm Password
- Click "Sign Up" button
- See success message: "Registration successful! Redirecting to login..."
- **Automatically redirected to Login page after 2 seconds**

### 3. Login Flow
**After registration or for existing users:**
- Enter username and password
- Click "Sign In" button
- **Automatically logged in and redirected to Application page**

### 4. Application Page (Authenticated)
Once logged in, user sees:
- **Header** with:
  - Username displayed
  - Settings button
  - Home button (returns to landing page)
  - Logout button
- **Main Application** with PII detection features:
  - Text input area
  - Language selection
  - Analyze button
  - Results panel

### 5. Using the Application
- Enter text in the input field
- Select language (English/Russian)
- Click "Analyze" button
- View detected PII entities
- View anonymized text
- Copy results to clipboard

### 6. Logout Flow
- Click **Logout button** in header
- Tokens cleared from localStorage
- **Redirected to Login page**

### 7. Returning User
**When user opens app again:**
- If token is valid → **Automatically logged in to Application page**
- If token expired → **Redirected to Login page**

## View States

```
┌─────────────┐
│   Landing   │  (First visit, not authenticated)
└──────┬──────┘
       │ Click "Get Started"
       ▼
┌─────────────┐
│    Login    │  (Authentication required)
└──────┬──────┘
       │ Click "Sign up" link
       ▼
┌─────────────┐
│  Register   │  (Create new account)
└──────┬──────┘
       │ Success → Auto redirect (2 sec)
       ▼
┌─────────────┐
│    Login    │  (Enter credentials)
└──────┬──────┘
       │ Successful login
       ▼
┌─────────────┐
│ Application │  (Main PII detection page)
└──────┬──────┘
       │ Click Home button
       ▼
┌─────────────┐
│   Landing   │  (Still authenticated)
└─────────────┘
```

## Flow Diagram

```
Start App
    │
    ▼
[Check Auth Token]
    │
    ├─ Valid Token ──────────────┐
    │                             ▼
    └─ No/Invalid Token    [Application Page]
         │                       │
         ▼                       │
    [Landing Page]               │
         │                       │
    Click "Get Started"          │
         │                       │
         ▼                       │
    [Login Page] ◄───────────────┤
         │                       │
    Click "Sign up"              │
         │                       │
         ▼                       │
    [Register Page]              │
         │                       │
    Submit Form                  │
         │                       │
    Success Message              │
         │                       │
    Auto Redirect (2s)           │
         │                       │
         └──►[Login Page]        │
                  │               │
            Enter Credentials    │
                  │               │
            Click "Sign In"      │
                  │               │
            Successful Login     │
                  │               │
                  └───────────────┘
```

## Technical Flow Details

### State Management (App.tsx)

```typescript
const [currentView, setCurrentView] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
```

**View transitions:**
- `'landing'` → User clicks "Get Started" → `'login'`
- `'login'` → User clicks "Sign up" → `'register'`
- `'register'` → Registration success → `'login'` (after 2 seconds)
- `'login'` → Login success → `'app'` (automatic via isAuthenticated)
- `'app'` → User clicks Home → `'landing'`
- `'app'` → User clicks Logout → clears auth → `'login'`

### Authentication Logic

```typescript
// Auto-redirect to app if authenticated
if (isAuthenticated && currentView !== 'app') {
  setCurrentView('app');
}

// Prevent accessing app without auth
if (!isAuthenticated && currentView === 'app') {
  setCurrentView('login');
}
```

## Key Features

### 1. Landing Page
- Always accessible (even when authenticated)
- "Get Started" button → Login page
- No authentication required

### 2. Authentication Pages (Login/Register)
- Clean, modern UI with animations
- Form validation
- Error/success messages
- Easy switching between login and register

### 3. Application Page
- Protected route (requires authentication)
- Full PII detection functionality
- User info in header
- Easy logout
- Can return to landing page

## User Experience Flow

### New User Journey
1. Opens app → Sees landing page
2. Clicks "Get Started" → Login page
3. Clicks "Sign up" → Register page
4. Fills form and submits
5. Sees success message
6. **Auto-redirects to login (2 seconds)**
7. Enters credentials and logs in
8. **Lands on application page**
9. Uses PII detection features

### Returning User Journey
1. Opens app
2. **Token valid → Auto-logs in**
3. **Directly lands on application page**
4. Uses PII detection features

### Logout Journey
1. User on application page
2. Clicks logout button
3. Token cleared
4. **Redirected to login page**
5. Can login again or go to landing

## Important Notes

1. **Registration does NOT auto-login**
   - After registration, user is redirected to login
   - This is intentional for better UX and security

2. **Landing page is always accessible**
   - Even authenticated users can access it via "Home" button
   - This allows users to see app info

3. **Protected routes**
   - Application page requires authentication
   - Attempting to access without auth → redirect to login

4. **Token persistence**
   - Tokens stored in localStorage
   - Auto-loaded on app refresh
   - Valid tokens → auto-login

5. **Smooth transitions**
   - All page transitions are instant
   - No unnecessary loading states
   - Clear user feedback

## Testing the Flow

### Test 1: New User Registration
```
1. Open http://localhost:5173
2. Click "Get Started"
3. Click "Sign up"
4. Fill form and submit
5. Wait 2 seconds
6. Should be on login page
```

### Test 2: Login
```
1. On login page
2. Enter credentials
3. Click "Sign In"
4. Should land on application page
```

### Test 3: Logout
```
1. On application page
2. Click logout button
3. Should redirect to login page
```

### Test 4: Token Persistence
```
1. Login to app
2. Close browser tab
3. Reopen http://localhost:5173
4. Should auto-login to application page
```

### Test 5: Home Button
```
1. On application page
2. Click "Home" button
3. Should see landing page
4. Still authenticated
5. Can click "Get Started" to return to app
```

## Common Issues

### Issue: Stuck on landing page after login
**Solution:** Check if `isAuthenticated` is properly set in AuthContext

### Issue: Auto-redirect loop
**Solution:** Check the conditional logic in App.tsx for view transitions

### Issue: Registration doesn't redirect
**Solution:** Verify auth service is running on port 3002

### Issue: Logout doesn't work
**Solution:** Check if tokens are properly cleared from localStorage

## Summary

The user flow is designed to be intuitive and smooth:
- **Landing** → Entry point with clear call-to-action
- **Register** → Create account → Auto-redirect to login
- **Login** → Authenticate → Access application
- **Application** → Use features, can logout or go home
- **Persistence** → Tokens remembered across sessions
