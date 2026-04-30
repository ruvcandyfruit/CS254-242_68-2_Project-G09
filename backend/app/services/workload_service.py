from app.models.task_model import Task
from app.models.course_model import Course
from app.core.workload_analyzer import WorkloadAnalyzer


class WorkloadService:
    # constructor
    def __init__(
        self,
        task_model=Task,
        course_model=Course,
        analyzer_class=WorkloadAnalyzer
    ):
        self.set_task_model(task_model)
        self.set_course_model(course_model)
        self.set_analyzer_class(analyzer_class)

    # getter
    def get_task_model(self):
        return self._task_model

    def get_course_model(self):
        return self._course_model

    def get_analyzer_class(self):
        return self._analyzer_class

    # setter
    def set_task_model(self, task_model):
        if task_model is None:
            raise ValueError("Task model cannot be None")

        self._task_model = task_model

    def set_course_model(self, course_model):
        if course_model is None:
            raise ValueError("Course model cannot be None")

        self._course_model = course_model

    def set_analyzer_class(self, analyzer_class):
        if analyzer_class is None:
            raise ValueError("Analyzer class cannot be None")

        self._analyzer_class = analyzer_class

    # business logic
    def get_workload_analysis(self, user_id, mode="weekly"):

        if mode not in ["weekly", "monthly"]:
            raise ValueError("Invalid mode")

        try:
            tasks = (
                self._task_model.query
                .join(self._course_model)
                .filter(self._course_model.user_id == user_id)
                .filter(self._task_model._duration != None)
                .filter(self._task_model._deadline != None)
                .all()
            )

        except Exception as e:
            raise RuntimeError(
                f"Database error: {str(e)}"
            ) from e

        analyzer = self._analyzer_class(tasks)

        return (
            analyzer.analyze_weekly()
            if mode == "weekly"
            else analyzer.analyze_monthly()
        )

workload_service = WorkloadService()