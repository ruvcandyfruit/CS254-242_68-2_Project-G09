from app.models.task_model import Task
from app.models.course_model import Course
from datetime import datetime, timezone, timedelta

def get_notifications(user_id):
    today = datetime.now(timezone.utc).date()
    threshold = today + timedelta(days=3)

    tasks = (
        Task.query
        .join(Course, Task.course_id == Course.id)
        .filter(
            Course.user_id == user_id,
            Task.status != "done",
            Task.deadline <= datetime(threshold.year, threshold.month, threshold.day, 23, 59, 59)
        )
        .order_by(Task.deadline.asc())
        .all()
    )

    result = []
    for task in tasks:
        days_left = (task.deadline.date() - today).days
        result.append({
            "task_id": task.id,
            "title": task.title,
            "deadline": task.deadline.strftime("%Y-%m-%d"),
            "days_left": days_left,
            "emergency": task.emergency,
            "status": task.status,
        })

    return result