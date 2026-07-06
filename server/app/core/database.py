import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Memuat variabel dari file .env di folder server
load_dotenv()

# Mengambil DATABASE_URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Memastikan koneksi berjalan lancar dengan Supabase (PostgreSQL)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300)

# Membuat sesi yang akan digunakan untuk setiap request ke database
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class untuk semua model tabel kita nanti
Base = declarative_base()

# Dependency function untuk digunakan di endpoint API nanti
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()