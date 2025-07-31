import os
import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Dict, Optional, Tuple
from jose import JWTError, jwt
from google.auth.transport import requests
from google.oauth2 import id_token
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

class AuthService:
    """Lightweight auth service with Google OAuth and in-memory rate limiting"""
    
    def __init__(self):
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        self.jwt_secret = os.getenv("JWT_SECRET")
        if not self.jwt_secret or self.jwt_secret == "your-secret-key-change-this":
            logger.warning("⚠️ JWT_SECRET not set or using default value. Generate a secure secret for production!")
            self.jwt_secret = "your-secret-key-change-this"
        self.algorithm = "HS256"
        
        # Rate limiting configuration (from env variables)
        self.rate_limits = {
            "ai_calls": int(os.getenv("RATE_LIMIT_AI_CALLS_PER_DAY", "50")),
            "email_sends": int(os.getenv("RATE_LIMIT_EMAIL_SENDS_PER_DAY", "20")),
            "pdf_uploads": int(os.getenv("RATE_LIMIT_PDF_UPLOADS_PER_DAY", "10"))
        }
        
        # In-memory storage for user limits (resets on app restart - good for cost control!)
        self.user_limits: Dict[str, Dict] = {}
        
        if not self.google_client_id:
            logger.warning("⚠️ GOOGLE_CLIENT_ID not found in environment variables")
        
        logger.info(f"🔐 Auth Service initialized with rate limits: {self.rate_limits}")
    
    async def verify_google_token(self, google_token: str) -> Optional[Dict]:
        """Verify Google OAuth token and return user info"""
        try:
            # Verify the token with Google
            id_info = id_token.verify_oauth2_token(
                google_token, 
                requests.Request(), 
                self.google_client_id
            )
            
            # Extract user info
            user_info = {
                "google_user_id": id_info["sub"],
                "email": id_info["email"],
                "name": id_info.get("name", ""),
                "picture": id_info.get("picture", "")
            }
            
            logger.info(f"✅ Google token verified for user: {user_info['email']}")
            return user_info
            
        except ValueError as e:
            logger.error(f"❌ Invalid Google token: {e}")
            return None
        except Exception as e:
            logger.error(f"❌ Error verifying Google token: {e}")
            return None
    
    def create_jwt_token(self, user_info: Dict) -> str:
        """Create JWT token for the user"""
        payload = {
            "google_user_id": user_info["google_user_id"],
            "email": user_info["email"],
            "name": user_info["name"],
            "exp": datetime.now(timezone.utc) + timedelta(days=7)  # Token expires in 7 days
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm=self.algorithm)
        logger.info(f"🎫 JWT token created for user: {user_info['email']}")
        return token
    
    def verify_jwt_token(self, token: str) -> Optional[Dict]:
        """Verify JWT token and return user info"""
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.error(f"❌ Invalid JWT token: {e}")
            return None
    
    def _get_today_key(self) -> str:
        """Get today's date as string for rate limiting"""
        return datetime.now().strftime("%Y-%m-%d")
    
    def _init_user_limits(self, google_user_id: str):
        """Initialize rate limits for a new user or new day"""
        today = self._get_today_key()
        
        if google_user_id not in self.user_limits:
            self.user_limits[google_user_id] = {}
        
        user_data = self.user_limits[google_user_id]
        
        # Reset if it's a new day
        if user_data.get("last_reset") != today:
            user_data.update({
                "ai_calls_today": 0,
                "email_sends_today": 0,
                "pdf_uploads_today": 0,
                "last_reset": today
            })
    
    def check_rate_limit(self, google_user_id: str, endpoint_type: str) -> Tuple[bool, int, int]:
        """
        Check if user has exceeded rate limit for endpoint type.
        Returns: (is_allowed, current_count, limit)
        """
        self._init_user_limits(google_user_id)
        
        user_data = self.user_limits[google_user_id]
        current_count = user_data.get(f"{endpoint_type}_today", 0)
        limit = self.rate_limits.get(endpoint_type, 0)
        
        is_allowed = current_count < limit
        
        logger.info(f"🚦 Rate limit check for {google_user_id}: {endpoint_type} = {current_count}/{limit}")
        
        return is_allowed, current_count, limit
    
    def increment_usage(self, google_user_id: str, endpoint_type: str):
        """Increment usage counter for user and endpoint type"""
        self._init_user_limits(google_user_id)
        
        counter_key = f"{endpoint_type}_today"
        self.user_limits[google_user_id][counter_key] += 1
        
        new_count = self.user_limits[google_user_id][counter_key]
        logger.info(f"📊 Usage incremented for {google_user_id}: {endpoint_type} = {new_count}")
    
    def get_user_usage(self, google_user_id: str) -> Dict:
        """Get current usage statistics for user"""
        self._init_user_limits(google_user_id)
        
        user_data = self.user_limits[google_user_id]
        return {
            "ai_calls": {
                "used": user_data.get("ai_calls_today", 0),
                "limit": self.rate_limits["ai_calls"]
            },
            "email_sends": {
                "used": user_data.get("email_sends_today", 0),
                "limit": self.rate_limits["email_sends"]
            },
            "pdf_uploads": {
                "used": user_data.get("pdf_uploads_today", 0),
                "limit": self.rate_limits["pdf_uploads"]
            },
            "last_reset": user_data.get("last_reset", "never")
        } 