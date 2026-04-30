from flask import Blueprint, request, jsonify, session
from app.services.course_service import course_service

course_bp = Blueprint('course', __name__)


@course_bp.route('', methods=['GET'])
def get_courses():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    courses = course_service.get_all_courses(user_id)
    return jsonify(courses), 200


@course_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    course, error = course_service.get_course_by_id(course_id, user_id)
    if error:
        return jsonify({"error": error}), error
    return jsonify(course), 200


@course_bp.route('', methods=['POST'])
def create():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    course, error = course_service.create_course(
        user_id=user_id,
        name=data.get('name'),
        course_code=data.get('course_code'),
        course_weight=data.get('course_weight'),
    )
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"id": course.id, "message": "Course created"}), 201


@course_bp.route('/<int:course_id>', methods=['PUT'])
def update(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    course, error = course_service.update_course(course_id, data, user_id)
    if error:
        return jsonify({"error": error}), error
    return jsonify({"message": "Course updated"}), 200


@course_bp.route('/<int:course_id>', methods=['DELETE'])
def delete(course_id):
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    error = course_service.delete_course(course_id, user_id)
    if error:
        return jsonify({"error": error}), error
    return jsonify({"message": "Course deleted"}), 200
