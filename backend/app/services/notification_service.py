from app.models.task_model import Task
from app.models.course_model import Course
from datetime import datetime, timezone, timedelta

class NotificationService:
    def __init__(self, user_id):
        self._user_id = user_id
        self._threshold_days = 3

    def get_user_id(self):
        return self._user_id

    def get_threshold_days(self):
        return self._threshold_days

    def set_threshold_days(self, days):
        if days < 0:
            raise ValueError("Threshold days must be non-negative")
        self._threshold_days = days

    def get_notifications(self):
        today = datetime.now(timezone.utc).date()
        threshold = today + timedelta(days=self._threshold_days)

        tasks = (
            Task.query
            .join(Course, Task.course_id == Course.id)
            .filter(
                Course.user_id == self._user_id,
                Task.status != "done",
                Task.deadline <= datetime(threshold.year, threshold.month, threshold.day, 23, 59, 59)
            )
            .order_by(Task.deadline.asc())
            .all()
        )

        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "deadline": task.deadline.strftime("%Y-%m-%dT%H:%M:%S"),
            }
            for task in tasks
        ]

        count = len(task_list)
        return {
            "count": count,
            "message": f"You have {count} task(s) due in the next {self._threshold_days} days",
            "tasks": task_list,
            "type": "DUE_SOON_3D"
        }