class PriorityEngine:
    # constructor
    def __init__(self, tasks, weights=None):
        self.set_tasks(tasks)

        # prevent hardcode in constructor
        default_weights = {
            "urgency": 0.5,
            "emergency": 0.2,
            "course": 0.15,
            "task": 0.15
        }

        self.set_weights(weights or default_weights)

    # getter/setter
    def get_tasks(self):
        return self._tasks

    def set_tasks(self, tasks):
        if not isinstance(tasks, list):
            raise ValueError("Tasks must be a list")
        self._tasks = tasks

    def get_weights(self):
        return self._weights

    def set_weights(self, weights):
        required_keys = {"urgency", "emergency", "course", "task"}
        if not isinstance(weights, dict) or not required_keys.issubset(weights):
            raise ValueError("Invalid weights format")
        self._weights = weights

    # logic
    def calculate_score(self, task):
        # normalize factors
        days = task.get_days_remaining()
        urgency = 1 / (days + 1)

        emergency = 1 if task.is_emergency() else 0
        course_score = task.course.get_course_weight() / 3
        task_score = task.get_score_weight() / 100

        w = self._weights

        return (
            urgency * w["urgency"] +
            emergency * w["emergency"] +
            course_score * w["course"] +
            task_score * w["task"]
        )

    def get_label(self, score):
        if score >= 0.7:
            return "HIGH"
        elif score >= 0.4:
            return "MEDIUM"
        return "LOW"

    def prioritize(self):
        result = []

        for task in self._tasks:
            # not calculate priority for done task
            if task.is_completed():
                continue

            score = self.calculate_score(task)
            label = self.get_label(score)

            result.append({
                "task": task,
                "score": score,
                "label": label
            })

        return sorted(result, key=lambda x: x["score"], reverse=True) # descending sorting