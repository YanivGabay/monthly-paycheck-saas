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
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "localhost,127.0.0.1").split(",")

app = FastAPI(
    title="Monthly Paycheck SaaS", 
    version="3.0.0 - AI Vision",
    debug=DEBUG,
    docs_url="/docs" if DEBUG else None,  # Hide docs in production
    redoc_url="/redoc" if DEBUG else None
)

# Security Middleware (order matters!)
if ENVIRONMENT == "production":
    # Only allow trusted hosts in production
    app.add_middleware(
        TrustedHostMiddleware, 
        allowed_hosts=ALLOWED_HOSTS
    )

# CORS Middleware
allowed_origins = []
if DEBUG:
    # Development: Allow local origins
    allowed_origins.extend([
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:8000"
    ])
else:
    # Production: Only allow your domain
    production_domain = os.getenv("PRODUCTION_DOMAIN")
    if production_domain:
        allowed_origins.extend([
            f"https://{production_domain}",
            f"https://www.{production_domain}"
        ])

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

# Include API routes
app.include_router(router)

# Serve React app static files
frontend_dist = Path("frontend/dist")
if frontend_dist.exists():
    # Production: Serve built React app
    static_dir = frontend_dist / "assets"
    if static_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(static_dir)), name="assets")
    
    @app.get("/{path:path}")
    async def serve_react_app(request: Request, path: str):
        """Serve React app for all non-API routes"""
        if path.startswith("api/"):
            # Let API routes handle this
            return
        
        # Serve index.html for React routing
        index_file = frontend_dist / "index.html"
        return FileResponse(index_file)
else:
    # Development: Show helpful message
    @app.get("/{path:path}")
    async def serve_development_message(request: Request, path: str):
        """Development fallback when React app isn't built"""
        if path.startswith("api/"):
            # Let API routes handle this
            return
        
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