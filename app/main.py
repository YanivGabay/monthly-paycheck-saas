import logging
import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv

from .routes import router

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get environment settings
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"

# Domain configuration - simplified to one variable
PRODUCTION_DOMAIN = os.getenv("PRODUCTION_DOMAIN")

# Auto-generate allowed hosts from production domain
if PRODUCTION_DOMAIN:
    ALLOWED_HOSTS = [PRODUCTION_DOMAIN, f"www.{PRODUCTION_DOMAIN}", "localhost", "127.0.0.1"]
else:
    ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

app = FastAPI(
    title="Monthly Paycheck SaaS", 
    version="3.0.0 - AI Vision",
    debug=DEBUG,
    docs_url="/docs" if DEBUG else None,  # Hide docs in production
    redoc_url="/redoc" if DEBUG else None
)

# Security Middleware (order matters!)
if ENVIRONMENT == "production":
    # Check if we're on Railway (Railway sets RAILWAY_ENVIRONMENT)
    is_railway = os.getenv("RAILWAY_ENVIRONMENT") is not None
    
    if not is_railway:
        # Only use TrustedHostMiddleware on non-Railway deployments
        # Railway handles host validation at the platform level
        app.add_middleware(
            TrustedHostMiddleware, 
            allowed_hosts=ALLOWED_HOSTS
        )
        logger.info("🔒 TrustedHostMiddleware enabled for non-Railway production")
    else:
        logger.info("🚂 Railway deployment detected - skipping TrustedHostMiddleware")

# CORS Middleware  
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000"
    ] if DEBUG else [
        f"https://{PRODUCTION_DOMAIN}", f"https://www.{PRODUCTION_DOMAIN}"
    ] if PRODUCTION_DOMAIN else [],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=86400,  # 24 hours
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    
    if not DEBUG:
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    return response

# Include API routes FIRST (higher priority)
app.include_router(router)

# Test route to debug routing issues
@app.get("/test-route")
async def test_route():
    """Simple test route to check if routing works"""
    logger.info("🧪 Test route accessed!")
    return {"message": "Test route works!", "status": "success"}

# Root route now handled by router - see app/routes.py

# Serve React app static files
frontend_dist = Path("frontend/dist")
logger.info(f"🔍 Checking frontend dist at: {frontend_dist.absolute()}")
logger.info(f"📁 Frontend dist exists: {frontend_dist.exists()}")

if frontend_dist.exists():
    logger.info("✅ Production mode: Serving built React app")
    # Production: Serve built React app
    static_dir = frontend_dist / "assets"
    if static_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(static_dir)), name="assets")
        logger.info(f"📦 Mounted static assets from: {static_dir}")
    else:
        logger.warning(f"⚠️ Assets directory not found: {static_dir}")
    
    # Catch-all route for React app (must be last)
    @app.get("/{path:path}")
    async def serve_react_app(path: str):
        """Serve React app for all non-API routes"""
        try:
            # Debug logging
            logger.info(f"🎯 Serving React app for path: '{path}'")
            logger.info(f"📁 Frontend dist path: {frontend_dist}")
            logger.info(f"📄 Index file exists: {(frontend_dist / 'index.html').exists()}")
            
            # Serve index.html for React routing (React will handle the path)
            index_file = frontend_dist / "index.html"
            if index_file.exists():
                return FileResponse(index_file)
            else:
                logger.error(f"❌ Index file not found: {index_file}")
                return HTMLResponse("Frontend index.html not found", status_code=500)
        except Exception as e:
            logger.error(f"❌ Error serving React app: {e}")
            return HTMLResponse(f"Error serving frontend: {str(e)}", status_code=500)
else:
    # Development: Show helpful message  
    @app.get("/{path:path}")
    async def serve_development_message(request: Request, path: str):
        """Development fallback when React app isn't built"""
        # API routes are already handled above
        
        return HTMLResponse("""
        <html>
            <body style="font-family: Arial; text-align: center; margin-top: 100px; color: #333;">
                <h1>🚀 Monthly Paycheck SaaS</h1>
                <h2>Development Mode</h2>
                <p>React frontend is running separately on port 3000</p>
                <div style="margin: 20px;">
                    <a href="http://localhost:3000" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open React App</a>
                </div>
                <br>
                <p><a href="/docs" style="color: #3b82f6;">📖 API Documentation</a></p>
                <p><a href="/api/health" style="color: #10b981;">✅ Health Check</a></p>
            </body>
        </html>
        """, media_type="text/html")
    
    logger.info("🔧 Development mode: React frontend should run on port 3000")

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Monthly Paycheck SaaS v3.0 - AI Vision Started!")
    logger.info("📋 Features: OpenRouter + Gemini Vision for Hebrew name extraction")
    logger.info("🔧 Clean architecture with separated routes and services") 