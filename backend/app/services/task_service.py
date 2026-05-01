from datetime import datetime
from app.models import db
from app.models.task_model import Task
from app.models.course_model import Course
from app.core.priority_engine import PriorityEngine


def _parse_deadline(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return datetime.strptime(value, '%Y-%m-%d')


def _task_to_dict(task, course, priority_label='LOW', priority_score=0):
    return {
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'deadline': task.deadline.isoformat() if task.deadline else None,
        'duration': task.duration,
        'emergency': task.emergency,
        'score_weight': task.score_weight,
        'status': task.status,
        'course': {
            'id': course.id if course else None,
            'name': course.name if course else None,
            'course_code': course.course_code if course else None,
        },
        'priority': {
            'score': priority_score,
            'label': priority_label,
        },
    }


def get_tasks_with_priority(user_id):
    courses = Course.query.filter_by(user_id=user_id).all()
    course_map = {c.id: c for c in courses}
    course_ids = list(course_map.keys())

    if not course_ids:
        return []

    tasks = Task.query.filter(Task.course_id.in_(course_ids)).all()
    engine = PriorityEngine(tasks)
    prioritized = engine.get_prioritized()

    return [
        _task_to_dict(task, course_map.get(task.course_id), label, score)
        for task, score, label in prioritized
    ]


def create_task(user_id, data):
    course_id = data.get('course_id')
    course = Course.query.get(course_id)
    if not course or course.user_id != user_id:
        return None, 'forbidden'

    task = Task(
        title=data.get('title', '').strip(),
        description=data.get('description') or '',
        deadline=_parse_deadline(data.get('deadline')),
        duration=data.get('duration'),
        emergency=bool(data.get('emergency', False)),
        score_weight=int(data.get('score_weight') or 0),
        course_id=course_id,
    )
    db.session.add(task)
    db.session.commit()
    return task, None


def update_task(task_id, user_id, data):
    task = Task.query.get(task_id)
    if not task:
        return None, 'not_found'
    course = Course.query.get(task.course_id)
    if not course or course.user_id != user_id:
        return None, 'forbidden'

    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'deadline' in data:
        task.deadline = _parse_deadline(data['deadline'])
    if 'duration' in data:
        task.duration = data['duration']
    if 'emergency' in data:
        task.emergency = bool(data['emergency'])
    if 'score_weight' in data:
        task.score_weight = int(data['score_weight'] or 0)

    db.session.commit()
    return task, None


def delete_task(task_id, user_id):
    task = Task.query.get(task_id)
    if not task:
        return False, 'not_found'
    course = Course.query.get(task.course_id)
    if not course or course.user_id != user_id:
        return False, 'forbidden'
    db.session.delete(task)
    db.session.commit()
    return True, None


def toggle_task_status(task_id, user_id):
    task = Task.query.get(task_id)
    if not task:
        return None, 'not_found'
    course = Course.query.get(task.course_id)
    if not course or course.user_id != user_id:
        return None, 'forbidden'
    task.status = 'done' if task.status != 'done' else 'pending'
    db.session.commit()
    return task, None
