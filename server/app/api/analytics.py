import os
import joblib
import numpy as np
from fastapi import APIRouter, HTTPException, Header # [TAMBAHAN]

router = APIRouter(
    prefix="/api/analytics",
    tags=["Model Analytics"]
)

MODEL_DIR = "ml_models"

@router.get("/feature-importance")
def get_feature_importance(
    model_type: str = "random_forest",
    x_user_id: int = Header(..., description="ID User yang sedang login") # [BARU]
):
    try:
        # [UPDATE] Sisipkan x_user_id pada pembacaan file
        model_path = os.path.join(MODEL_DIR, f"{model_type}_model_{x_user_id}.pkl")
        if not os.path.exists(model_path):
            raise HTTPException(status_code=404, detail="Model tidak ditemukan di repository.")

        model = joblib.load(model_path)
        
        if hasattr(model, "feature_importances_"):
            raw_importances = model.feature_importances_
        else:
            raise HTTPException(status_code=400, detail="Model ini tidak mendukung ekstraksi feature importance.")

        num_features = 9
        
        if len(raw_importances) != num_features:
             raise HTTPException(
                 status_code=400, 
                 detail=f"Dimensi feature importance ({len(raw_importances)}) tidak sesuai dengan jumlah variabel ({num_features})."
             )
        
        total_importance = np.sum(raw_importances)
        percentages = (raw_importances / total_importance) * 100

        feature_names = [
            "BI Rate", "Kurs USD", "Uang Beredar (M2)", "IHK", 
            "Kredit Perbankan", "Minyak Brent", "Indeks Pangan FAO", 
            "Harga CPO", "Harga Batubara"
        ]

        importance_data = []
        for name, score in zip(feature_names, percentages):
            importance_data.append({
                "feature": name,
                "importance_percent": round(float(score), 2)
            })
        
        importance_data.sort(key=lambda x: x["importance_percent"], reverse=True)

        return {
            "status": "success",
            "model": model_type,
            "data": importance_data
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengekstrak analitik: {str(e)}")