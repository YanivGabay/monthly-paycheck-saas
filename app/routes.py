import os
import tempfile
import uuid
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import List, Dict

from fastapi import APIRouter, File, UploadFile, Request, HTTPException, Form, Depends, Header
from fastapi.responses import JSONResponse, FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from pdf2image import convert_from_path

from .config import CompanyTemplate, CropArea, config_manager
from .services.ai_vision import AIVisionService
from .services.pdf_service import PDFService
from .services.email_service import EmailService
from .services.auth_service import AuthService

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize services
ai_vision = AIVisionService()
pdf_service = PDFService()
email_service = EmailService()
auth_service = AuthService()

# Security scheme for JWT tokens
security = HTTPBearer()

# Input validation models
class GoogleAuthRequest(BaseModel):
    token: str = Field(..., min_length=10, max_length=2000)

class ProcessPayslipRequest(BaseModel):
    company_id: str = Field(..., min_length=1, max_length=100, pattern="^[a-zA-Z0-9_-]+$")

# File size limits (configurable via env)
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE_MB", "10")) * 1024 * 1024  # Default 10MB

# Note: Templates removed - now serving React app

# Create router
router = APIRouter()

# Health check endpoint
@router.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "3.0.0",
        "environment": os.getenv("ENVIRONMENT", "development")
    }

# Test route for debugging (with /api prefix like working routes)
@router.get("/api/test-router")
async def test_router_route():
    """Test route via router to debug routing issues"""
    print("🧪 API Router test route accessed!")
    return {"message": "API Router test route works!", "status": "success", "path": "via_api_router"}

# Test route for frontend serving
@router.get("/api/frontend-test")
async def test_frontend_serving():
    """Test frontend file serving"""
    from pathlib import Path
    from fastapi.responses import FileResponse
    print("🎯 Testing frontend serving via API route")
    
    frontend_dist = Path("frontend/dist")
    index_file = frontend_dist / "index.html"
    print(f"📄 Index file exists: {index_file.exists()}")
    print(f"📁 Full path: {index_file.absolute()}")
    
    if index_file.exists():
        print("✅ Returning FileResponse for index.html via API route")
        return FileResponse(index_file)
    else:
        print(f"❌ Index file not found: {index_file}")
        return {"error": "Frontend not found", "path": str(index_file)}

# Root route via router (keeping this as backup)
@router.get("/")
async def serve_react_via_router():
    """Serve React app via router"""
    from pathlib import Path
    from fastapi.responses import FileResponse
    print("🎯 Serving React app via ROUTER for ROOT path '/'")
    
    frontend_dist = Path("frontend/dist")
    index_file = frontend_dist / "index.html"
    print(f"📄 Index file exists: {index_file.exists()}")
    print(f"📁 Full path: {index_file.absolute()}")
    
    if index_file.exists():
        print("✅ Returning FileResponse for index.html via router")
        return FileResponse(index_file)
    else:
        print(f"❌ Index file not found: {index_file}")
        return {"error": "Frontend not found", "path": str(index_file)}

# Request size validation middleware
async def validate_file_size(file: UploadFile = File(...)):
    """Validate uploaded file size and type"""
    if file.size and file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    if not file.filename or not file.filename.lower().endswith('.pdf'):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )
    
    return file

# Directory constants
UPLOAD_DIR = "uploads"
PREVIEW_DIR = "previews"
SAMPLES_DIR = "samples"
PROCESSING_DIR = os.path.join(UPLOAD_DIR, "processing") # New directory for two-step process

# Ensure directories exist
for directory in [UPLOAD_DIR, PREVIEW_DIR, SAMPLES_DIR, PROCESSING_DIR]:
    os.makedirs(directory, exist_ok=True)

# Authentication middleware and dependencies
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency to verify JWT token and get current user"""
    token = credentials.credentials
    user_info = auth_service.verify_jwt_token(token)
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_info

def check_rate_limit_dependency(endpoint_type: str):
    """Factory function to create rate limit dependency for specific endpoint type"""
    async def rate_limit_check(user_info: Dict = Depends(get_current_user)):
        google_user_id = user_info["google_user_id"]
        is_allowed, current_count, limit = auth_service.check_rate_limit(google_user_id, endpoint_type)
        
        if not is_allowed:
            raise HTTPException(
                status_code=429, 
                detail=f"Rate limit exceeded for {endpoint_type}. Used {current_count}/{limit} today."
            )
        
        return user_info
    return rate_limit_check

# Authentication routes
@router.post("/api/auth/google")
async def google_auth(auth_request: GoogleAuthRequest):
    """Authenticate with Google OAuth token"""
    try:
        # Verify Google token
        user_info = await auth_service.verify_google_token(auth_request.token)
        if not user_info:
            raise HTTPException(status_code=401, detail="Invalid Google token")
        
        # Create JWT token
        jwt_token = auth_service.create_jwt_token(user_info)
        
        # Get user usage stats
        usage_stats = auth_service.get_user_usage(user_info["google_user_id"])
        
        return {
            "success": True,
            "token": jwt_token,
            "user": {
                "google_user_id": user_info["google_user_id"],
                "email": user_info["email"],
                "name": user_info["name"],
                "picture": user_info["picture"]
            },
            "usage": usage_stats
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@router.get("/api/auth/me")
async def get_current_user_info(user_info: Dict = Depends(get_current_user)):
    """Get current user info and usage stats"""
    usage_stats = auth_service.get_user_usage(user_info["google_user_id"])
    
    return {
        "user": {
            "google_user_id": user_info["google_user_id"],
            "email": user_info["email"],
            "name": user_info["name"]
        },
        "usage": usage_stats
    }

# Public routes (no auth required)
@router.get("/api/companies")
async def get_companies():
    """Get all companies - API endpoint (backward compatible)"""
    companies = config_manager.list_company_templates()
    return {"companies": companies}

@router.get("/api/setup/companies")
async def get_setup_companies():
    """Get company IDs for setup page"""
    companies = config_manager.list_companies()
    return {"companies": companies}

@router.post("/api/setup/upload-sample")
async def upload_sample(file: UploadFile = Depends(validate_file_size), company_id: str = Form(...)):
    """Upload sample payslip for company setup"""
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")
    
    # Save uploaded file
    sample_path = os.path.join(SAMPLES_DIR, f"{company_id}_sample.pdf")
    with open(sample_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Convert first page to image for preview
    try:
        images = convert_from_path(sample_path, dpi=300, first_page=1, last_page=1)
        preview_image = images[0]
        preview_path = os.path.join(PREVIEW_DIR, f"{company_id}_preview.png")
        preview_image.save(preview_path)
        
        return JSONResponse({
            "success": True,
            "message": "Sample uploaded successfully",
            "preview_url": f"/api/preview/{company_id}_preview.png",
            "company_id": company_id
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@router.get("/api/preview/{filename}")
async def get_preview(filename: str):
    """Serve preview images"""
    file_path = os.path.join(PREVIEW_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Preview not found")

@router.post("/api/setup/save-crop-area")
async def save_crop_area(request: Request):
    """Save crop area for company template"""
    data = await request.json()
    
    company_id = data.get("company_id")
    company_name = data.get("company_name")
    crop_area = data.get("crop_area")
    
    if not all([company_id, company_name, crop_area]):
        raise HTTPException(status_code=400, detail="Missing required data")
    
    # Create crop area object
    crop = CropArea(
        x=int(crop_area["x"]),
        y=int(crop_area["y"]),
        width=int(crop_area["width"]),
        height=int(crop_area["height"])
    )
    
    # Create template with empty employee list
    template = CompanyTemplate(
        company_id=company_id,
        company_name=company_name,
        name_crop_area=crop,
        employee_emails={},
        created_at=datetime.now().isoformat()
    )
    
    if config_manager.save_template(template):
        return JSONResponse({"success": True, "message": "Crop area saved successfully"})
    else:
        raise HTTPException(status_code=500, detail="Failed to save crop area")

@router.post("/api/setup/upload-employees")
async def upload_employees(request: Request, file: UploadFile = File(...), company_id: str = Form(...)):
    """Upload employee list CSV"""
    
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Please upload a CSV file")
    
    try:
        # Read CSV content
        content = await file.read()
        csv_content = content.decode('utf-8')
        
        # Parse employee data
        employee_emails = {}
        lines = csv_content.strip().split('\n')
        
        for line_num, line in enumerate(lines[1:], 2):  # Skip header
            if line.strip():
                parts = line.split(',')
                if len(parts) >= 2:
                    name = parts[0].strip()
                    email = parts[1].strip()
                    if name and email:
                        employee_emails[name] = email
        
        # Update existing template
        template = config_manager.load_template()
        if not template:
            raise HTTPException(status_code=404, detail="Company template not found")
        
        template.employee_emails = employee_emails
        
        if config_manager.save_template(template):
            return JSONResponse({
                "success": True,
                "message": f"Uploaded {len(employee_emails)} employees successfully"
            })
        else:
            raise HTTPException(status_code=500, detail="Failed to save employee list")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")

@router.post("/api/setup/test-template")
async def test_template(request: Request, company_id: str = Form(...)):
    """Test the template with sample PDF"""
    
    template = config_manager.load_template()
    if not template:
        raise HTTPException(status_code=404, detail="Company template not found")
    
    sample_path = os.path.join(SAMPLES_DIR, f"{company_id}_sample.pdf")
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample PDF not found")
    
    try:
        # Process with AI vision
        results = await ai_vision.process_payslip_pdf(sample_path, template)
        
        return JSONResponse({
            "success": True,
            "message": "Template test completed",
            "results": results
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error testing template: {str(e)}")

@router.get("/api/companies/{company_id}")
async def get_company(company_id: str):
    """Get company by ID - API endpoint (backward compatible)"""
    template = config_manager.load_template()
    if not template:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return {"company": template}

@router.post("/api/process/{company_id}/preview")
async def process_payslip_preview(
    company_id: str, 
    file: UploadFile = Depends(validate_file_size),
    user_info: Dict = Depends(check_rate_limit_dependency("ai_calls"))
):
    """Step 1: Analyzes the payslip PDF and returns a preview of matches."""
    template = config_manager.load_template()
    if not template:
        raise HTTPException(status_code=404, detail="Company not found")

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Please upload a PDF file")

    process_id = str(uuid.uuid4())
    pdf_path = os.path.join(PROCESSING_DIR, f"{process_id}.pdf")
    results_path = os.path.join(PROCESSING_DIR, f"{process_id}.json")

    try:
        # Save the uploaded PDF
        with open(pdf_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Process with AI vision to get results for preview
        results = await ai_vision.process_payslip_pdf(pdf_path, template)

        # Cache the results to a JSON file
        with open(results_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        # Increment AI usage counter after successful processing
        auth_service.increment_usage(user_info["google_user_id"], "ai_calls")

        return {
            "success": True,
            "process_id": process_id,
            "preview": results,
            "filename": file.filename,
            "company": template.company_name
        }
    except Exception as e:
        # Clean up files on error
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if os.path.exists(results_path):
            os.remove(results_path)
        raise HTTPException(status_code=500, detail=f"Error during preview processing: {str(e)}")


@router.post("/api/process/{company_id}/send")
async def process_payslip_send(
    company_id: str, 
    request: Request,
    user_info: Dict = Depends(check_rate_limit_dependency("email_sends"))
):
    """Step 2: Sends emails based on a completed preview process."""
    data = await request.json()
    process_id = data.get("process_id")

    if not process_id:
        raise HTTPException(status_code=400, detail="process_id is required")

    template = config_manager.load_template()
    if not template:
        raise HTTPException(status_code=404, detail="Company not found")

    pdf_path = os.path.join(PROCESSING_DIR, f"{process_id}.pdf")
    results_path = os.path.join(PROCESSING_DIR, f"{process_id}.json")

    if not os.path.exists(pdf_path) or not os.path.exists(results_path):
        raise HTTPException(status_code=404, detail="Process ID not found or expired.")

    try:
        # Load the cached results
        with open(results_path, "r", encoding="utf-8") as f:
            results = json.load(f)

        email_results = []
        # Use a temporary directory for extracted single-page PDFs
        with tempfile.TemporaryDirectory() as temp_dir:
            for result in results:
                if result.get("found_match"):
                    employee_name = result["employee_name"]
                    employee_email = result["employee_email"]
                    page_number = result["page"]

                    # Extract the specific page
                    page_filename = f"{company_id}_{employee_name}_page_{page_number}.pdf"
                    page_path = os.path.join(temp_dir, page_filename)
                    pdf_service.extract_page(pdf_path, page_number, page_path)

                    # Send the email
                    success, detail = await email_service.send_payslip_email(
                        to_email=employee_email,
                        employee_name=employee_name,
                        payslip_pdf_path=page_path,
                        payslip_filename=page_filename
                    )

                    email_results.append({
                        "employee_name": employee_name,
                        "employee_email": employee_email,
                        "page": page_number,
                        "email_sent": success,
                        "email_detail": str(detail) # Ensure detail is a string
                    })

        # Increment email usage counter after successful sending
        successful_emails = sum(1 for result in email_results if result.get("email_sent"))
        if successful_emails > 0:
            auth_service.increment_usage(user_info["google_user_id"], "email_sends")

        return {
            "success": True,
            "email_results": email_results,
            "company": template.company_name
        }
    finally:
        # Clean up the stored PDF and JSON files after processing
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if os.path.exists(results_path):
            os.remove(results_path)

@router.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"} 