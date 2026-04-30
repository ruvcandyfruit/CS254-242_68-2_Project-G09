import pandas as pd

class WorkloadAnalyzer:
    def __init__(self, tasks):
        self.set_tasks(tasks)

    # getter/setter
    def get_tasks(self):
        return self._tasks

    def set_tasks(self, tasks):
        if not isinstance(tasks, list):
            raise ValueError("Tasks must be a list")
        self._tasks = tasks

    # helper
    def _to_dataframe(self):
        data = []

        for t in self._tasks:
            if t.get_duration() is None:
                continue

            deadline = t.get_deadline()

            if deadline is None:
                continue

            data.append({
                "deadline": pd.to_datetime(deadline),
                "duration": t.get_duration()
            })

        return pd.DataFrame(data)
    
    # reduce duplicate operation
    def _group(self, df, col, label_prefix):
        # รวมจำนวนชั่วโมง
        grouped_duration = df.groupby(col)["duration"].sum()
        # รวมจำนวนงาน
        grouped_count = df.groupby(col).size()

        data = [
            {
                "label": f"{label_prefix} {int(k)}",
                "total_duration": float(grouped_duration[k]),
                "task_count": int(grouped_count[k])
            }
            for k in grouped_duration.index
        ]

        return grouped_duration, grouped_count, data
    
    # summary for response
    def _summary(self, grouped, prefix):
        if grouped.empty:
            return {}

        return {
            "total_hours": float(grouped.sum()),
            "busiest_period": f"{prefix} {int(grouped.idxmax())}",
            "max_hours": float(grouped.max())
        }
    
    # for empty response
    def _empty_response(self, mode):
        return {
            "mode": mode,
            "units": "hours",
            "data": [],
            "summary": {}
        }

    # logic
    def analyze_weekly(self):
        df = self._to_dataframe()

        if df.empty:
            return self._empty_response("weekly")

        df["week"] = df["deadline"].dt.isocalendar().week

        grouped_duration, grouped_count, data = self._group(df,"week","Week")

        return {
            "mode": "weekly",
            "units": "hours",
            "data": data,
            "summary": self._summary(grouped_duration, "Week")
        }

    def analyze_monthly(self):
        df = self._to_dataframe()

        if df.empty:
            return self._empty_response("monthly")

        df["month"] = df["deadline"].dt.month

        grouped_duration, grouped_count, data = self._group(df,"month","Month")

        return {
            "mode": "monthly",
            "units": "hours",
            "data": data,
            "summary": self._summary(grouped_duration, "Month")
        }