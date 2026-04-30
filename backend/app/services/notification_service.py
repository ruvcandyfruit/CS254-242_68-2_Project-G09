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

    def serialize(self, task):
        return {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "deadline": task.deadline.strftime("%Y-%m-%dT%H:%M:%S"),
            "duration": task.duration,
            "emergency": task.emergency,
            "score_weight": task.score_weight,
            "course_id": task.course_id,
        }

    def get_notifications(self):
        now = datetime.now(timezone.utc)
        threshold = now + timedelta(hours=24)

        overdue_tasks = (
            Task.query
            .join(Course, Task.course_id == Course.id)
            .filter(
                Course.user_id == self._user_id,
                Task.status != "done",
                Task.deadline < now   
            )
            .order_by(Task.deadline.asc())
            .all()
        )

        due_soon_tasks = (
            Task.query
            .join(Course, Task.course_id == Course.id)
            .filter(
                Course.user_id == self._user_id,
                Task.status != "done",
                Task.deadline >= now,
                Task.deadline <= threshold
            )
            .order_by(Task.deadline.asc())
            .all()
        )

        overdue_list = [self.serialize(t) for t in overdue_tasks]
        due_soon_list = [self.serialize(t) for t in due_soon_tasks]

        overdue_count = len(overdue_list)
        due_soon_count = len(due_soon_list)

        messages = []

        if overdue_count > 0:
            messages.append(f"{overdue_count} overdue task(s)")

        if due_soon_count > 0:
            messages.append(f"{due_soon_count} task(s) due within 24 hours")

        if not messages:
            message = "No upcoming or overdue tasks"
        else:
            message = "You have " + " and ".join(messages)

        return {
            "overdue_count": overdue_count,
            "due_soon_count": due_soon_count,
            "message": message,
            "overdue_tasks": overdue_list,
            "due_soon_tasks": due_soon_list,
            "type": "TASK_ALERT"
        }