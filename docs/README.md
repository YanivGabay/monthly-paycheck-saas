# Monthly Paycheck SaaS - Hebrew Name Extraction

A FastAPI application that extracts Hebrew names from PDF payslips using OCR and fuzzy matching.

## 🚀 Quick Start

### Option 1: Docker Testing (Recommended)

**For Linux/macOS:**
```bash
chmod +x test.sh
./test.sh
```

**For Windows:**
```cmd
test.bat
```

This will:
1. Validate your Docker environment
2. Start the web application on `http://localhost:8000`

Note: You'll need to provide your own PDF file for testing.

### Option 2: Manual Docker Setup

1. **Test the setup:**
   ```bash
   docker-compose -f docker-compose.test.yml run --rm test
   ```

2. **Run the application:**
   ```bash
   docker-compose -f docker-compose.test.yml --profile app up --build
   ```

### Option 3: Local Development

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install system dependencies (Ubuntu/Debian):**
   ```bash
   sudo apt-get update
   sudo apt-get install tesseract-ocr tesseract-ocr-heb poppler-utils
   ```

3. **Run the application:**
   ```bash
   python main.py
   ```

## 🧪 Testing Hebrew Name Extraction

### Test with Sample Text
1. Go to `http://localhost:8000/test-names`
2. See how the system identifies Hebrew names from sample text

### Test with Your PDF
1. Go to `http://localhost:8000`
2. Upload your Hebrew payslip PDF
3. See the extracted names with confidence scores

### Direct Testing (Command Line)
```bash
# Place your PDF as "example_payslip.pdf" in the project root
python pdf_processor.py
```

## 📋 Features

- **PDF Text Extraction**: Direct text extraction from PDFs
- **Hebrew OCR**: Fallback OCR using Tesseract with Hebrew language support
- **Name Recognition**: Fuzzy matching against common Hebrew names
- **Confidence Scoring**: Each extracted name comes with a confidence percentage
- **Web Interface**: Clean, RTL-friendly web interface with htmx
- **Real-time Processing**: Upload and see results immediately

## 🔧 Customization

### Adding More Hebrew Names
Edit the `hebrew_names` list in `pdf_processor.py`:

```python
self.hebrew_names = [
    "יוסף", "משה", "אברהם",  # Add your names here
    # ... existing names
]
```

### Adjusting Confidence Threshold
Change the similarity threshold in `extract_names_from_text()`:

```python
if similarity >= 90:  # Lower this number for more matches
```

## 📁 Project Structure

```
monthly-paycheck-saas/
├── main.py                 # FastAPI application
├── pdf_processor.py        # Core PDF processing and name extraction
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker container configuration
├── docker-compose.yml     # Multi-container orchestration
├── templates/             # HTML templates
│   ├── base.html          # Base template with Tailwind + htmx
│   ├── index.html         # Upload page
│   ├── results.html       # Results display
│   ├── error.html         # Error handling
│   └── test_names.html    # Testing page
└── uploads/               # Temporary file storage
```

## 🌐 API Endpoints

- `GET /` - Main upload page
- `POST /upload` - Process PDF upload
- `GET /test-names` - Test name extraction with sample text
- `GET /health` - Health check endpoint

## 🐛 Troubleshooting

### OCR Not Working
- Ensure Tesseract is installed with Hebrew language pack
- Check that `tesseract-ocr-heb` is installed

### No Names Detected
- Verify the PDF contains readable Hebrew text
- Try lowering the confidence threshold
- Add specific names to the `hebrew_names` list

### Docker Issues
```bash
# Rebuild without cache
docker-compose build --no-cache

# Check logs
docker-compose logs -f app
```

## 🚧 Next Steps (Future Phases)

1. **Authentication**: User accounts and login
2. **Email Integration**: Mailgun integration for sending payslips
3. **Database**: SQLite/Postgres for storing results
4. **Background Jobs**: RQ worker for large PDF processing
5. **Multi-tenant**: Support multiple organizations

## 📝 Notes

- The application runs on port 8000 by default
- Uploaded files are processed immediately and then deleted
- The interface is designed for Hebrew (RTL) text
- OCR requires clear, readable text for best results 