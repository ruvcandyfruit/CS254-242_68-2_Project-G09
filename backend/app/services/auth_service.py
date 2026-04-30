from werkzeug.security import check_password_hash

from app.models import db
from app.models.user_model import User


class AuthService:

    def register_user(self, username, email, password):
        email = email.lower().strip()

        if User.query.filter_by(email=email).first():
            return None, "Email already registered"

        try:
            user = User(username=username, email=email, password=password)
        except ValueError as e:
            return None, str(e)

        db.session.add(user)
        db.session.commit()

        return user, None

    def login_user(self, email, password):
        email = email.lower().strip()

        user = User.query.filter_by(email=email).first()

        if not user:
            return None, "User not found"

        if not user.check_password(password, check_password_hash):
            return None, "Invalid password"

        return user, None