from flask import Blueprint, request, jsonify, session
from app.services.task_service import (
    create_task,
    get_all_tasks_by_user,
    get_prioritized_tasks,
    get_task_by_id,
    update_task,
    toggle_task_status,
    delete_task
)

task_bp = Blueprint("task", __name__)


# สร้าง task ใหม่
@task_bp.route("", methods=["POST"])
def create():
    user_id = session.get("user_id") # เช็คว่า login อยู่ไหม

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    # สร้าง task ส่งข้อมูลไปให้ service 
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


# ดึง task ทั้งหมดของ
@task_bp.route("", methods=["GET"])
def get_all():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    tasks = get_all_tasks_by_user(user_id) # ดึง task ทั้งหมดของ user จาก service

    return jsonify([
        {
            "id": t.id,
            "title": t.get_title(),
            "description": t.description,
            "deadline": t.get_deadline().isoformat(),
            "duration": t.get_duration(),
            "emergency": t.is_emergency(),
            "score_weight": t.get_score_weight(),
            "status": t.get_status()
        } for t in tasks
    ])


# ดึง task หลังจัดความสำคัญ
@task_bp.route("/prioritized", methods=["GET"])
def get_prioritized():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = get_prioritized_tasks(user_id) # ดึง task ที่จัดลำดับแล้วจาก service

    return jsonify(data)


# ดึงรายละเอียด task ตาม id
@task_bp.route("/<int:task_id>", methods=["GET"])
def get_one(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    t = get_task_by_id(task_id)

    if not t:
        return jsonify({"error": "Task not found"}), 404

    return jsonify({
        "id": t.id,
        "title": t.get_title(),
        "description": t.description,
        "deadline": t.get_deadline().isoformat(),
        "duration": t.get_duration(),
        "emergency": t.is_emergency(),
        "score_weight": t.get_score_weight(),
        "status": t.get_status()
    })


# เอาไว้แก้task 
@task_bp.route("/<int:task_id>", methods=["PUT"])
def update(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()

    task = get_task_by_id(task_id) # ค้นหา task ที่ต้องการแก้ไข

    if not task:
        return jsonify({"error": "Task not found"}), 404

    update_task(task, **data)  # ส่ง task และข้อมูลใหม่ไปให้ service อัปเดต

    return jsonify({"message": "Task updated"})


# เปลี่ยนสถานะ task 
@task_bp.route("/<int:task_id>/status", methods=["PATCH"])
def update_status(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    task = toggle_task_status(task_id, user_id)  # ส่ง task_id และ user_id ไปให้ service เปลี่ยนสถานะ

    if not task:
        return jsonify({"error": "Task not found or forbidden"}), 404

    return jsonify({
        "message": "Status toggled",
        "status": task.get_status()
    })


# ลบ task ตาม id
@task_bp.route("/<int:task_id>", methods=["DELETE"])
def delete(task_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    # ส่ง task_id และ user_id ไปให้ service ลบ 
    task = delete_task(task_id, user_id)

    if not task:
        return jsonify({"error": "Task not found or forbidden"}), 404
    
    return jsonify({"message": "Task deleted"})