from app.models import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    course_code = db.Column(db.String(20))
    course_weight = db.Column(db.Integer, nullable=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    tasks = db.relationship('Task', backref='course', lazy=True)