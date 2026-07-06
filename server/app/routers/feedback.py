from fastapi import APIRouter, Header, HTTPException, BackgroundTasks
from pydantic import BaseModel
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client
from dotenv import load_dotenv
from pathlib import Path

# [BARU] Paksa Python mencari file .env tepat di folder 'server' (akar proyek backend)
env_path = Path(__file__).resolve().parent.parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

router = APIRouter(prefix="/api/feedback", tags=["Feedback UAT"])

# Pengecekan Aman (Safe Check)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("⚠️ WARNING: Kunci Supabase tidak ditemukan di file .env Backend!")
    supabase = None
else:
    # Inisialisasi Supabase
    supabase: Client = create_client(supabase_url, supabase_key)

# Inisialisasi Supabase
# supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

# Definisi struktur data yang dikirim dari Frontend
class FeedbackRequest(BaseModel):
    menu_code: str
    feedback_text: str
    image_url: str | None = None
    username: str = "User Tester"

# Fungsi Tukang Pos (Akan berjalan di background agar UI user tidak ngelag/loading lama)
def send_email_notification(username: str, menu_code: str, feedback_text: str, image_url: str):
    sender_email = os.getenv("EMAIL_SENDER")
    sender_password = os.getenv("EMAIL_PASSWORD") # Menggunakan App Password Gmail
    receiver_email = os.getenv("EMAIL_RECEIVER")  # Emailmu sebagai Super Admin

    # Jika .env belum diisi, lewati pengiriman email agar aplikasi tidak error
    if not sender_email or not sender_password or not receiver_email:
        print("INFO: Kredensial email di .env kosong. Lewati kirim email.")
        return

    subject = f"🚨 UAT Feedback Baru [{menu_code}] - EcoDSS"
    
    body = f"""
Halo Super Admin!

Ada masukan/feedback baru yang masuk dari Pengguna:

- Pengirim: {username}
- Lokasi Menu: {menu_code}
- Saran/Komplain: 
{feedback_text}

{'Lampiran Foto Bug: ' + image_url if image_url else 'Tidak ada foto yang dilampirkan.'}

Silakan buka Dashboard EcoDSS untuk melihat detail dan merespons feedback ini.
"""

    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = receiver_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        # Konfigurasi server SMTP Gmail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, receiver_email, text)
        server.quit()
        print(f"INFO: Email notifikasi feedback berhasil dikirim ke {receiver_email}")
    except Exception as e:
        print("ERROR: Gagal mengirim email:", e)

# Endpoint Utama yang akan dipanggil Frontend
@router.post("/")
async def submit_feedback(request: FeedbackRequest, background_tasks: BackgroundTasks, x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Akses ditolak: User ID tidak ditemukan")

    try:
        # 1. Simpan ke Supabase
        data = {
            "user_id": x_user_id,
            "username": request.username,
            "menu_code": request.menu_code,
            "feedback_text": request.feedback_text,
            "image_url": request.image_url
        }
        supabase.table("feedbacks").insert(data).execute()

        # 2. Perintahkan FastAPI untuk kirim email di belakang layar (Background Task)
        # Jadi user langsung dapet respon "Berhasil" tanpa nunggu proses email selesai
        background_tasks.add_task(
            send_email_notification, 
            request.username, 
            request.menu_code, 
            request.feedback_text, 
            request.image_url
        )

        return {"status": "success", "message": "Terimakasih atas saran dan masukkan Anda!"}
    
    except Exception as e:
        print("Database Error:", e)
        raise HTTPException(status_code=500, detail="Gagal menyimpan feedback ke server")


# [BARU] Endpoint untuk menarik semua data feedback (Khusus Super Admin)
@router.get("/")
async def get_all_feedbacks(x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Akses ditolak")
    
    try:
        # Mengambil semua data dari tabel feedbacks, diurutkan dari yang terbaru
        response = supabase.table("feedbacks").select("*").order("created_at", desc=True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        print("Error fetching feedbacks:", e)
        raise HTTPException(status_code=500, detail="Gagal mengambil data feedback")

# [BARU] Endpoint untuk mengubah status feedback menjadi 'resolved' (Selesai)
@router.patch("/{feedback_id}/resolve")
async def resolve_feedback(feedback_id: str, x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Akses ditolak")
    
    try:
        supabase.table("feedbacks").update({"status": "resolved"}).eq("id", feedback_id).execute()
        return {"status": "success", "message": "Feedback ditandai selesai!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Gagal mengupdate status feedback")
    
# [BARU] Endpoint untuk menghapus feedback secara permanen
@router.delete("/{feedback_id}")
async def delete_feedback(feedback_id: str, x_user_id: str = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Akses ditolak")
    
    try:
        supabase.table("feedbacks").delete().eq("id", feedback_id).execute()
        return {"status": "success", "message": "Feedback berhasil dihapus permanen!"}
    except Exception as e:
        print("Error deleting feedback:", e)
        raise HTTPException(status_code=500, detail="Gagal menghapus feedback")