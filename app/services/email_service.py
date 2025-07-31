import os
import httpx
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmailService:
    """Service to send emails using Mailgun API"""

    def __init__(self):
        self.api_key = os.getenv("MAILGUN_API_KEY")
        self.domain = os.getenv("MAILGUN_DOMAIN")
        self.from_name = os.getenv("MAILGUN_FROM_NAME")
        self.from_email = os.getenv("MAILGUN_FROM_EMAIL")
        
        if not all([self.api_key, self.domain, self.from_name, self.from_email]):
            raise ValueError("Mailgun environment variables not set")
            
        self.base_url = f"https://api.mailgun.net/v3/{self.domain}/messages"

    async def send_payslip_email(
        self,
        to_email: str,
        employee_name: str,
        payslip_pdf_path: str,
        payslip_filename: str
    ):
        """
        Send a single payslip page to an employee.
        """
        subject = f"Your Payslip is Ready - {employee_name}"
        
        html_body = f"""
        <html>
            <body>
                <p>Hi {employee_name},</p>
                <p>Please find your attached payslip.</p>
                <p>Best regards,<br>{self.from_name}</p>
            </body>
        </html>
        """
        
        try:
            with open(payslip_pdf_path, "rb") as pdf_file:
                files = {"attachment": (payslip_filename, pdf_file.read(), "application/pdf")}
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.base_url,
                        auth=("api", self.api_key),
                        data={
                            "from": f"{self.from_name} <{self.from_email}>",
                            "to": to_email,
                            "subject": subject,
                            "html": html_body,
                        },
                        files=files,
                    )
            
            response.raise_for_status()  # Raise exception for 4xx or 5xx status codes
            return True, response.json()
            
        except httpx.HTTPStatusError as e:
            # More detailed error logging
            print(f"Error sending email to {to_email}: {e.response.text}")
            return False, {"error": str(e), "details": e.response.text}
        except Exception as e:
            print(f"An unexpected error occurred: {str(e)}")
            return False, {"error": str(e)} 