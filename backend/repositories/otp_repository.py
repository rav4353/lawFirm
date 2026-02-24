from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import random
from models.otp import OTP

def generate_otp(db: Session, email: str, purpose: str) -> str:
    """Generate a 6-digit OTP, store it, and return it."""
    # Delete any existing OTP for this email/purpose
    db.query(OTP).filter(OTP.email == email, OTP.purpose == purpose).delete()
    
    otp_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    db_otp = OTP(
        email=email,
        otp_code=otp_code,
        purpose=purpose,
        expires_at=expires_at
    )
    db.add(db_otp)
    db.commit()
    return otp_code

def verify_otp(db: Session, email: str, otp_code: str, purpose: str) -> bool:
    """Verify the OTP code for the given email and purpose."""
    db_otp = db.query(OTP).filter(
        OTP.email == email,
        OTP.otp_code == otp_code,
        OTP.purpose == purpose,
        OTP.is_verified == False
    ).first()
    
    if not db_otp or db_otp.is_expired():
        return False
    
    db_otp.is_verified = True
    db.commit()
    return True
