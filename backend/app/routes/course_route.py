from flask import Blueprint, request, jsonify, session
from app.services.course_service import get_courses_by_user, create_course, delete_course

course_bp = Blueprint('course', __name__)
course_bp.strict_slashes = False


def _uid():
    return session.get('user_id')


@course_bp.route('/', methods=['GET'])
def list_courses():
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    courses = get_courses_by_user(uid)
    return jsonify([
        {'id': c.id, 'name': c.name, 'course_code': c.course_code, 'course_weight': c.course_weight}
        for c in courses
    ])


@course_bp.route('/', methods=['POST'])
def add_course():
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    if not data.get('name'):
        return jsonify({'error': 'name required'}), 400
    course = create_course(uid, data)
    return jsonify({
        'id': course.id,
        'name': course.name,
        'course_code': course.course_code,
        'course_weight': course.course_weight,
    }), 201


@course_bp.route('/<int:course_id>', methods=['DELETE'])
def remove_course(course_id):
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    ok, err = delete_course(course_id, uid)
    if not ok:
        status = 404 if err == 'not_found' else 403
        return jsonify({'error': err}), status
    return jsonify({'message': 'deleted'})
