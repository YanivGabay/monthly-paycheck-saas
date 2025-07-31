# Frontend Authentication Setup

## Google OAuth Configuration

To enable Google authentication, you need to:

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API** or **Google Identity** API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (when deploying)

### 2. Set Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
```

### 3. Backend Environment Variables

Make sure your backend `.env` includes:

```bash
# Google OAuth (same project as frontend)
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_here

# Rate Limiting (adjust as needed)
RATE_LIMIT_AI_CALLS_PER_DAY=50
RATE_LIMIT_EMAIL_SENDS_PER_DAY=20
RATE_LIMIT_PDF_UPLOADS_PER_DAY=10
```

### 4. Generate JWT Secret

For production, generate a secure JWT secret:

```bash
# Option 1: Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 2: Using OpenSSL
openssl rand -base64 32
```

### 5. Start the Application

```bash
# Backend
docker-compose up

# Frontend
cd frontend
npm run dev
```

### 6. Testing Authentication

1. Visit `http://localhost:3000`
2. You should see a login screen
3. Click "Sign in with Google"
4. Complete Google OAuth flow
5. You should be redirected to the app with your user info displayed

## Rate Limiting

The app includes built-in rate limiting:

- **AI Calls**: 50 per day (configurable)
- **Email Sends**: 20 per day (configurable) 
- **PDF Uploads**: 10 per day (configurable)

Rate limits reset daily and are tracked in-memory (resets when app restarts).

## Security Features

✅ **JWT tokens** with 7-day expiration  
✅ **Google OAuth** verification  
✅ **Rate limiting** for cost protection  
✅ **Token validation** on each request  
✅ **Automatic logout** on token expiration  
✅ **In-memory rate limits** (no persistent tracking) 