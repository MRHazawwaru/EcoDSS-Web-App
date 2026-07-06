from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base, get_db
from app.models import economic_data
from sqlalchemy import func, extract
from sqlalchemy.orm import Session
from app.models.economic_data import EconomicData

# IMPORT ROUTER YANG BARU KITA BUAT
from app.api import dataset
from app.api import training
from app.api import repository
from app.api import simulasi
from app.api import analytics
from app.api import auth
from app.routers import feedback

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="EcoDSS API",
    description="Backend API untuk Model-Driven Decision Support System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://eco-dss.vercel.app",
        "*" # (Opsional) Buka sementara pakai bintang kalau URL frontend-mu dinamis/sering berubah
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DAFTARKAN ROUTER KE APLIKASI UTAMA
app.include_router(dataset.router)
app.include_router(training.router)
app.include_router(repository.router)
app.include_router(simulasi.router)
app.include_router(analytics.router)
app.include_router(auth.router)
app.include_router(feedback.router)

@app.get("/")
def read_root():
    return {
        "status": "success",
        "message": "EcoDSS Backend API berjalan dengan lancar!",
        "engine": "FastAPI + PostgreSQL"
    }

@app.get("/health/db")
def check_db_health():
    try:
        with engine.connect() as connection:
            return {"status": "success", "message": "Koneksi ke Supabase berhasil!"}
    except Exception as e:
        return {"status": "error", "message": f"Koneksi database gagal: {str(e)}"}
    
    

@app.get("/api/periode")
def get_periods(
    db: Session = Depends(get_db),
    x_user_id: int = Header(..., description="ID User yang sedang login") # [BARU] Tangkap KTP
):
    try:
        periods = db.query(
            extract('year', EconomicData.periode).label('tahun'),
            extract('month', EconomicData.periode).label('bulan')
        ).filter(
            EconomicData.user_id == x_user_id # [BARU] Filter khusus untuk user yang login
        ).distinct().order_by(
            extract('year', EconomicData.periode).desc(),
            extract('month', EconomicData.periode).desc()
        ).all()

        return [{"bulan": int(p.bulan), "tahun": int(p.tahun)} for p in periods]
    except Exception as e:
        print(f"DB Error di Periode: {e}")
        raise HTTPException(status_code=500, detail=f"Gagal mengambil periode: {str(e)}")

@app.delete("/api/periode/{tahun}/{bulan}")
def delete_period(
    tahun: int, 
    bulan: int, 
    db: Session = Depends(get_db),
    x_user_id: int = Header(..., description="ID User yang sedang login") # [BARU] Tangkap KTP
):
    try:
        db.query(EconomicData).filter(
            extract('year', EconomicData.periode) == tahun,
            extract('month', EconomicData.periode) == bulan,
            EconomicData.user_id == x_user_id # [BARU] Pastikan yang dihapus hanya milik user tersebut
        ).delete(synchronize_session=False)
        
        db.commit()
        return {"status": "success", "message": f"Data periode {bulan}-{tahun} berhasil dihapus"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menghapus data: {str(e)}")