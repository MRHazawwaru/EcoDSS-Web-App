import os
import datetime
from fastapi import APIRouter, HTTPException, Header # [TAMBAHAN: Header]

router = APIRouter(
    prefix="/api/repository",
    tags=["Model Repository"]
)

MODEL_DIR = "ml_models"

@router.get("/")
def get_saved_models(
    x_user_id: int = Header(..., description="ID User yang sedang login") # [BARU]
):
    try:
        models = []
        if os.path.exists(MODEL_DIR):
            for file in os.listdir(MODEL_DIR):
                # [UPDATE] Filter agar hanya memunculkan file dengan akhiran ID user ini
                if file.endswith(f"_{x_user_id}.pkl"):
                    file_path = os.path.join(MODEL_DIR, file)
                    size_kb = os.path.getsize(file_path) / 1024
                    mod_time = os.path.getmtime(file_path)
                    
                    if "scaler" in file:
                        tipe = "Data Preprocessor"
                        nama_bersih = "Scaler Engine"
                    else:
                        tipe = "AI Prediction Model"
                        # Bersihkan nama file dari angka ID agar UI tetap cantik dilihat user
                        nama_bersih = file.replace(f"_{x_user_id}.pkl", "").replace("_", " ").title()

                    models.append({
                        "filename": nama_bersih,
                        "type": tipe,
                        "size_kb": round(size_kb, 2),
                        "last_modified": datetime.datetime.fromtimestamp(mod_time).strftime('%Y-%m-%d %H:%M:%S')
                    })
        
        models.sort(key=lambda x: x['last_modified'], reverse=True)
        
        return {
            "status": "success",
            "total_models": len(models),
            "data": models
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memuat repository: {str(e)}")