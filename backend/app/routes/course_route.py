from flask import Blueprint, request, jsonify, session
from app.services.course_service import (
    get_all_courses,
    get_course_by_id,
    create_course,
    update_course,
    delete_course
)

course_bp = Blueprint('course', __name__)


@course_bp.route('', methods=['GET'])
def get_courses():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    courses = get_all_courses(user_id)
    return jsonify(courses), 200


@course_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course, error = get_course_by_id(course_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(course), 200


@course_bp.route('', methods=['POST'])
def create():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    course, error = create_course(
        name=data.get('name'),
        course_code=data.get('course_code'),
        course_weight=data.get('course_weight'),
        user_id=user_id
    )
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"id": course.id, "message": "Course created"}), 201


@course_bp.route('/<int:course_id>', methods=['PUT'])
def update(course_id):
    data = request.json
    course, error = update_course(course_id, data)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "Course updated"}),200


@course_bp.route('/<int:course_id>', methods=['DELETE'])
def delete(course_id):
    error = delete_course(course_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify({"message": "Course deleted"}), 200
