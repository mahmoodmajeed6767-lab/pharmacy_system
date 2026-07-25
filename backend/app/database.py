from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Database URL fetch karein
db_url = settings.DATABASE_URL

# Fix: Railway ke 'mysql://' URL ko SQLAlchemy ke liye 'mysql+pymysql://' mein badlein
if db_url and db_url.startswith("mysql://"):
    db_url = db_url.replace("mysql://", "mysql+pymysql://", 1)

# Fix: pool_pre_ping=True se connections automatically drop/reconnect handle honge
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()