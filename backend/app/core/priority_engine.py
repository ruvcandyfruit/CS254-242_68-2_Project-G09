from datetime import datetime, timezone


class PriorityEngine:
    _emergency_weight = 40

    def __init__(self, tasks):
        self._tasks = tasks

    def calculate_score(self, task):
        score = 0
        if task.emergency:
            score += self._emergency_weight

        if task.deadline:
            now = datetime.now(timezone.utc)
            deadline = task.deadline
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
            days_left = (deadline - now).days
            if days_left <= 1:
                score += 50
            elif days_left <= 3:
                score += 35
            elif days_left <= 7:
                score += 20
            elif days_left <= 14:
                score += 10

        score += min(task.score_weight, 10)
        return score

    def assign_label(self, score):
        if score >= 70:
            return 'HIGH'
        elif score >= 40:
            return 'MEDIUM'
        return 'LOW'

    def get_prioritized(self):
        result = []
        for task in self._tasks:
            score = self.calculate_score(task)
            label = self.assign_label(score)
            result.append((task, score, label))
        result.sort(key=lambda x: x[1], reverse=True)
        return result
