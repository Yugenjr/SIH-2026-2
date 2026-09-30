import os
import shutil
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

db_path = "./setu.db"
if os.getenv("VERCEL") or os.getenv("VERCEL_ENV"):
    tmp_path = "/tmp/setu.db"
    if not os.path.exists(tmp_path) and os.path.exists(db_path):
        shutil.copy2(db_path, tmp_path)
    db_path = tmp_path

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{db_path}")

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
