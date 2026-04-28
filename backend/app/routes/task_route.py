from flask import Blueprint, request, jsonify, session
from app.services.task_service import (
    create_task,
    get_all_tasks_by_user,
    get_task_by_id,
    update_task,
    toggle_task_status
)

task_bp = Blueprint("task", __name__)

# API endpoints 
@task_bp.route("", methods=["POST"])
def create():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    task = create_task(
        title=data.get("title"),
        description=data.get("description"),
        deadline=data.get("deadline"),
        duration=data.get("duration"),
        emergency=data.get("emergency"),
        score_weight=data.get("score_weight"),
        course_id=data.get("course_id")
    )

    return jsonify({"message": "Task created", "id": task.id})


@task_bp.route("", methods=["GET"])
def get_all():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    tasks = get_all_tasks_by_user(user_id)

    return jsonify([
        {
            "id": t.id,
            "title": t._title,
            "description": t.description,
            "deadline": t._deadline,
            "duration": t._duration,
            "emergency": t._emergency,
            "score_weight": t._score_weight,
            "status": t._status
        } for t in tasks
    ])


@task_bp.route("/<int:task_id>", methods=["GET"])
def get_one(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    t = get_task_by_id(task_id)

    return jsonify({
        "id": t.id,
        "title": t._title,
        "description": t.description,
        "deadline": str(t._deadline),
        "status": t._status
    })


@task_bp.route("/<int:task_id>", methods=["PUT"])
def update(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    task = get_task_by_id(task_id)  
    if not task:
        return jsonify({"error": "Task not found"}), 404

    update_task(task, **data)  

    return jsonify({"message": "Task updated"})


@task_bp.route("/<int:task_id>/status", methods=["PATCH"])
def update_status(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    task = toggle_task_status(task_id, user_id)

    if not task:
        return jsonify({"error": "Task not found or forbidden"}), 404

    return jsonify({
        "message": "Status toggled",
        "status": task.get_status()
    })