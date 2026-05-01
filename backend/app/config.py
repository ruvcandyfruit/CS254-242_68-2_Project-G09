import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = 'snake&fish'

    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///workflow.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ให้ session cookie ข้าม origin ได้ (จำเป็นสำหรับ demo localhost)
    SESSION_COOKIE_SAMESITE = 'Lax'
    SESSION_COOKIE_SECURE = False