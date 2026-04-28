from app.models import db
from app.models.task_model import Task
from app.models.course_model import Course
from datetime import datetime

def create_task(title, deadline, score_weight, course_id,
                description=None, duration=None, emergency=False):
    
    # convert ตัว deadline 
    deadline = datetime.fromisoformat(deadline)

    task = Task(
        title=title,
        deadline=deadline,
        score_weight=score_weight,
        course_id=course_id,
        description=description,
        duration=duration,
        emergency=emergency
    )

    db.session.add(task)
    db.session.commit()

    return task


def get_all_tasks_by_user(user_id):
    return Task.query.join(Course).filter(Course.user_id == user_id).all()


def get_task_by_id(task_id):
    return Task.query.get(task_id)


def update_task(task, **kwargs):
    if "title" in kwargs:
        task.set_title(kwargs["title"])

    if "deadline" in kwargs:
        task.set_deadline(kwargs["deadline"])

    if "duration" in kwargs:
        task.set_duration(kwargs["duration"])

    if "score_weight" in kwargs:
        task.set_score_weight(kwargs["score_weight"])

    db.session.commit()
    return task


def toggle_task_status(task_id, user_id):
    task = db.session.get(Task, task_id)

    if not task:
        return None

    # check ownership
    if task.course.user_id != user_id:
        return None

    task.toggle_status()
    db.session.commit()

    return task