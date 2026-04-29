from app.models import db
from app.models.course_model import Course


def get_all_courses(user_id):
    courses = Course.query.filter_by(user_id=user_id).all()
    return [c.to_dict() for c in courses]


def get_course_by_id(course_id):
    course = Course.query.get(course_id)
    if not course:
        return None, "Course not found"
    return course.to_dict(), None

def create_course(name, course_code, course_weight, user_id):
    try:
        course = Course(name, course_code, course_weight, user_id)
        db.session.add(course)
        db.session.commit()
        return course, None
    except ValueError as e:
        return None, str(e)


def update_course(course_id, data):
    course = Course.query.get(course_id)
    if not course:
        return None, "Course not found"

    try:
        if "name" in data:
            course.set_name(data["name"])

        if "course_code" in data:
            course.set_course_code(data["course_code"])

        if "course_weight" in data:
            course.set_course_weight(data["course_weight"])

        db.session.commit()
        return course, None

    except ValueError as e:
        return None, str(e)
