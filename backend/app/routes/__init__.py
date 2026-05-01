from .main import main_bp
from .auth_route import auth_bp
from .course_route import course_bp
from .task_route import task_bp

def register_blueprints(app):
    # API routes ก่อน, catch-all frontend route หลังสุด
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(course_bp, url_prefix="/api/course")
    app.register_blueprint(task_bp, url_prefix="/api/task")
    app.register_blueprint(main_bp)
