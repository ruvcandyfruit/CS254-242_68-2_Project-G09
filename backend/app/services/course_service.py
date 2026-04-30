from app.models import db
from app.models.course_model import Course


class CourseService:
    def __init__(self, course_model=Course, database=db):
        self.set_course_model(course_model)
        self.set_database(database)

    # getter / setter
    def get_course_model(self):
        return self._course_model

    def set_course_model(self, course_model):
        if course_model is None:
            raise ValueError("Course model cannot be None")
        self._course_model = course_model

    def get_database(self):
        return self._database

    def set_database(self, database):
        if database is None:
            raise ValueError("Database cannot be None")
        self._database = database

    # business logic
    def get_all_courses(self, user_id):
        # ดึง course ทั้งหมดของ user คนนี้
        courses = self._course_model.query.filter_by(user_id=user_id).all()
        return [c.to_dict() for c in courses]

    def get_course_by_id(self, course_id, user_id):
        course = self._database.session.get(self._course_model, course_id)
        if not course:
            return None, 404
        
        if course.user_id != user_id:
            return None, 403
        
        return course.to_dict(), None

    def create_course(self, name, course_code, course_weight, user_id):
        # สร้าง course ใหม่แล้วบันทึกลง database
        try:
            course = self._course_model(name, course_code, course_weight, user_id)
            self._database.session.add(course)
            self._database.session.commit()
            return course, None
        
        except (ValueError, TypeError):
            return None, 400

    def update_course(self, course_id, data, user_id):
        # อัปเดตข้อมูล course ตาม field ที่ส่งมาใน data
        # ดึง course ที่ต้องการแก้ไข
        course = self._database.session.get(self._course_model, course_id)
        if not course:
            return None, 404
        if course.user_id != user_id:
            return None, 403

        try:
            if "name" in data:
                course.set_name(data["name"])
            if "course_code" in data:
                course.set_course_code(data["course_code"])
            if "course_weight" in data:
                course.set_course_weight(data["course_weight"])
            self._database.session.commit()
            return course, None
        except (ValueError, TypeError):
            self._database.session.rollback()
            return None, 400

    def delete_course(self, course_id, user_id):
        # ลบ course ออกจาก database 
        course = self._database.session.get(self._course_model, course_id)
        if not course:
            return 404
        if course.user_id != user_id:
            return 403

        try:
            self._database.session.delete(course)
            self._database.session.commit()
            return None
        except Exception:
            self._database.session.rollback()
            return 500

course_service = CourseService()
