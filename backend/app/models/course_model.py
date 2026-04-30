from app.models import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    _name = db.Column("name", db.String(255), nullable=False)
    _course_code = db.Column("course_code", db.String(20), nullable=False)
    _course_weight = db.Column("course_weight",db.Float, default=1.0)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    tasks = db.relationship('Task', backref='course', lazy=True, cascade='all, delete-orphan')

    # constructor
    def __init__(self, name, course_code, course_weight, user_id):
        self.set_name(name)
        self.set_course_code(course_code)
        self.set_course_weight(course_weight)
        self.user_id = user_id

    # getter
    def get_id(self):
        return self.id

    def get_name(self):   
        return self._name

    def get_course_code(self):
        return self._course_code

    def get_course_weight(self):
        return self._course_weight

    # setter /validation
    def set_name(self, name):
        if not name or not str(name).strip():
            raise ValueError("Name cannot be empty")
        self._name = str(name).strip()

    def set_course_code(self, code):
        if not code or not str(code).strip():
            raise ValueError("Course code required")
        self._course_code = str(code).strip()

    def set_course_weight(self, weight):
        try:
            weight = float(weight)
        except (ValueError, TypeError):
            raise ValueError("Weight must be a number")
        if weight <= 0:
            raise ValueError("Weight must be > 0")
        self._course_weight = weight
    
    # behavior
    def get_task_count(self):
        return len(self.tasks)

    def get_completed_tasks(self):
        return [t for t in self.tasks if t.get_status() == "done"]

    # business logic
    def calculate_progress(self):
        total = len(self.tasks)
        if total == 0:
            return "0%"
        completed = len(self.get_completed_tasks())
        percentage = int((completed / total) * 100)
        return f"{percentage}%"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self._name,
            "course_code": self._course_code,
            "course_weight": self._course_weight,
            "user_id": self.user_id,
            "progress": self.calculate_progress(),
            "pending_task_count": self.get_task_count() - len(self.get_completed_tasks())
        }
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        self.set_name(value)
