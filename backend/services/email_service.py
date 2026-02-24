from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from config import settings
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        self.from_email = settings.SENDGRID_FROM_EMAIL
        self.from_name = settings.SENDGRID_FROM_NAME

    def send_otp_email(self, to_email: str, otp_code: str, purpose: str):
        subject = "Your Veritas AI Verification Code"
        if purpose == "password_reset":
            subject = "Veritas AI - Password Reset Request"
        
        content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #646cff; text-align: center;">Veritas AI</h2>
            <p>Hello,</p>
            <p>You requested a verification code for <strong>{purpose.replace('_', ' ')}</strong>.</p>
            <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                {otp_code}
            </div>
            <p>This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #888; text-align: center;">&copy; 2026 Veritas AI. All rights reserved.</p>
        </div>
        """
        
        message = Mail(
            from_email=(self.from_email, self.from_name),
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        
        try:
            response = self.sg.send(message)
            return response.status_code == 202
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

email_service = EmailService()
