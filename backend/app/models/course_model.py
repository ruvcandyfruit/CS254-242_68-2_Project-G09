from app.models import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    course_code = db.Column(db.String(20), nullable=False)
    course_weight = db.Column(db.Float, default=1.0)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    tasks = db.relationship('Task', backref='course', lazy=True)