# Workload Service
# Responsible for workload-related operations.

# Uses:
# - WorkloadAnalyzer → analyze tasks
# - PriorityEngine → calculate priority

# This service combines multiple OOP classes
# to produce final response.
from app.models.task_model import Task
from app.models.course_model import Course
from app.core.workload_analyzer import WorkloadAnalyzer


def get_workload_analysis(user_id, mode="weekly"):
    
    if mode not in ["weekly", "monthly"]:
        raise ValueError("Invalid mode")

    try:
        tasks = (
            Task.query
            .join(Course)
            .filter(Course.user_id == user_id)
            .filter(Task.duration.isnot(None))
            .filter(Task.deadline.isnot(None))
            .all()
        )
    except Exception as e:
        raise RuntimeError(f"Database error: {str(e)}") from e

    analyzer = WorkloadAnalyzer(tasks)

    return (
        analyzer.analyze_weekly()
        if mode == "weekly"
        else analyzer.analyze_monthly()
    )