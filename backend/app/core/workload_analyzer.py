import pandas as pd


class WorkloadAnalyzer:
    def __init__(self, tasks):
        self.set_tasks(tasks)

    # ===== getter/setter =====
    def get_tasks(self):
        return self._tasks

    def set_tasks(self, tasks):
        if not isinstance(tasks, list):
            raise ValueError("Tasks must be a list")
        self._tasks = tasks

    # ===== helper =====
    def _to_dataframe(self):
        data = []

        for t in self._tasks:
            if t.duration is None:
                continue

            deadline = t.deadline

            if deadline is None:
                continue

            data.append({
                "deadline": pd.to_datetime(deadline),
                "duration": float(t.duration)
            })

        return pd.DataFrame(data)

    # ===== business logic =====
    def analyze_weekly(self):
        df = self._to_dataframe()

        if df.empty:
            return {
                "mode": "weekly",
                "units": "hours",
                "data": [],
                "summary": {}
            }

        df["week"] = df["deadline"].dt.isocalendar().week
        grouped = df.groupby("week")["duration"].sum()

        data = [
            {
                "label": f"Week {int(k)}",
                "total_duration": float(v)
            }
            for k, v in grouped.items()
        ]

        total_hours = float(grouped.sum())
        max_week = grouped.idxmax()
        max_hours = float(grouped.max())

        return {
            "mode": "weekly",
            "units": "hours",
            "data": data,
            "summary": {
                "total_hours": total_hours,
                "busiest_period": f"Week {int(max_week)}",
                "max_hours": max_hours
            }
        }

    def analyze_monthly(self):
        df = self._to_dataframe()

        if df.empty:
            return {
                "mode": "monthly",
                "units": "hours",
                "data": [],
                "summary": {}
            }

        df["month"] = df["deadline"].dt.month
        grouped = df.groupby("month")["duration"].sum()

        data = [
            {
                "label": f"Month {int(k)}",
                "total_duration": float(v)
            }
            for k, v in grouped.items()
        ]

        total_hours = float(grouped.sum())
        max_month = grouped.idxmax()
        max_hours = float(grouped.max())

        return {
            "mode": "monthly",
            "units": "hours",
            "data": data,
            "summary": {
                "total_hours": total_hours,
                "busiest_period": f"Month {int(max_month)}",
                "max_hours": max_hours
            }
        }