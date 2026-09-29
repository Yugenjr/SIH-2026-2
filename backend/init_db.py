import sys
import argparse
from database import engine, Base, SessionLocal
from models.sql_models import (
    UserProfileModel, SchemeConfigModel, ApplicationModel, FellowshipModel, AuditRecordModel
)
from seed import (
    SEED_SCHEMES, SEED_STUDENT_PROFILE, generate_synthetic_applications, SEED_FELLOWSHIP, SEED_AUDIT_LOGS
)

def init_db(force_reset: bool = False):
    db = SessionLocal()
    try:
        if force_reset:
            print("Resetting SQL database tables for demo...")
            Base.metadata.drop_all(bind=engine)
            db.commit()

        print("Creating SQL database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Check if database is already populated
        if not force_reset and db.query(SchemeConfigModel).count() > 0:
            print("Database already initialized with seed data. Skipping seed population.")
            return

        print("Populating initial demo seed data into database...")

        # 1. Seed Student Profile
        user_profile = UserProfileModel(**SEED_STUDENT_PROFILE)
        db.add(user_profile)

        # 2. Seed Schemes
        for s in SEED_SCHEMES:
            scheme = SchemeConfigModel(**s)
            db.add(scheme)

        # 3. Seed Applications (100 synthetic applications)
        apps = generate_synthetic_applications()
        for a in apps:
            app = ApplicationModel(**a)
            db.add(app)

        # 4. Seed Fellowship
        fel = FellowshipModel(**SEED_FELLOWSHIP)
        db.add(fel)

        # 5. Seed Audit Logs
        for audit in SEED_AUDIT_LOGS:
            aud = AuditRecordModel(**audit)
            db.add(aud)

        db.commit()
        print(f"Database initialization complete! Seeded {len(apps)} applications, {len(SEED_SCHEMES)} schemes, and audit records.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SETU Database Seed and Reset Tool")
    parser.add_argument("--reset", "--demo", action="store_true", help="Force drop tables and re-seed clean demo data")
    args = parser.parse_args()
    init_db(force_reset=args.reset)
