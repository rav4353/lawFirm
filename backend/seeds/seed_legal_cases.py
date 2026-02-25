import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from models.database import engine, SessionLocal, Base
from models.legal_research import LegalCase, ResearchQuery, SavedCase
from models.user import User
from models.workflow import Workflow
from models.audit import AuditLog
import uuid

def seed_legal_cases():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if cases already exist
        if db.query(LegalCase).first():
            print("Legal cases already seeded.")
            return

        cases = [
            {
                "title": "Planet49 GmbH v Bundesverband",
                "court": "European Court of Justice (ECJ)",
                "jurisdiction": "European Union",
                "year": 2019,
                "regulation": "GDPR",
                "summary": "The court ruled that pre-ticked consent boxes do not constitute valid consent under GDPR. Consent must be active and freely given.",
                "full_text": "In Case C-673/17, the Court of Justice of the European Union ruled that Article 6(1)(a) of Regulation 2016/679 (GDPR) must be interpreted as meaning that consent is not validly constituted by way of a pre-ticked checkbox which the user must deselect to refuse his consent. This establishes the standard for opt-in consent mechanisms across the EU.",
                "key_ruling": "Pre-ticked checkboxes are invalid for GDPR consent; explicit action is required."
            },
            {
                "title": "Fashion ID GmbH & Co. KG v Verbraucherzentrale NRW e.V.",
                "court": "European Court of Justice (ECJ)",
                "jurisdiction": "European Union",
                "year": 2019,
                "regulation": "GDPR",
                "summary": "This case established that website operators using third-party social plugins (like the Facebook 'Like' button) are joint controllers regarding the collection and transmission of personal data.",
                "full_text": "The ECJ ruled that a website operator that embeds a social plugin can be considered a joint controller with the plugin provider. This means the operator must provide information to users at the time of collection and obtain consent if necessary under Article 6(1)(a).",
                "key_ruling": "Website operators are joint controllers for data collected via third-party plugins."
            },
            {
                "title": "DPB v Yahoo! Inc.",
                "court": "California Superior Court",
                "jurisdiction": "USA - California",
                "year": 2020,
                "regulation": "CCPA",
                "summary": "One of the early class actions citing CCPA violations following a massive data breach. It highlighted the importance of 'reasonable security procedures'.",
                "full_text": "The litigation focused on whether Yahoo! failed to maintain reasonable security procedures, leading to unauthorized access to user data. Under CCPA, consumers have a private right of action in cases of data breaches resulting from a business's failure to implement reasonable security.",
                "key_ruling": "Private right of action under CCPA is triggered by failure to maintain reasonable security."
            },
            {
                "title": "Schrems II (Data Protection Commissioner v Facebook Ireland Ltd)",
                "court": "European Court of Justice (ECJ)",
                "jurisdiction": "European Union",
                "year": 2020,
                "regulation": "GDPR",
                "summary": "Invalidated the EU-US Privacy Shield due to concerns about US surveillance programs and insufficient protection for EU data subjects.",
                "full_text": "The court found that US law (Section 702 FISA and EO 12333) does not provide data protection equivalent to GDPR. Standard Contractual Clauses (SCCs) remain valid but require additional safeguards if the destination country lacks adequate protections.",
                "key_ruling": "EU-US Privacy Shield invalidated; SCCs require 'supplementary measures'."
            },
            {
                "title": "Google Spain SL, Google Inc. v Agencia Española de Protección de Datos",
                "court": "European Court of Justice (ECJ)",
                "jurisdiction": "European Union",
                "year": 2014,
                "regulation": "GDPR",
                "summary": "This seminal case established the 'Right to be Forgotten'. Individual data subjects have the right to request search engines to delist links to personal information that is inadequate, irrelevant, or no longer relevant.",
                "full_text": "In Case C-131/12, the ECJ ruled that search engine operators are responsible for the processing of personal data which appears on web pages published by third parties. The ruling granted individuals the right to request that search engines remove links to personal info under certain conditions, even if the publication on the original site is lawful.",
                "key_ruling": "Established the 'Right to be Forgotten' in the EU legal framework."
            }
        ]

        for case_data in cases:
            db_case = LegalCase(**case_data)
            db.add(db_case)
        
        db.commit()
        print(f"Successfully seeded {len(cases)} legal cases.")
    finally:
        db.close()

if __name__ == "__main__":
    seed_legal_cases()
