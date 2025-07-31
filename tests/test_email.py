import os
import pytest
import asyncio
from fpdf import FPDF
from dotenv import load_dotenv

# Add project root to path to allow absolute imports
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.email_service import EmailService

# Load environment variables from .env file
load_dotenv()

# --- Test Configuration ---
# IMPORTANT: Replace with a real email address you can check
TEST_RECIPIENT_EMAIL = os.getenv("TEST_RECIPIENT_EMAIL", "test@example.com") 
# --------------------------

@pytest.fixture(scope="module")
def event_loop():
    """Create an instance of the default event loop for our test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="module")
def dummy_pdf_path():
    """Create a dummy PDF for testing and return its path."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="This is a test payslip.", ln=1, align="C")
    
    dummy_path = "test_payslip.pdf"
    pdf.output(dummy_path)
    
    yield dummy_path
    
    # Teardown: remove the dummy file
    os.remove(dummy_path)

@pytest.mark.asyncio
async def test_send_payslip_email_integration(dummy_pdf_path):
    """
    Integration test for sending a payslip email using Mailgun.
    
    This test requires valid Mailgun credentials in the .env file.
    It will send a REAL email to the configured TEST_RECIPIENT_EMAIL.
    """
    # 1. Check for credentials with detailed feedback
    required_vars = {
        "MAILGUN_API_KEY": os.getenv("MAILGUN_API_KEY"),
        "MAILGUN_DOMAIN": os.getenv("MAILGUN_DOMAIN"),
        "MAILGUN_FROM_NAME": os.getenv("MAILGUN_FROM_NAME"),
        "MAILGUN_FROM_EMAIL": os.getenv("MAILGUN_FROM_EMAIL"),
        "TEST_RECIPIENT_EMAIL": os.getenv("TEST_RECIPIENT_EMAIL"),
    }

    missing_vars = [key for key, value in required_vars.items() if not value]

    if missing_vars:
        print(f"\n[SKIP] Missing required environment variables for Mailgun test: {', '.join(missing_vars)}\n")
        pytest.skip("Missing Mailgun configuration")

    # 2. Check that the test recipient is not the default placeholder
    if required_vars["TEST_RECIPIENT_EMAIL"] == "test@example.com":
        print("\n[SKIP] TEST_RECIPIENT_EMAIL is still the default placeholder (test@example.com). Configure it in your .env file.\n")
        pytest.skip("Placeholder recipient")

    # 3. Initialize the email service
    try:
        email_service = EmailService()
    except ValueError as e:
        pytest.fail(f"Failed to initialize EmailService: {e}")

    # 4. Define email parameters
    employee_name = "Test Employee"
    payslip_filename = "payslip_test.pdf"

    # 5. Send the email
    success, detail = await email_service.send_payslip_email(
        to_email=TEST_RECIPIENT_EMAIL,
        employee_name=employee_name,
        payslip_pdf_path=dummy_pdf_path,
        payslip_filename=payslip_filename,
    )

    # 6. Assert the result
    assert success is True, f"Email sending failed. Details: {detail}"
    print(f"✅ Email sent successfully to {TEST_RECIPIENT_EMAIL}. Please check the inbox.")
    print(f"   Mailgun response: {detail}") 