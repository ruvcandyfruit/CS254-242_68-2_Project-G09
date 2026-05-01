from app.models import db
from datetime import datetime

class Task(db.Model):
    __tablename__ = 'tasks'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    deadline = db.Column(db.DateTime, nullable=True)
    duration = db.Column(db.Integer)
    emergency = db.Column(db.Boolean, default=False)
    score_weight = db.Column(db.Integer, default=0)
    status = db.Column(db.String, default="pending")

    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)