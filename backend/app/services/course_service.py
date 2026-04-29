from app.models import db
from app.models.course_model import Course


def get_all_courses(user_id):
    courses = Course.query.filter_by(user_id=user_id).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "course_code": c.course_code,
            "course_weight": c.course_weight
        }
        for c in courses
    ]


def get_course_by_id(course_id):
    course = Course.query.get(course_id)
    if not course:
        return None, "Course not found"
    return {
        "id": course.id,
        "name": course.name,
        "course_code": course.course_code,
        "course_weight": course.course_weight
    }, None


def create_course(name, course_code, course_weight, user_id):
    course = Course(
        name=name,
        course_code=course_code,
        course_weight=course_weight,
        user_id=user_id
    )
    db.session.add(course)
    db.session.commit()
    return course


def update_course(course_id, data):
    course = Course.query.get(course_id)
    if not course:
        return None, "Course not found"

    if "name" in data:
        course.name = data["name"]
    if "course_code" in data:
        course.course_code = data["course_code"]
    if "course_weight" in data:
        course.course_weight = data["course_weight"]

    db.session.commit()
    return course, None
