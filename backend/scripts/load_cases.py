import csv
import logging
import sys
import os

# Add the parent directory to sys.path so we can import from backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.database import SessionLocal
from models.legal_research import LegalCase

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def load_cases(csv_path: str):
    db = SessionLocal()
    count = 0
    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # Basic mapping from standard enforcementtracker.com CSV
                # or our mock CSV
                
                # Check for existing case to avoid duplicates if ID exists
                case_id = row.get("id", f"case-{count}")
                
                # Default values if columns are missing
                company = row.get("company", "Unknown Company")
                country = row.get("country", "Unknown")
                authority = row.get("authority", "Unknown Authority")
                fine_amount = row.get("fine_amount", "Unknown Fine")
                reason = row.get("reason", "No reason provided")
                date_str = row.get("date", "2020")
                
                year = 2020
                if date_str:
                    try:
                        # try to extract year from YYYY-MM-DD or similar
                        year = int(date_str[:4])
                    except ValueError:
                        pass
                
                # Construct LegalCase
                new_case = LegalCase(
                    id=case_id,
                    title=f"{company} GDPR Violation",
                    court=authority,
                    jurisdiction=country,
                    year=year,
                    regulation="GDPR",
                    summary=f"Fined {fine_amount} by {authority} for {reason}",
                    full_text=f"Full Details: Company {company} located in {country} was fined {fine_amount} on {date_str} due to: {reason}",
                    key_ruling=f"Fine: {fine_amount}"
                )
                
                # Check if exists
                existing = db.query(LegalCase).filter(LegalCase.id == case_id).first()
                if not existing:
                    db.add(new_case)
                    count += 1
                
            db.commit()
            logger.info(f"Successfully loaded {count} new GDPR cases into the database.")
            
    except Exception as e:
        logger.error(f"Error loading cases: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    csv_file = os.path.join(os.path.dirname(__file__), "..", "data", "gdpr_cases.csv")
    if os.path.exists(csv_file):
        load_cases(csv_file)
    else:
        logger.error(f"File not found: {csv_file}")
