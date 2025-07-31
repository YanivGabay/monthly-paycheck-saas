import pytest
import os
import re
import json
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.services.auth_service import AuthService

class TestAuthService:
    """Test the authentication and rate limiting functionality"""
    
    def setup_method(self):
        """Setup test environment"""
        # Mock environment variables
        self.env_vars = {
            "GOOGLE_CLIENT_ID": "test_client_id",
            "GOOGLE_CLIENT_SECRET": "test_client_secret", 
            "JWT_SECRET": "test_jwt_secret",
            "RATE_LIMIT_AI_CALLS_PER_DAY": "5",
            "RATE_LIMIT_EMAIL_SENDS_PER_DAY": "3",
            "RATE_LIMIT_PDF_UPLOADS_PER_DAY": "2"
        }
        
        with patch.dict(os.environ, self.env_vars):
            from app.services.auth_service import AuthService
            self.auth_service = AuthService()
    
    def test_rate_limit_initialization(self):
        """Test that rate limits are properly initialized from env vars"""
        assert self.auth_service.rate_limits["ai_calls"] == 5
        assert self.auth_service.rate_limits["email_sends"] == 3
        assert self.auth_service.rate_limits["pdf_uploads"] == 2
    
    def test_jwt_token_creation_and_verification(self):
        """Test JWT token creation and verification"""
        user_info = {
            "google_user_id": "test_user_123",
            "email": "test@example.com", 
            "name": "Test User"
        }
        
        # Create token
        token = self.auth_service.create_jwt_token(user_info)
        assert token is not None
        
        # Verify token
        verified_info = self.auth_service.verify_jwt_token(token)
        assert verified_info is not None
        assert verified_info["google_user_id"] == "test_user_123"
        assert verified_info["email"] == "test@example.com"
    
    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        user_id = "test_user_123"
        
        # Test initial state - should be allowed
        is_allowed, count, limit = self.auth_service.check_rate_limit(user_id, "ai_calls")
        assert is_allowed is True
        assert count == 0
        assert limit == 5
        
        # Increment usage a few times
        for i in range(3):
            self.auth_service.increment_usage(user_id, "ai_calls")
        
        # Check updated count
        is_allowed, count, limit = self.auth_service.check_rate_limit(user_id, "ai_calls")
        assert is_allowed is True
        assert count == 3
        assert limit == 5
        
        # Reach the limit
        for i in range(2):
            self.auth_service.increment_usage(user_id, "ai_calls")
        
        # Should now be at limit (not allowed)
        is_allowed, count, limit = self.auth_service.check_rate_limit(user_id, "ai_calls")
        assert is_allowed is False
        assert count == 5
        assert limit == 5
    
    def test_user_usage_stats(self):
        """Test getting user usage statistics"""
        user_id = "test_user_123"
        
        # Increment some usage
        self.auth_service.increment_usage(user_id, "ai_calls")
        self.auth_service.increment_usage(user_id, "ai_calls")
        self.auth_service.increment_usage(user_id, "email_sends")
        
        # Get usage stats
        stats = self.auth_service.get_user_usage(user_id)
        
        assert stats["ai_calls"]["used"] == 2
        assert stats["ai_calls"]["limit"] == 5
        assert stats["email_sends"]["used"] == 1
        assert stats["email_sends"]["limit"] == 3
        assert stats["pdf_uploads"]["used"] == 0
        assert stats["pdf_uploads"]["limit"] == 2
    
    def test_invalid_jwt_token(self):
        """Test invalid JWT token handling"""
        invalid_token = "invalid.jwt.token"
        result = self.auth_service.verify_jwt_token(invalid_token)
        assert result is None
    
    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_token_verification_success(self, mock_verify):
        """Test successful Google token verification"""
        # Mock Google's response
        mock_verify.return_value = {
            "sub": "google_user_123",
            "email": "test@gmail.com",
            "name": "Test User",
            "picture": "https://example.com/pic.jpg"
        }
        
        result = self.auth_service.verify_google_token("valid_google_token")
        
        assert result is not None
        assert result["google_user_id"] == "google_user_123"
        assert result["email"] == "test@gmail.com"
        assert result["name"] == "Test User"
    
    @patch('google.oauth2.id_token.verify_oauth2_token')
    def test_google_token_verification_failure(self, mock_verify):
        """Test failed Google token verification"""
        # Mock Google's failure response
        mock_verify.side_effect = ValueError("Invalid token")
        
        result = self.auth_service.verify_google_token("invalid_google_token")
        assert result is None

class TestOAuthConfiguration:
    """Test Google OAuth configuration setup"""
    
    def test_backend_oauth_environment_variables(self):
        """Test that required backend OAuth environment variables are set"""
        required_vars = [
            "GOOGLE_CLIENT_ID",
            "GOOGLE_CLIENT_SECRET", 
            "JWT_SECRET"
        ]
        
        missing_vars = []
        for var in required_vars:
            if not os.getenv(var):
                missing_vars.append(var)
        
        assert not missing_vars, f"Missing required environment variables: {missing_vars}"
    
    def test_google_client_id_format(self):
        """Test that Google Client ID has the correct format"""
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        assert client_id, "GOOGLE_CLIENT_ID environment variable not set"
        
        # Google Client ID format: [digits]-[random].apps.googleusercontent.com
        pattern = r'^\d+-[a-zA-Z0-9]+\.apps\.googleusercontent\.com$'
        assert re.match(pattern, client_id), f"Invalid Google Client ID format: {client_id}"
    
    def test_frontend_env_file_exists(self):
        """Test that frontend .env file exists with required variables"""
        frontend_env_path = Path(__file__).parent.parent / "frontend" / ".env"
        
        if not frontend_env_path.exists():
            pytest.skip("Frontend .env file does not exist - create it with VITE_GOOGLE_CLIENT_ID")
        
        # Read the frontend .env file
        env_content = frontend_env_path.read_text()
        
        # Check for VITE_GOOGLE_CLIENT_ID
        assert "VITE_GOOGLE_CLIENT_ID=" in env_content, "VITE_GOOGLE_CLIENT_ID not found in frontend .env"
    
    def test_frontend_backend_client_id_match(self):
        """Test that frontend and backend use the same Google Client ID"""
        backend_client_id = os.getenv("GOOGLE_CLIENT_ID")
        assert backend_client_id, "Backend GOOGLE_CLIENT_ID not set"
        
        frontend_env_path = Path(__file__).parent.parent / "frontend" / ".env"
        if not frontend_env_path.exists():
            pytest.skip("Frontend .env file does not exist - skipping frontend/backend consistency check")
        
        env_content = frontend_env_path.read_text()
        
        # Extract VITE_GOOGLE_CLIENT_ID from frontend .env
        for line in env_content.split('\n'):
            if line.startswith('VITE_GOOGLE_CLIENT_ID='):
                frontend_client_id = line.split('=', 1)[1].strip()
                assert frontend_client_id == backend_client_id, \
                    f"Client ID mismatch: Frontend={frontend_client_id}, Backend={backend_client_id}"
                break
        else:
            pytest.fail("VITE_GOOGLE_CLIENT_ID not found in frontend .env file")
    
    def test_jwt_secret_strength(self):
        """Test that JWT secret is sufficiently strong"""
        jwt_secret = os.getenv("JWT_SECRET")
        assert jwt_secret, "JWT_SECRET environment variable not set"
        assert len(jwt_secret) >= 32, "JWT_SECRET should be at least 32 characters long"
    
    def test_rate_limit_configuration(self):
        """Test that rate limiting is properly configured"""
        rate_limit_vars = {
            "RATE_LIMIT_AI_CALLS_PER_DAY": 1,
            "RATE_LIMIT_EMAIL_SENDS_PER_DAY": 1,
            "RATE_LIMIT_PDF_UPLOADS_PER_DAY": 1
        }
        
        for var, min_value in rate_limit_vars.items():
            value = os.getenv(var)
            if value:  # If set, should be a valid positive integer
                try:
                    int_value = int(value)
                    assert int_value >= min_value, f"{var} should be at least {min_value}"
                except ValueError:
                    pytest.fail(f"{var} should be a valid integer, got: {value}")
    
    @pytest.mark.asyncio
    @patch('google.oauth2.id_token.verify_oauth2_token')
    async def test_oauth_integration_flow(self, mock_verify):
        """Test the complete OAuth integration flow"""
        # Mock successful Google token verification
        mock_verify.return_value = {
            "sub": "oauth_test_user_123",
            "email": "oauth_test@example.com",
            "name": "OAuth Test User",
            "picture": "https://example.com/pic.jpg"
        }
        
        # Test with actual environment variables
        from app.services.auth_service import AuthService
        auth_service = AuthService()
        
        # Test Google token verification (await the async method)
        result = await auth_service.verify_google_token("mock_google_token")
        assert result is not None
        assert result["google_user_id"] == "oauth_test_user_123"
        
        # Test JWT creation with verified user
        jwt_token = auth_service.create_jwt_token(result)
        assert jwt_token is not None
        
        # Test JWT verification
        verified_user = auth_service.verify_jwt_token(jwt_token)
        assert verified_user is not None
        assert verified_user["google_user_id"] == "oauth_test_user_123"
        assert verified_user["email"] == "oauth_test@example.com"

    @pytest.mark.asyncio
    async def test_google_oauth_origin_validation(self):
        """Test that Google accepts our origin for the configured Client ID"""
        import httpx
        import asyncio
        
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            pytest.skip("GOOGLE_CLIENT_ID not set")
        
        print(f"\n🔍 Testing Google OAuth origin validation...")
        print(f"📋 Client ID: {client_id}")
        
        # Test multiple origin variations to debug the issue
        origins_to_test = [
            "http://localhost:3000",
            "http://127.0.0.1:3000", 
            "http://localhost:8000",
            "https://localhost:3000"
        ]
        
        # Also test the exact URL pattern from browser with additional parameters
        browser_test_urls = [
            f"https://accounts.google.com/gsi/status?client_id={client_id}&cas=test&is_itp=true",
            f"https://accounts.google.com/gsi/status?client_id={client_id}&origin=http://localhost:3000&cas=test&is_itp=true"
        ]
        
        results = {}
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as http_client:
                for origin in origins_to_test:
                    test_url = f"https://accounts.google.com/gsi/status?client_id={client_id}&origin={origin}"
                    print(f"🧪 Testing origin: {origin}")
                    
                    try:
                        response = await http_client.get(test_url, headers={
                            'Referer': f'{origin}/',
                            'Origin': origin,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        })
                        
                        results[origin] = {
                            'status_code': response.status_code,
                            'content': response.text[:200] if response.text else 'No content'
                        }
                        
                        print(f"   📊 Status: {response.status_code}")
                        if response.status_code == 200:
                            print(f"   ✅ ACCEPTED: {origin}")
                        elif response.status_code == 403:
                            print(f"   ❌ REJECTED: {origin}")
                        else:
                            print(f"   ⚠️  UNKNOWN: {origin} (status {response.status_code})")
                            
                    except Exception as e:
                        results[origin] = {'error': str(e)}
                        print(f"   💥 ERROR: {e}")
                
                # Print summary
                print(f"\n📊 SUMMARY:")
                for origin, result in results.items():
                    if 'error' in result:
                        print(f"   {origin}: ERROR - {result['error']}")
                    else:
                        status = result['status_code']
                        emoji = "✅" if status == 200 else "❌" if status == 403 else "⚠️"
                        print(f"   {origin}: {emoji} HTTP {status}")
                
                # Check if the main origin (localhost:3000) is working
                main_result = results.get("http://localhost:3000", {})
                if 'error' not in main_result and main_result.get('status_code') == 200:
                    print(f"\n🎉 SUCCESS! Google accepts http://localhost:3000")
                    return
                elif 'error' not in main_result and main_result.get('status_code') == 403:
                    # Check if any origins work
                    working_origins = [origin for origin, result in results.items() 
                                     if 'error' not in result and result.get('status_code') == 200]
                    
                    error_msg = f"❌ Google still rejects 'http://localhost:3000' for Client ID: {client_id}\n"
                    
                    if working_origins:
                        error_msg += f"✅ But these origins work: {', '.join(working_origins)}\n"
                        error_msg += f"💡 Your app might be running on a different origin than expected.\n"
                    else:
                        error_msg += f"❌ None of the test origins work. This suggests:\n"
                        error_msg += f"   1. Google Cloud Console settings are not saved correctly\n"
                        error_msg += f"   2. You might be editing the wrong OAuth 2.0 Client ID\n"
                        error_msg += f"   3. The Client ID might be from a different Google Cloud project\n\n"
                    
                    error_msg += f"🔧 DEBUGGING STEPS:\n"
                    error_msg += f"   1. Double-check the OAuth 2.0 Client ID in Google Cloud Console\n"
                    error_msg += f"   2. Ensure you're in the correct Google Cloud project\n"
                    error_msg += f"   3. Verify the origins are saved with exactly: http://localhost:3000\n"
                    error_msg += f"   4. Try adding http://localhost:3000/ (with trailing slash) as well"
                    
                    pytest.fail(error_msg)
                else:
                    pytest.skip(f"Could not test origin validation - unexpected response or error")
                
        except httpx.TimeoutException:
            pytest.skip("Timeout connecting to Google - network issue or rate limiting")
        except Exception as e:
            pytest.skip(f"Cannot test Google origin validation: {e}")


if __name__ == "__main__":
    pytest.main([__file__]) 