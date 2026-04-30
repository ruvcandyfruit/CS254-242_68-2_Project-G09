from app.models.task_model import Task
from app.models.course_model import Course
from datetime import datetime, timezone, timedelta

class NotificationService:
    # Constructor
    def __init__(self, user_id, threshold_hours=24):
        self._user_id = user_id
        self._threshold_days = threshold_hours

    # getter/setter
    def get_user_id(self):
        return self._user_id

    def get_threshold_days(self):
        return self._threshold_days
    
    def set_user_id(self, user_id):
        if not isinstance(user_id, int):
            raise ValueError("user_id must be an integer")
        if user_id <= 0:
            raise ValueError("user_id must be positive")
        self._user_id = user_id

    def set_threshold_hours(self, hours):
        if hours < 0:
            raise ValueError("Threshold hours must be non-negative")
        self._threshold_hours = hours

    # serialize for response
    def serialize(self, task):
        return {
            "id": task.id,
            "title": task._title,
            "description": task._description,
            "deadline": task._deadline.strftime("%Y-%m-%dT%H:%M:%S"),
            "duration": task._duration,
            "emergency": task._emergency,
            "score_weight": task._score_weight,
            "course_id": task.course_id,
        }

    def get_notifications(self):
        now = datetime.now(timezone.utc)
        threshold = now + timedelta(hours=self.get_threshold_days())

        # query not done + overdue tasks
        overdue_tasks = (
            Task.query
            .join(Course, Task.course_id == Course.id)
            .filter(
                Course.user_id == self._user_id,
                Task._status != "done",
                Task._deadline < now   
            )
            .order_by(Task._deadline.asc())
            .all()
        )

        # query not done + day remaining < 24 hr tasks
        due_soon_tasks = (
            Task.query
            .join(Course, Task.course_id == Course.id)
            .filter(
                Course.user_id == self._user_id,
                Task._status != "done",
                Task._deadline >= now,
                Task._deadline <= threshold
            )
            .order_by(Task._deadline.asc())
            .all()
        )

        overdue_list = [self.serialize(t) for t in overdue_tasks]
        due_soon_list = [self.serialize(t) for t in due_soon_tasks]

        overdue_count = len(overdue_list)
        due_soon_count = len(due_soon_list)

        return {
            "overdue_count": overdue_count,
            "due_soon_count": due_soon_count,
            "overdue_tasks": overdue_list,
            "due_soon_tasks": due_soon_list
        }