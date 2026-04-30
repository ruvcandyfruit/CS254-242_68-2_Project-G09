from app.models import db
from app.models.course_model import Course


class CourseService:
    def get_all_courses(self, user_id):
        courses = Course.query.filter_by(user_id=user_id).all()
        return [c.to_dict() for c in courses]

    def get_course_by_id(self, course_id, user_id):
        course = db.session.get(Course, course_id)
        if not course:
            return None, "Course not found"
        if course.user_id != user_id:
            return None, "Forbidden"
        return course.to_dict(), None

    def create_course(self, name, course_code, course_weight, user_id):
        try:
            course = Course(name, course_code, course_weight, user_id)
            db.session.add(course)
            db.session.commit()
            return course, None
        except (ValueError, TypeError) as e:
            return None, str(e)

    def update_course(self, course_id, data, user_id):
        course = db.session.get(Course, course_id)
        if not course:
            return None, "Course not found"
        if course.user_id != user_id:
            return None, "Forbidden"

        try:
            if "name" in data:
                course.set_name(data["name"])
            if "course_code" in data:
                course.set_course_code(data["course_code"])
            if "course_weight" in data:
                course.set_course_weight(data["course_weight"])
            db.session.commit()
            return course, None
        except (ValueError, TypeError) as e:
            db.session.rollback()
            return None, str(e)

    def delete_course(self, course_id, user_id):
        course = db.session.get(Course, course_id)
        if not course:
            return "Course not found"
        if course.user_id != user_id:
            return "Forbidden"

        try:
            db.session.delete(course)
            db.session.commit()
            return None
        except Exception as e:
            db.session.rollback()
            return str(e)


course_service = CourseService()
