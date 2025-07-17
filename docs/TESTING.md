# Testing Guide - Monthly Paycheck SaaS

This guide will help you test the Hebrew name extraction system using Docker.

## 🧪 Quick Test Setup

### Step 1: Validate Environment
```bash
# Test that everything is properly configured
docker-compose -f docker-compose.test.yml run --rm test
```

This will check:
- ✅ All Python packages are installed
- ✅ Tesseract OCR with Hebrew support is working  
- ✅ Directory structure is correct
- ✅ Hebrew name extraction works
- ✅ All template files exist

### Step 2: Run the Web Application
```bash
# Start the web application
docker-compose -f docker-compose.test.yml --profile app up --build
```

Then open your browser to: `http://localhost:8000`

**Note**: You'll need to provide your own Hebrew PDF file for testing.

## 🎯 Testing Scenarios

### Scenario 1: Basic Name Extraction Test
1. Go to `http://localhost:8000/test-names`
2. You should see Hebrew names extracted from sample text
3. Verify that "יוסף" and "מרים" are detected with confidence scores

### Scenario 2: PDF Upload Test
1. Go to `http://localhost:8000`
2. Upload your own Hebrew PDF with payslip information
3. Wait for processing (should take 5-15 seconds)
4. Verify results show:
   - Pages processed
   - Hebrew names detected on each page
   - Confidence scores above 90%

### Scenario 3: Real Payslip Test
1. Use your actual Hebrew payslip PDF
2. Upload via the web interface
3. Check that employee names are correctly identified
4. Review the Hebrew text extraction quality

## 🔍 Expected Results

### Text Extraction Test
Sample text: "שם: יוסף כהן, עובד: מרים לוי"
Expected: 2 names detected (יוסף, מרים)

### PDF Upload Results
When you upload a Hebrew PDF, the system should:
- Extract text from each page
- Identify Hebrew names with confidence scores
- Display results in a clean, RTL-friendly interface

## 🐛 Troubleshooting

### No Hebrew Names Detected
1. **Check PDF quality**: Ensure text is clear and readable
2. **Verify language**: Make sure Tesseract Hebrew support is installed
3. **Add custom names**: Edit `pdf_processor.py` to include specific names
4. **Lower threshold**: Reduce confidence threshold from 90% to 80%

### OCR Not Working
```bash
# Check Tesseract installation in container
docker-compose -f docker-compose.test.yml run --rm test tesseract --list-langs
# Should show 'heb' in the list
```

### Application Won't Start
```bash
# Check logs
docker-compose -f docker-compose.test.yml --profile app logs -f

# Rebuild without cache
docker-compose -f docker-compose.test.yml build --no-cache
```

## 📊 Performance Expectations

- **Small PDF (1-3 pages)**: 5-15 seconds
- **Medium PDF (5-10 pages)**: 15-45 seconds  
- **Large PDF (20+ pages)**: 1-3 minutes

Processing time depends on:
- PDF complexity and image quality
- Whether OCR is needed (text-based PDFs are faster)
- Number of Hebrew characters to process

## 🔧 Customization for Testing

### Add Your Names
Edit `pdf_processor.py`:
```python
self.hebrew_names = [
    "יוסף", "משה", "אברהם",  # Existing names
    "שם_שלך",  # Add your specific names here
    # ... rest of names
]
```

### Adjust Confidence Threshold
In `pdf_processor.py`, change:
```python
if similarity >= 90:  # Lower this for more matches
```

### Test Different Text
Modify the sample text in `main.py` at the `/test-names` endpoint.

## 📝 Test Checklist

- [ ] Environment validation passes
- [ ] Web interface loads correctly (Hebrew RTL layout)
- [ ] Name extraction test page works
- [ ] PDF upload and processing completes
- [ ] Results display with confidence scores
- [ ] Hebrew text is properly displayed (right-to-left)
- [ ] Error handling works (try uploading non-PDF file)

## 🚀 Ready for Production?

If all tests pass, you're ready to:
1. Add authentication (Phase 2)
2. Integrate Mailgun for email sending
3. Add database for storing results
4. Deploy to production VPS

## 📞 Next Steps

After successful testing:
1. **Collect real payslip samples** to improve name recognition
2. **Tune confidence thresholds** based on your specific documents  
3. **Add company-specific names** to the recognition list
4. **Plan email template system** for automatic sending 