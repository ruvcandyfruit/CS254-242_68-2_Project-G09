from app.models import db
from werkzeug.security import generate_password_hash


class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)

    courses = db.relationship('Course', backref='user', lazy=True)

    def __init__(self, username, email, password):
        self.set_username(username)
        self.set_email(email)
        self.set_password(password)

    def get_username(self):
        return self.username

    def get_email(self):
        return self.email

    def get_password(self):
        return self.password

    def set_username(self, username):
        if not username or not username.strip():
            raise ValueError("Username cannot be empty")

        self._username = username.strip()
        self.username = self._username

    def set_email(self, email):
        if not email or "@" not in email:
            raise ValueError("Invalid email")

        self._email = email.lower().strip()
        self.email = self._email

    def set_password(self, password):
        if not password or len(password) < 6:
            raise ValueError("Password must be at least 6 characters")

        self._password = generate_password_hash(password)
        self.password = self._password

    def check_password(self, password, verify_func):
        return verify_func(self.get_password(), password)

    def to_dict(self):
        return {
            "user_id": self.id,
            "username": self.get_username(),
            "email": self.get_email()
        }