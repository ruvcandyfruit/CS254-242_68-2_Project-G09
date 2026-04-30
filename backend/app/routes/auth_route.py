from flask import Blueprint, request, jsonify, session

from app.services.auth_service import AuthService


auth_bp = Blueprint('auth', __name__)
auth_service = AuthService()


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}

    user, error = auth_service.register_user(
        username=data.get('username', ''),
        email=data.get('email', ''),
        password=data.get('password', '')
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "Register success",
        "user": user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}

    user, error = auth_service.login_user(
        email=data.get('email', ''),
        password=data.get('password', '')
    )

    if error:
        return jsonify({"error": error}), 401

    session['user_id'] = user.id

    return jsonify({
        "message": "Login success",
        "user": user.to_dict()
    }), 200


@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)

    return jsonify({
        "message": "Logout success"
    }), 200