from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from pydantic import BaseModel

from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Inisialisasi sistem enkripsi password (Hashing)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Skema data yang diharapkan dari Frontend
class UserCredentials(BaseModel):
    username: str
    password: str

@router.post("/register")
def register(user: UserCredentials, db: Session = Depends(get_db)):
    # 1. Cek apakah username sudah ada yang pakai
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username sudah terdaftar. Silakan gunakan yang lain.")
    
    # 2. Enkripsi password sebelum disimpan ke database (Keamanan tingkat tinggi)
    hashed_password = pwd_context.hash(user.password)
    
    # 3. Simpan sebagai "user" biasa secara default
    new_user = User(
        username=user.username, 
        password_hash=hashed_password,
        role="user" 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Registrasi berhasil", "user_id": new_user.id}

@router.post("/login")
def login(user: UserCredentials, db: Session = Depends(get_db)):
    # 1. Cari user di database
    db_user = db.query(User).filter(User.username == user.username).first()
    
    # 2. Jika user tidak ada ATAU password yang diketik tidak cocok dengan password acak di DB
    if not db_user or not pwd_context.verify(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Username atau password salah!")
    
    # 3. Jika lolos, kirimkan identitasnya ke Frontend
    return {
        "message": "Login berhasil", 
        "user_id": db_user.id, 
        "username": db_user.username,
        "role": db_user.role
    }
    
# ==========================================
# FITUR SUPER ADMIN: MANAJEMEN USER
# ==========================================

@router.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    try:
        # Mengambil semua user kecuali password-nya
        users = db.query(User).all()
        result = [
            {
                "id": u.id, 
                "username": u.username, 
                "role": getattr(u, 'role', 'user') # Fallback jika kolom role belum ada di skema lama
            } 
            for u in users
        ]
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")
        
        # Mencegah Super Admin pertama terhapus
        if getattr(user, 'role', 'user') == 'super_admin' and user_id == 1:
            raise HTTPException(status_code=403, detail="Tidak dapat menghapus Master Super Admin")

        db.delete(user)
        db.commit()
        return {"status": "success", "message": f"User {user.username} dan seluruh datanya berhasil dihapus."}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest, 
    db: Session = Depends(get_db), 
    x_user_id: int = Header(..., description="ID User login")
):
    try:
        user = db.query(User).filter(User.id == x_user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User tidak ditemukan")

        # Verifikasi password lama
        if not pwd_context.verify(data.old_password, user.password_hash):
            raise HTTPException(status_code=400, detail="Password lama tidak sesuai!")

        # Hash password baru dan simpan
        user.password_hash = pwd_context.hash(data.new_password)
        db.commit()
        
        return {"status": "success", "message": "Password berhasil diperbarui!"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))