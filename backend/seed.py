from app import create_app
from app.models import db
from app.models.user_model import User
from app.models.course_model import Course
from app.models.task_model import Task
from datetime import datetime

app = create_app()

with app.app_context():
    db.create_all()

    print("Start insert seed data...")

    # ---- USER ----
    user = User.query.filter_by(email="test@mail.com").first()
    if not user:
        user = User(username="Hamtaro", email="test@mail.com", password="1234")
        db.session.add(user)
        db.session.commit()

    # ---- COURSE ----
    course = Course.query.filter_by(name="Math", user_id=user.id).first()
    if not course:
        course = Course(name="Math", course_weight="3", user_id=user.id)
        db.session.add(course)
        db.session.commit()

    # ---- TASK ----
    task = Task.query.filter_by(
        title="Homework 1",
        course_id=course.id
    ).first()

    if not task:
        task = Task(
            title="Homework 1",
            deadline=datetime(2026, 4, 20),
            emergency=True,
            score_weight=10,
            course_id=course.id
        )
        db.session.add(task)
        db.session.commit()

    print("Insert success !")