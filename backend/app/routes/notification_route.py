from flask import Blueprint, jsonify, session
from app.services.notification_service import NotificationService

notification_bp = Blueprint("notification", __name__)

@notification_bp.route("/", methods=["GET"])
def get_all():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    service = NotificationService(user_id)
    data = service.get_notifications()
    return jsonify(data), 200