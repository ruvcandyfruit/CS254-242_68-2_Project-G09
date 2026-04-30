from flask import Blueprint, jsonify, session, request
from app.services.workload_service import get_workload_analysis

workload_bp = Blueprint("workload", __name__)

@workload_bp.route("/", methods=["GET"])
def get_workload():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    mode = request.args.get("mode", "weekly")

    try:
        data = get_workload_analysis(user_id, mode)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500