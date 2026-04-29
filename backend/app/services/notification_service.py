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
        "message": f"You have {count} task(s) due in the next 3 days",
        "tasks": task_list,
        "type": "DUE_SOON_3D"
    }