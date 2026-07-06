import pandas as pd
import io
import re
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.economic_data import EconomicData, StagingData

router = APIRouter(
    prefix="/api/dataset",
    tags=["Dataset Management"]
)

# 1. KAMUS NLP CERDAS (Ditambahkan Alias Baru)
KEYWORD_MAP = {
    'inflasi_yoy': ['inflasi', 'inflation'],
    'bi_rate': ['bi rate', 'suku bunga', 'interest', 'bunga acuan'],
    'kurs_usd': ['kurs', 'nilai tukar', 'usd', 'rupiah', 'amerika serikat', 'united states', 'us $'], # [UPDATE] Tambah Alias
    'jumlah_uang_beredar_m2': ['m2', 'uang beredar', 'broad money', 'uang kuasi'],
    'ihk': ['ihk', 'indeks harga konsumen', 'cpi'],
    'kredit_perbankan': ['kredit', 'pinjaman', 'loan', 'klaim', 'claims'],
    'harga_minyak_brent': ['minyak', 'brent', 'oil'],
    'indeks_pangan_fao': ['fao', 'pangan', 'food index'],
    'harga_cpo': ['cpo', 'kelapa sawit', 'palm oil', 'minyak sawit'],
    'harga_batubara': ['batubara', 'coal']
}

def clean_text(text):
    """Melucuti semua spasi, tanda baca, kurung, dan huruf besar"""
    return re.sub(r'[^a-z0-9]', '', str(text).lower())

def get_sys_var(text):
    """Mencari pasangan variabel sistem berdasarkan teks kotor Excel"""
    ct = clean_text(text)
    if not ct or len(ct) < 2: return None
    for sys_var, keywords in KEYWORD_MAP.items():
        if any(clean_text(kw) in ct for kw in keywords):
            return sys_var
    return None

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    x_user_id: int = Header(..., description="ID User login")
):
    try:
        contents = await file.read()
        
        if file.filename.endswith('.csv'):
            text_content = contents.decode('utf-8', errors='ignore')
            sep = ';' if ';' in text_content.split('\n')[0] else ','
            df = pd.read_csv(io.StringIO(text_content), sep=sep, header=None, on_bad_lines='skip')
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(contents), header=None)
        else:
            raise HTTPException(status_code=400, detail="Format file tidak didukung.")

        df = df.fillna('')
        matrix = df.values.tolist()
        
        # 2. RADAR ORIENTASI MATRIKS [UPDATE: Diperluas ke 40 Baris Pertama!]
        is_seki_horizontal = False
        for row in matrix[:40]: 
            str_row = "".join([str(x) for x in row]).lower()
            if "jan" in str_row and "feb" in str_row and "mar" in str_row:
                is_seki_horizontal = True
                break

        parsed_data = {} 

        # =========================================================
        # MESIN A: PARSER HORIZONTAL (KHUSUS FILE SEKI/BPS)
        # =========================================================
        if is_seki_horizontal:
            month_row_idx = -1
            months_str = ['jan', 'feb', 'mar', 'apr', 'mei', 'may', 'jun', 'jul', 'agu', 'aug', 'sep', 'okt', 'oct', 'nov', 'nop', 'des', 'dec']
            
            for i, row in enumerate(matrix):
                joined = " ".join([str(c).lower() for c in row])
                if sum(1 for m in months_str if m in joined) >= 3:
                    month_row_idx = i
                    break
            
            if month_row_idx != -1:
                # [UPDATE] Pelacak Tahun Cerdas: Scan 5 baris ke atas untuk mencari angka Tahun (19xx/20xx)
                year_row_idx = month_row_idx - 1
                for j in range(month_row_idx - 1, max(-1, month_row_idx - 6), -1):
                    joined_y = "".join([str(c) for c in matrix[j]])
                    if re.search(r'(19|20)\d{2}', joined_y):
                        year_row_idx = j
                        break
                        
                year_row = matrix[year_row_idx]
                month_row = matrix[month_row_idx]
                col_to_date = {}
                current_year = 2000 
                
                month_dict = {'jan':1, 'feb':2, 'mar':3, 'apr':4, 'mei':5, 'may':5, 'jun':6, 
                              'jul':7, 'agu':8, 'aug':8, 'sep':9, 'okt':10, 'oct':10, 'nov':11, 'nop':11, 'des':12, 'dec':12}
                
                for col_idx in range(len(month_row)):
                    year_cell = str(year_row[col_idx]).strip()
                    match_year = re.search(r'(19|20)\d{2}', year_cell)
                    if match_year:
                        current_year = int(match_year.group())
                        
                    month_cell = str(month_row[col_idx]).strip().lower()
                    clean_month = re.sub(r'[^a-z]', '', month_cell)
                    
                    if clean_month in month_dict:
                        m_num = month_dict[clean_month]
                        date_str = f"{current_year}-{m_num:02d}-01"
                        try:
                            valid_date = pd.to_datetime(date_str).date()
                            col_to_date[col_idx] = valid_date
                        except: pass

                for i in range(month_row_idx + 1, len(matrix)):
                    row = matrix[i]
                    var_text = " ".join([str(x) for x in row[:3]])
                    sys_var = get_sys_var(var_text)
                    
                    if sys_var:
                        for col_idx, p_date in col_to_date.items():
                            val = row[col_idx]
                            try:
                                clean_val = str(val).replace(',', '').replace(' ', '')
                                float_val = float(clean_val)
                                if p_date not in parsed_data: parsed_data[p_date] = {}
                                parsed_data[p_date][sys_var] = float_val
                            except: pass

        # =========================================================
        # MESIN B: PARSER VERTIKAL (FILE NORMAL / TEMPLATE)
        # =========================================================
        else:
            df.columns = df.iloc[0] 
            df = df[1:]
            
            periode_col = None
            for col in df.columns:
                if any(k in str(col).lower() for k in ['periode', 'tanggal', 'date', 'tahun', 'bulan', 'time']):
                    periode_col = col
                    break
            if not periode_col: periode_col = df.columns[0]
                
            col_mapping = {}
            for col in df.columns:
                sys_var = get_sys_var(str(col))
                if sys_var: col_mapping[col] = sys_var
                    
            for index, row in df.iterrows():
                try:
                    p_str = str(row[periode_col])
                    p_date = pd.to_datetime(p_str).date()
                    if p_date not in parsed_data: parsed_data[p_date] = {}
                        
                    for col_name, sys_var in col_mapping.items():
                        val = row[col_name]
                        try:
                            clean_val = str(val).replace(',', '').replace(' ', '')
                            parsed_data[p_date][sys_var] = float(clean_val)
                        except: pass
                except: continue

        # =========================================================
        # 3. MASUKKAN DATA KE RUANG TUNGGU (STAGING)
        # =========================================================
        records_processed = 0
        for p_date, vars_dict in parsed_data.items():
            if not vars_dict: continue 
            
            # [UPDATE] Filter Super Ketat Anti-NaT
            if pd.isna(p_date) or str(p_date).lower() == 'nat' or str(p_date).strip() == '':
                continue
            
            staging = db.query(StagingData).filter(
                StagingData.periode == p_date,
                StagingData.user_id == x_user_id
            ).first()
            
            if not staging:
                staging = StagingData(user_id=x_user_id, periode=p_date)
                db.add(staging)
                
            for v_name, v_val in vars_dict.items():
                setattr(staging, v_name, v_val)
                
            records_processed += 1

        db.commit()

        # =========================================================
        # 4. AUTO-MOVER: RUANG TUNGGU -> DATABASE UTAMA
        # =========================================================
        all_staging = db.query(StagingData).filter(StagingData.user_id == x_user_id).all()
        ready_count = 0
        required_vars = [
            'inflasi_yoy', 'bi_rate', 'kurs_usd', 'jumlah_uang_beredar_m2',
            'ihk', 'kredit_perbankan', 'harga_minyak_brent', 'indeks_pangan_fao',
            'harga_cpo', 'harga_batubara'
        ]

        for stg in all_staging:
            is_complete = all(getattr(stg, var) is not None for var in required_vars)
            
            if is_complete:
                existing_main = db.query(EconomicData).filter(
                    EconomicData.periode == stg.periode, EconomicData.user_id == x_user_id
                ).first()
                
                if existing_main:
                    for var in required_vars: setattr(existing_main, var, getattr(stg, var))
                else:
                    new_main = EconomicData(user_id=x_user_id, periode=stg.periode)
                    for var in required_vars: setattr(new_main, var, getattr(stg, var))
                    db.add(new_main)
                
                db.delete(stg)
                ready_count += 1
        
        db.commit()

        return {
            "status": "success", 
            "message": "AI Omni-Parser berhasil memindai file Anda.",
            "details": f"{records_processed} bulan diproses ke Ruang Tunggu. {ready_count} Periode sudah lengkap."
        }

    except Exception as e:
        db.rollback() 
        raise HTTPException(status_code=500, detail=f"Sistem gagal membaca file: {str(e)}")

@router.get("/")
def get_all_dataset(db: Session = Depends(get_db), x_user_id: int = Header(...)):
    try:
        data = db.query(EconomicData).filter(EconomicData.user_id == x_user_id).order_by(EconomicData.periode.desc()).all()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# [BARU] Endpoint untuk menyapu bersih seluruh Database Utama
@router.delete("/clear-all")
def clear_all_main_dataset(db: Session = Depends(get_db), x_user_id: int = Header(...)):
    try:
        # Menghapus semua baris di tabel utama HANYA milik user tersebut
        deleted_count = db.query(EconomicData).filter(EconomicData.user_id == x_user_id).delete(synchronize_session=False)
        db.commit()
        return {"status": "success", "message": f"{deleted_count} baris data berhasil dikosongkan dari Database Utama."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/staging")
def get_staging_dataset(db: Session = Depends(get_db), x_user_id: int = Header(...)):
    try:
        data = db.query(StagingData).filter(StagingData.user_id == x_user_id).order_by(StagingData.periode.desc()).all()
        return {"status": "success", "data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# [BARU] Endpoint untuk menyapu bersih seluruh Ruang Tunggu
@router.delete("/staging/clear-all")
def clear_all_staging(db: Session = Depends(get_db), x_user_id: int = Header(...)):
    try:
        # Menghapus semua baris yang nyangkut hanya milik user tersebut
        deleted_count = db.query(StagingData).filter(StagingData.user_id == x_user_id).delete(synchronize_session=False)
        db.commit()
        return {"status": "success", "message": f"{deleted_count} periode berhasil dihapus dari Ruang Tunggu."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/staging/{id}")
def delete_staging(id: int, db: Session = Depends(get_db), x_user_id: int = Header(...)):
    try:
        staging = db.query(StagingData).filter(StagingData.id == id, StagingData.user_id == x_user_id).first()
        if staging:
            db.delete(staging)
            db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))