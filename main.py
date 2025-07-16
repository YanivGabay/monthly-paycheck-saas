import os
import tempfile
import uuid
from pathlib import Path
from typing import List
import shutil

from fastapi import FastAPI, File, UploadFile, Request, HTTPException, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from dotenv import load_dotenv

from pdf_processor import HebrewNameExtractor

# Load environment variables
load_dotenv()

app = FastAPI(title="Monthly Paycheck SaaS", version="1.0.0")

# Setup static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize the Hebrew name extractor
extractor = HebrewNameExtractor()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Main page with upload form"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/upload")
async def upload_pdf(request: Request, file: UploadFile = File(...)):
    """Handle PDF upload and process it"""
    
    # Validate file type
    if not file.filename.lower().endswith('.pdf'):
        return templates.TemplateResponse("error.html", {
            "request": request,
            "error": "Please upload a PDF file only"
        })
    
    try:
        # Generate unique filename
        file_id = str(uuid.uuid4())
        file_extension = Path(file.filename).suffix
        unique_filename = f"{file_id}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Process the PDF
        results = extractor.process_payslip_pdf(file_path)
        
        # Clean up uploaded file
        os.remove(file_path)
        
        # Return results via htmx
        return templates.TemplateResponse("results.html", {
            "request": request,
            "filename": file.filename,
            "results": results,
            "total_pages": len(results)
        })
        
    except Exception as e:
        return templates.TemplateResponse("error.html", {
            "request": request,
            "error": f"Error processing PDF: {str(e)}"
        })

@app.get("/test-names")
async def test_names(request: Request):
    """Test page to check name extraction with sample text"""
    
    # Test multiple scenarios
    test_cases = [
        {
            "name": "Full Names (like real payslips)",
            "text": "שם עובד: יוסף כהן\nמספר עובד: 12345\nשם עובד: מרים לוי\nת.ז: 987654321",
            "expected": ["יוסף", "כהן", "מרים", "לוי"]
        },
        {
            "name": "Single Employee Full Name",
            "text": "תלוש שכר\nשם עובד: דוד שלמה\nמחלקה: פיתוח",
            "expected": ["דוד", "שלמה"]
        },
        {
            "name": "Names in Context",
            "text": "חברה: מפעלי הטכנולוגיה\nעובד: יוסף כהן\nשכר: 15000\nמנהל: מרים לוי",
            "expected": ["יוסף", "כהן", "מרים", "לוי"]
        },
        {
            "name": "OCR-like Corrupted Text (for debugging)",
            "text": "ףסוי :דבוע םש\nןהכ\nםירמ יול",
            "expected": "May not work - simulating OCR corruption"
        }
    ]
    
    results = []
    for test_case in test_cases:
        names = extractor.extract_names_from_text(test_case["text"])
        results.append({
            "name": test_case["name"],
            "text": test_case["text"],
            "expected": test_case["expected"],
            "found": names
        })
    
    return templates.TemplateResponse("test_names.html", {
        "request": request,
        "test_results": results
    })

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "PDF processor is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) 