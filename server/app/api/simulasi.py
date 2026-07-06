import os
import joblib
import pandas as pd
import numpy as np
from fastapi import APIRouter, Depends, HTTPException, Header # [TAMBAHAN: Header]
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.core.database import get_db

router = APIRouter(
    prefix="/api/simulasi",
    tags=["Simulasi Skenario"]
)

MODEL_DIR = "ml_models"

class SkenarioInput(BaseModel):
    model_type: str
    bi_rate: float
    kurs_usd: float
    jumlah_uang_beredar_m2: float
    ihk: float
    kredit_perbankan: float
    harga_minyak_brent: float
    indeks_pangan_fao: float
    harga_cpo: float
    harga_batubara: float

@router.post("/run")
def run_simulation(
    skenario: SkenarioInput, 
    db: Session = Depends(get_db),
    x_user_id: int = Header(..., description="ID User yang sedang login") # [BARU]
):
    try:
        # [UPDATE] Load Scaler & Model dengan ekstensi ID spesifik
        scaler_path = os.path.join(MODEL_DIR, f"scaler_{x_user_id}.pkl")
        model_path = os.path.join(MODEL_DIR, f"{skenario.model_type}_model_{x_user_id}.pkl")

        if not os.path.exists(scaler_path) or not os.path.exists(model_path):
            raise HTTPException(status_code=400, detail="Model AI pribadimu belum dilatih. Silakan ke menu 'Model Training' terlebih dahulu.")

        scaler = joblib.load(scaler_path)
        model = joblib.load(model_path)

        input_dict = {
            "bi_rate": skenario.bi_rate,
            "kurs_usd": skenario.kurs_usd,
            "jumlah_uang_beredar_m2": skenario.jumlah_uang_beredar_m2,
            "ihk": skenario.ihk,
            "kredit_perbankan": skenario.kredit_perbankan,
            "harga_minyak_brent": skenario.harga_minyak_brent,
            "indeks_pangan_fao": skenario.indeks_pangan_fao,
            "harga_cpo": skenario.harga_cpo,
            "harga_batubara": skenario.harga_batubara
        }
        
        df_input = pd.DataFrame([input_dict])
        X_scaled = scaler.transform(df_input)

        prediksi = model.predict(X_scaled)
        hasil_inflasi = float(prediksi[0])

        return {
            "status": "success",
            "message": "Simulasi berhasil dieksekusi secara real-time.",
            "skenario_variabel": skenario.dict(),
            "prediksi_inflasi_yoy": round(hasil_inflasi, 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Simulasi Error: {e}")
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")