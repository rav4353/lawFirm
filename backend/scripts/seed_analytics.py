import os
import sys
import random
from datetime import datetime, timedelta, timezone
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import SessionLocal, engine, Base
from models.client import Client
from models.billing import Billing
from models.document import Document
from models.analysis import AnalysisResult
from models.user import User
from models.prompt import PromptVersion
from models.legal_research import LegalCase
from models.lawfirm_case import LawfirmCase
from models.lawfirm_task import LawfirmTask
from models.timesheet import Timesheet

# Re-create all tables just to be sure
Base.metadata.create_all(bind=engine)

def seed_analytics():
    db = SessionLocal()
    hashed_pw = "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW" # pre-computed for 'password'
    
    try:
        print("Ensuring team members exist...")
        team_data = [
            {"email": "admin@veritas.ai", "name": "Admin User", "role": "it_admin", "dept": "IT", "expected": 160},
            {"email": "sarah.kim@lawfirm.com", "name": "Sarah Kim", "role": "partner", "dept": "Corporate", "expected": 160},
            {"email": "john.miller@lawfirm.com", "name": "John Miller", "role": "associate", "dept": "Litigation", "expected": 180},
            {"email": "emily.chen@lawfirm.com", "name": "Emily Chen", "role": "paralegal", "dept": "Corporate", "expected": 160},
            {"email": "michael.davis@lawfirm.com", "name": "Michael Davis", "role": "associate", "dept": "Real Estate", "expected": 160},
            {"email": "jessica.rodriguez@lawfirm.com", "name": "Jessica Rodriguez", "role": "partner", "dept": "Litigation", "expected": 150}
        ]
        
        team_users = []
        for d in team_data:
            user = db.query(User).filter(User.email == d["email"]).first()
            if not user:
                user = User(
                    email=d["email"],
                    name=d["name"],
                    hashed_password=hashed_pw,
                    role=d["role"],
                    department=d["dept"],
                    expected_hours_per_month=d["expected"]
                )
                db.add(user)
            else:
                user.department = d["dept"]
                user.expected_hours_per_month = d["expected"]
            
            team_users.append(user)
        db.commit()
        for u in team_users:
            db.refresh(u)

        lawyers = [u for u in team_users if u.role in ["partner", "associate", "paralegal"]] # team except admin

        print("Creating mock clients...")
        client_names = ["Acme Corp", "Global Finance Ltd", "TechSoft Solutions", "Delta Logistics", "Omega Healthcare"]
        industries = ["Manufacturing", "Finance", "Technology", "Logistics", "Healthcare"]
        clients = []
        for i, name in enumerate(client_names):
            client = db.query(Client).filter(Client.name == name).first()
            if not client:
                client = Client(name=name, industry=industries[i], country="USA")
                db.add(client)
            clients.append(client)
        db.commit()
        for c in clients:
            db.refresh(c)

        print("Creating cases, tasks, and timesheets...")
        case_types = ["Civil", "Criminal", "Corporate", "Real Estate"]
        task_names = ["Draft Motion", "Review Contract", "Client Meeting", "Deposition Prep", "Legal Research", "Filing Documents"]
        now = datetime.now(timezone.utc)
        
        all_cases = []
        
        # Generate cases
        for client in clients:
            num_cases = random.randint(3, 8)
            for _ in range(num_cases):
                assignee = random.choice(lawyers)
                status = random.choices(["open", "closed", "on_hold"], weights=[0.6, 0.3, 0.1])[0]
                created_ago = random.randint(30, 180)
                
                case = LawfirmCase(
                    title=f"{client.name} - Matter {random.randint(1000, 9999)}",
                    client_id=client.id,
                    assigned_to=assignee.id,
                    status=status,
                    case_type=random.choice(case_types),
                    created_at=now - timedelta(days=created_ago)
                )
                db.add(case)
                all_cases.append(case)
        db.commit()
        for c in all_cases:
            db.refresh(c)

        # Generate Tasks and Timesheets
        for case in all_cases:
            # 1 to 5 tasks per case
            for _ in range(random.randint(1, 5)):
                status = random.choices(["pending", "in_progress", "completed"], weights=[0.2, 0.3, 0.5])[0]
                task = LawfirmTask(
                    title=random.choice(task_names) + f" for {case.title[-4:]}",
                    case_id=case.id,
                    assigned_to=case.assigned_to, # assign to case owner or random
                    status=status,
                    completed_at=now - timedelta(days=random.randint(1, 10)) if status == "completed" else None
                )
                db.add(task)

        # Generate timesheets (last 6 months) for each lawyer
        for lawyer in lawyers:
            cases_for_lawyer = [c for c in all_cases if c.assigned_to == lawyer.id]
            if not cases_for_lawyer:
                cases_for_lawyer = [random.choice(all_cases)] # give them one at least
                
            for month_offset in range(6):
                # Calculate billing date
                month_date = now - timedelta(days=month_offset * 30)
                month_str = month_date.strftime("%b %Y")
                
                # 5 to 20 timesheet entries per month per lawyer
                num_entries = random.randint(10, 25)
                for _ in range(num_entries):
                    case = random.choice(cases_for_lawyer)
                    hours = round(random.uniform(1.0, 8.0), 1)
                    # Different rates for roles
                    rate = 400 if lawyer.role == "partner" else 250 if lawyer.role == "associate" else 100
                    revenue = hours * rate
                    
                    ts = Timesheet(
                        user_id=lawyer.id,
                        case_id=case.id,
                        hours=hours,
                        revenue_generated=revenue,
                        billable=1,
                        month=month_str,
                        created_at=month_date - timedelta(days=random.randint(1, 28))
                    )
                    db.add(ts)
                    
                    # Add corresponding billing record for partner dashboard
                    bill = Billing(
                        client_id=case.client_id,
                        amount=revenue,
                        service_type="Legal Services",
                        created_at=ts.created_at
                    )
                    db.add(bill)

        db.commit()
        print("Successfully seeded team overview data!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_analytics()
