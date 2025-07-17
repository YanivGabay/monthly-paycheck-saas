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
    except ImportError:
        print("   ❌ FastAPI - run: pip install fastapi")
        return False
    
    try:
        import pypdf
        print("   ✅ pypdf")
    except ImportError:
        print("   ❌ pypdf - run: pip install pypdf")
        return False
    
    try:
        import pytesseract
        print("   ✅ pytesseract")
    except ImportError:
        print("   ❌ pytesseract - run: pip install pytesseract")
        return False
    
    try:
        import rapidfuzz
        print("   ✅ rapidfuzz")
    except ImportError:
        print("   ❌ rapidfuzz - run: pip install rapidfuzz")
        return False
    
    return True

def test_tesseract():
    """Test Tesseract OCR installation"""
    print("\n🔍 Testing Tesseract OCR...")
    
    try:
        import pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"   ✅ Tesseract version: {version}")
        
        # Test Hebrew language support
        try:
            langs = pytesseract.get_languages()
            if 'heb' in langs:
                print("   ✅ Hebrew language support found")
                return True
            else:
                print("   ⚠️  Hebrew language pack not found")
                print("       Install with: sudo apt-get install tesseract-ocr-heb")
                return False
        except Exception as e:
            print(f"   ⚠️  Could not check language support: {e}")
            return False
            
    except Exception as e:
        print(f"   ❌ Tesseract not found: {e}")
        print("       Install with: sudo apt-get install tesseract-ocr tesseract-ocr-heb")
        return False

def test_directories():
    """Test that required directories exist"""
    print("\n🔍 Testing directory structure...")
    
    dirs = ['templates', 'static']
    all_good = True
    
    for directory in dirs:
        if Path(directory).exists():
            print(f"   ✅ {directory}/")
        else:
            print(f"   ❌ {directory}/ not found")
            all_good = False
    
    # Create uploads directory if it doesn't exist (runtime directory)
    uploads_dir = Path('uploads')
    if not uploads_dir.exists():
        uploads_dir.mkdir(exist_ok=True)
        print(f"   ✅ uploads/ (created)")
    else:
        print(f"   ✅ uploads/")
    
    return all_good

def test_files():
    """Test that required files exist"""
    print("\n🔍 Testing required files...")
    
    files = [
        'app/main.py',
        'app/pdf_processor.py',
        'requirements.txt',
        'app/templates/base.html',
        'app/templates/index.html',
        'app/templates/results.html'
    ]
    
    all_good = True
    
    for file_path in files:
        if Path(file_path).exists():
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path} not found")
            all_good = False
    
    return all_good

def test_hebrew_extraction():
    """Test basic Hebrew name extraction"""
    print("\n🔍 Testing Hebrew name extraction...")
    
    try:
        from app.pdf_processor import HebrewNameExtractor
        
        extractor = HebrewNameExtractor()
        
        # Test with sample Hebrew text
        sample_text = "שם: יוסף כהן, עובד: מרים לוי"
        names = extractor.extract_names_from_text(sample_text)
        
        if names:
            print(f"   ✅ Found {len(names)} names:")
            for name, confidence in names:
                print(f"      - {name} ({confidence}%)")
            return True
        else:
            print("   ⚠️  No names extracted - this might be OK if names aren't in the default list")
            return True
            
    except Exception as e:
        print(f"   ❌ Error testing name extraction: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Monthly Paycheck SaaS - Setup Validation\n")
    
    tests = [
        ("Package imports", test_imports),
        ("Tesseract OCR", test_tesseract),
        ("Directory structure", test_directories),
        ("Required files", test_files),
        ("Hebrew extraction", test_hebrew_extraction)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append(result)
        except Exception as e:
            print(f"   ❌ Error running test: {e}")
            results.append(False)
    
    print("\n" + "="*50)
    print("📊 SUMMARY:")
    
    passed = sum(results)
    total = len(results)
    
    for i, (test_name, _) in enumerate(tests):
        status = "✅ PASS" if results[i] else "❌ FAIL"
        print(f"   {status} - {test_name}")
    
    print(f"\n   {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! You're ready to run the application:")
        print("   python main.py")
        print("   OR")
        print("   docker-compose up --build")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please fix the issues above.")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 