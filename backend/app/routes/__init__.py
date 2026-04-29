from .main import main_bp
from .auth_route import auth_bp
# from .course_route import course_bp
# from .task_route import task_bp
# from .workload_route import workload_bp
from .notification_route import notification_bp

def register_blueprints(app):
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    # app.register_blueprint(course_bp, url_prefix="/api/course")
    # app.register_blueprint(task_bp, url_prefix="/api/task")
    # app.register_blueprint(workload_bp, url_prefix="/api/workload")
    app.register_blueprint(notification_bp, url_prefix="/api/notification")