from app.models import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    _title = db.Column("title", db.String(255), nullable=False)
    _description = db.Column("description", db.Text)
    _deadline = db.Column("deadline", db.DateTime, nullable=False)
    _duration = db.Column("duration", db.Integer)
    _emergency = db.Column("emergency", db.Boolean, default=False)
    _score_weight = db.Column("score_weight", db.Integer, nullable=False)
    _status = db.Column("status", db.String, default="pending")

    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)

    # constructor
    def __init__(self, title, deadline, score_weight, course_id,
                 description=None, duration=None, emergency=False):
        self.set_title(title)
        self.set_deadline(deadline)
        self.set_score_weight(score_weight)
        self.set_duration(duration)
        self._emergency = emergency
        self._status = "pending"
        self.set_description(description)
        self.course_id = course_id

    # getter / setter
    def get_title(self):
        return self._title

    def set_title(self, title):
        if not title or len(title.strip()) == 0:
            raise ValueError("Title cannot be empty")
        self._title = title

    def get_description(self):
        return self._description
    
    def set_description(self, description):
        # ถ้าเป็น string ว่าง → เก็บเป็น None แทน
        if description == "":
            self._description = None
        else:
            self._description = description

    def get_deadline(self):
        return self._deadline

    def set_deadline(self, deadline):
        # ถ้าเป็น string
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline)

        if deadline < datetime.utcnow():
            raise ValueError("Deadline cannot be in the past")

        self._deadline = deadline

    def get_duration(self):
        return self._duration

    def set_duration(self, duration):
        if duration is not None and duration < 0:
            raise ValueError("Duration must be positive")
        self._duration = duration

    def get_score_weight(self):
        return self._score_weight

    def set_score_weight(self, weight):
        if not (1 <= weight <= 100):
            raise ValueError("Score weight must be between 1 and 100")
        self._score_weight = weight

    def get_status(self):
        return self._status

    # state control 
    def toggle_status(self):
        if self._status == "pending":
            self._status = "done"
        elif self._status == "done":
            self._status = "pending"
        else:
            raise ValueError("Invalid status")

    
    # behavior
    def is_completed(self):
        return self._status == "done"
    
    def is_overdue(self):
        return self._deadline < datetime.utcnow()

    def get_days_remaining(self):
        delta = self._deadline - datetime.utcnow()
        return max(delta.days, 0)

    def is_emergency(self):
        return self._emergency