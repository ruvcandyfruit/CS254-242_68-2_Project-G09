from flask import Blueprint, request, jsonify, session
from app.services.auth_service import login_user
from app.models.user_model import User
from app.models import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    user, error = login_user(
        email=data.get('email'),
        password=data.get('password')
    )
    if error:
        return jsonify({"error": error}), 401

    session['user_id'] = user.id
    return jsonify({
        "message": "login success",
        "user": {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
        }
    })


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''

    if not username or not email or not password:
        return jsonify({"error": "กรอกข้อมูลให้ครบ"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "อีเมลนี้ถูกใช้งานแล้ว"}), 409

    user = User(username=username, email=email, password=password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "register success"}), 201


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "logged out"})
