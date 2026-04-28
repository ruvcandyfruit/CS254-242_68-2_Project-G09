class TaskManager:
    def __init__(self, tasks=None):
        self._tasks = tasks or []

    # ===== getter/setter =====
    def get_tasks(self):
        return self._tasks

    def set_tasks(self, tasks):
        if not isinstance(tasks, list):
            raise ValueError("Tasks must be a list")
        self._tasks = tasks

    # ===== business logic =====
    def add_task(self, task):
        self._tasks.append(task)

    def remove_task(self, task_id):
        self._tasks = [t for t in self._tasks if t.id != task_id]

    def get_completed_tasks(self):
        return [t for t in self._tasks if t.is_completed()]

    def get_pending_tasks(self):
        return [t for t in self._tasks if not t.is_completed()]

    def get_overdue_tasks(self):
        return [t for t in self._tasks if t.is_overdue()]