#!/usr/bin/env python3
"""
Quick setup validation script for Monthly Paycheck SaaS
"""

import sys
import os
from pathlib import Path

def test_imports():
    """Test that all required packages can be imported"""
    print("🔍 Testing imports...")
    
    try:
        import fastapi
        print("   ✅ FastAPI")
        import PyPDF2 as pypdf # Use the correct import name
        print("   ✅ pypdf")
        import pytesseract
        print("   ✅ pytesseract")
        import rapidfuzz
        print("   ✅ rapidfuzz")
    except ImportError as e:
        assert False, f"Failed to import required package: {e}"

def test_tesseract():
    """Test Tesseract OCR installation"""
    print("\n🔍 Testing Tesseract OCR...")
    
    try:
        import pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"   ✅ Tesseract version: {version}")
        assert version is not None

        # Test Hebrew language support
        langs = pytesseract.get_languages()
        assert 'heb' in langs, "Hebrew language pack not found for Tesseract."
        print("   ✅ Hebrew language support found")

    except Exception as e:
        assert False, f"Tesseract OCR check failed: {e}. Ensure it is installed and in the system's PATH."

def test_directories():
    """Test that required directories exist"""
    print("\n🔍 Testing directory structure...")
    
    dirs = ['app', 'company_configs', 'config', 'frontend', 'tests']
    
    for directory in dirs:
        assert Path(directory).exists(), f"Required directory not found: {directory}/"
        print(f"   ✅ {directory}/")

    # Ensure runtime directories can be created
    try:
        Path('uploads').mkdir(exist_ok=True)
        print("   ✅ uploads/ (checked/created)")
        Path('previews').mkdir(exist_ok=True)
        print("   ✅ previews/ (checked/created)")
        Path('debug').mkdir(exist_ok=True)
        print("   ✅ debug/ (checked/created)")
    except Exception as e:
        assert False, f"Failed to create runtime directory: {e}"


def test_required_files():
    """Test that critical files exist"""
    print("\n🔍 Testing required files...")
    
    files = [
        'app/main.py',
        'app/routes.py',
        'app/config.py',
        'app/services/ai_vision.py',
        'app/services/email_service.py',
        'app/services/pdf_service.py',
        'requirements.txt',
        'frontend/package.json',
        'config/docker-compose.yml',
    ]
    
    for file_path in files:
        assert Path(file_path).exists(), f"Required file not found: {file_path}"
        print(f"   ✅ {file_path}")

def test_template_system_and_config():
    """Test basic template system and config manager initialization"""
    print("\n🔍 Testing config manager...")
    
    try:
        # This indirectly tests the imports within the modules
        from app.config import config_manager
        
        # Test configuration system
        companies = config_manager.list_companies()
        
        print(f"   ✅ Config manager loaded successfully")
        print(f"   📊 Found {len(companies)} company configurations")
        
        if companies:
            print(f"   🏢 Companies: {', '.join(companies)}")

        assert isinstance(companies, list)
            
    except Exception as e:
        assert False, f"Error initializing or using the config manager: {e}" 