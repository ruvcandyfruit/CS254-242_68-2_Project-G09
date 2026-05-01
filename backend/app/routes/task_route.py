from flask import Blueprint, request, jsonify, session
from app.services.task_service import (
    get_tasks_with_priority,
    create_task,
    update_task,
    delete_task,
    toggle_task_status,
)

task_bp = Blueprint('task', __name__)
task_bp.strict_slashes = False


def _uid():
    return session.get('user_id')


@task_bp.route('/prioritized', methods=['GET'])
def list_prioritized():
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    tasks = get_tasks_with_priority(uid)
    return jsonify(tasks)


@task_bp.route('/', methods=['POST'])
def add_task():
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    if not data.get('title'):
        return jsonify({'error': 'title required'}), 400
    task, err = create_task(uid, data)
    if err:
        return jsonify({'error': err}), 403
    return jsonify({'id': task.id, 'title': task.title}), 201


@task_bp.route('/<int:task_id>', methods=['GET'])
def get_task(task_id):
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    from app.models.task_model import Task
    from app.models.course_model import Course
    task = Task.query.get(task_id)
    if not task:
        return jsonify({'error': 'not_found'}), 404
    course = Course.query.get(task.course_id)
    if not course or course.user_id != uid:
        return jsonify({'error': 'forbidden'}), 403
    return jsonify({
        'id': task.id, 'title': task.title, 'description': task.description,
        'deadline': task.deadline.isoformat() if task.deadline else None,
        'duration': task.duration, 'emergency': task.emergency,
        'score_weight': task.score_weight, 'status': task.status,
    })


@task_bp.route('/<int:task_id>', methods=['PUT'])
def edit_task(task_id):
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json or {}
    task, err = update_task(task_id, uid, data)
    if err:
        status = 404 if err == 'not_found' else 403
        return jsonify({'error': err}), status
    return jsonify({'id': task.id, 'title': task.title})


@task_bp.route('/<int:task_id>', methods=['DELETE'])
def remove_task(task_id):
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    ok, err = delete_task(task_id, uid)
    if not ok:
        status = 404 if err == 'not_found' else 403
        return jsonify({'error': err}), status
    return jsonify({'message': 'deleted'})


@task_bp.route('/<int:task_id>/status', methods=['PATCH'])
def toggle_status(task_id):
    uid = _uid()
    if not uid:
        return jsonify({'error': 'Unauthorized'}), 401
    task, err = toggle_task_status(task_id, uid)
    if err:
        status = 404 if err == 'not_found' else 403
        return jsonify({'error': err}), status
    return jsonify({'id': task.id, 'status': task.status})
