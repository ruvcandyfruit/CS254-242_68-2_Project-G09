from flask import Blueprint, request, jsonify, session
from app.services.course_service import (
    get_all_courses,
    get_course_by_id,
    create_course,
    update_course
)

course_bp = Blueprint('course', __name__)


@course_bp.route('', methods=['GET'])
def get_courses():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    courses = get_all_courses(user_id)
    return jsonify(courses)


@course_bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    course, error = get_course_by_id(course_id)
    if error:
        return jsonify({"error": error}), 404
    return jsonify(course)


@course_bp.route('', methods=['POST'])
def create():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json
    course = create_course(
        name=data.get('name'),
        course_code=data.get('course_code'),
        course_weight=data.get('course_weight'),
        user_id=user_id
    )
    return jsonify({"id": course.id, "message": "Course created"}), 201


@course_bp.route('/<int:course_id>', methods=['PUT'])
def update(course_id):
    data = request.json
    _, error = update_course(course_id, data)
    if error:
        return jsonify({"error": error}), 404
    return jsonify({"message": "Course updated"})
