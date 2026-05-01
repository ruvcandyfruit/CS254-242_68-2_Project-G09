from app.models import db
from app.models.course_model import Course


def get_courses_by_user(user_id):
    return Course.query.filter_by(user_id=user_id).all()


def create_course(user_id, data):
    course = Course(
        name=data.get('name', '').strip(),
        course_code=(data.get('course_code') or '').strip(),
        course_weight=int(data.get('course_weight') or 3),
        user_id=user_id,
    )
    db.session.add(course)
    db.session.commit()
    return course


def delete_course(course_id, user_id):
    course = Course.query.get(course_id)
    if not course:
        return False, 'not_found'
    if course.user_id != user_id:
        return False, 'forbidden'
    db.session.delete(course)
    db.session.commit()
    return True, None
