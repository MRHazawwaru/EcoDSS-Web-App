from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base

class EconomicData(Base):
    __tablename__ = "economic_data"

    id = Column(Integer, primary_key=True, index=True)
    
    # [BARU] Kolom pengikat: Data ini milik user ID berapa?
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # [UPDATE] unique=True dihapus dari sini, dipindah ke __table_args__ di bawah
    periode = Column(Date, index=True, nullable=False) 
    
    # Variabel Target
    inflasi_yoy = Column(Float, nullable=False) 
    
    # Variabel Independen Domestik 
    bi_rate = Column(Float, nullable=False)
    kurs_usd = Column(Float, nullable=False)
    jumlah_uang_beredar_m2 = Column(Float, nullable=False)
    ihk = Column(Float, nullable=False)
    kredit_perbankan = Column(Float, nullable=False)
    
    # Variabel Eksternal Global 
    harga_minyak_brent = Column(Float, nullable=False)
    indeks_pangan_fao = Column(Float, nullable=False)
    harga_cpo = Column(Float, nullable=False)
    harga_batubara = Column(Float, nullable=False)
    
# [BARU] Tabel Ruang Tunggu
class StagingData(Base):
    __tablename__ = "staging_data"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    periode = Column(Date, nullable=False)
    # Semua dibikin nullable=True karena datanya bisa masuk dicicil
    inflasi_yoy = Column(Float, nullable=True)
    bi_rate = Column(Float, nullable=True)
    kurs_usd = Column(Float, nullable=True)
    jumlah_uang_beredar_m2 = Column(Float, nullable=True)
    ihk = Column(Float, nullable=True)
    kredit_perbankan = Column(Float, nullable=True)
    harga_minyak_brent = Column(Float, nullable=True)
    indeks_pangan_fao = Column(Float, nullable=True)
    harga_cpo = Column(Float, nullable=True)
    harga_batubara = Column(Float, nullable=True)

    # Relasi balik ke tabel User
    owner = relationship("User")

    # [BARU] Aturan Kombinasi Unik: 
    # Mencegah 1 user menginput 2 data di bulan yang sama. 
    # Tapi user yang berbeda tetap bisa menginput di bulan yang sama.
    __table_args__ = (
        UniqueConstraint('user_id', 'periode', name='_user_periode_uc'),
    )