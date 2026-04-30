from app.models import db
from app.models.task_model import Task
from app.models.course_model import Course
from datetime import datetime
from app.core.priority_engine import PriorityEngine


class TaskService:
    def __init__(self, task_model=Task, course_model=Course, database=db,
                 priority_engine_class=PriorityEngine):
        self.set_task_model(task_model)
        self.set_course_model(course_model)
        self.set_database(database)
        self.set_priority_engine_class(priority_engine_class)

    # getter / setter
    def get_task_model(self):
        return self._task_model

    def set_task_model(self, task_model):
        if task_model is None:
            raise ValueError("Task model cannot be None")
        self._task_model = task_model

    def get_course_model(self):
        return self._course_model

    def set_course_model(self, course_model):
        if course_model is None:
            raise ValueError("Course model cannot be None")
        self._course_model = course_model

    def get_database(self):
        return self._database

    def set_database(self, database):
        if database is None:
            raise ValueError("Database cannot be None")
        self._database = database

    def get_priority_engine_class(self):
        return self._priority_engine_class

    def set_priority_engine_class(self, priority_engine_class):
        if priority_engine_class is None:
            raise ValueError("Priority engine cannot be None")
        self._priority_engine_class = priority_engine_class

    # validation
    def _validate_user_id(self, user_id):
        if not user_id:
            raise ValueError("User id is required")

    def _validate_task_id(self, task_id):
        if not task_id:
            raise ValueError("Task id is required")

    # response formatting
    def _task_to_response(self, task):
        return {
            "id": task.id,
            "title": task.get_title(),
            "description": task.description,
            "deadline": task.get_deadline().isoformat(),
            "duration": task.get_duration(),
            "emergency": task.is_emergency(),
            "score_weight": task.get_score_weight(),
            "status": task.get_status()
        }

    def _prioritized_task_to_response(self, item):
        task = item["task"]

        return {
            **self._task_to_response(task),
            "course": {
                "id": task.course.id,
                "name": task.course.get_name(),
                "course_code": task.course.get_course_code()
            },
            "priority": {
                "score": round(item["score"], 2),
                "label": item["label"]
            }
        }

    # business logic
    def create_task(self, title, deadline, score_weight, course_id,
                    description=None, duration=None, emergency=False):
        # ถ้า deadline ที่รับมาเป็น string ให้แปลงเป็น datetime ก่อนบันทึกต๊ะ
        if isinstance(deadline, str):
            deadline = datetime.fromisoformat(deadline)

        # สร้าง task object ใหม่
        task = self._task_model(
            title=title,
            deadline=deadline,
            score_weight=score_weight,
            course_id=course_id,
            description=description,
            duration=duration,
            emergency=emergency
        )

        # เพิ่ม task เข้า database
        self._database.session.add(task)
        self._database.session.commit()

        return task

    def get_all_tasks_by_user(self, user_id):
        self._validate_user_id(user_id)

        return self._task_model.query.join(self._course_model).filter(
            self._course_model.user_id == user_id
        ).all()

    def get_all_tasks_response_by_user(self, user_id): # ดึง task object แล้วแปลงเป็น dict สำหรับ response
        tasks = self.get_all_tasks_by_user(user_id)
        return [self._task_to_response(task) for task in tasks]

    def get_prioritized_tasks(self, user_id):
        tasks = self.get_all_tasks_by_user(user_id)

        # จัดลำดับความสำคัญ
        engine = self._priority_engine_class(tasks)
        prioritized = engine.prioritize()

        return [
            self._prioritized_task_to_response(item)
            for item in prioritized
        ]

    def get_task_by_id(self, task_id):
        self._validate_task_id(task_id)
        return self._task_model.query.get(task_id)

    def update_task(self, task, **kwargs):
        if not task:
            raise ValueError("Task cannot be None")

        if "title" in kwargs:
            task.set_title(kwargs["title"])

        if "deadline" in kwargs:
            task.set_deadline(kwargs["deadline"])

        if "duration" in kwargs:
            task.set_duration(kwargs["duration"])

        if "score_weight" in kwargs:
            task.set_score_weight(kwargs["score_weight"])

        self._database.session.commit()
        return task

    def toggle_task_status(self, task_id, user_id):
        self._validate_task_id(task_id)
        self._validate_user_id(user_id)

        task = self._database.session.get(self._task_model, task_id)

        if not task:
            return None

        # เช็กว่า task นี้อยู่ใน course ของ user คนนี้จริงบ่
        if task.course.user_id != user_id:
            return None

        # เปลี่ยนสถานะ task
        task.toggle_status()
        self._database.session.commit()

        return task

    def delete_task(self, task_id, user_id):
        self._validate_task_id(task_id)
        self._validate_user_id(user_id)
        task = self._database.session.get(self._task_model, task_id)
        if not task:
            return None

        if task.course.user_id != user_id:
            return None

        # ลบ task ออกจาก database
        self._database.session.delete(task)
        self._database.session.commit()

        return task


_task_service = TaskService()


# API functions

def create_task(title, deadline, score_weight, course_id,
                description=None, duration=None, emergency=False):
    return _task_service.create_task(
        title=title,
        deadline=deadline,
        score_weight=score_weight,
        course_id=course_id,
        description=description,
        duration=duration,
        emergency=emergency
    )


def get_all_tasks_by_user(user_id):
    return _task_service.get_all_tasks_by_user(user_id)


def get_all_tasks_response_by_user(user_id):
    return _task_service.get_all_tasks_response_by_user(user_id)


def get_prioritized_tasks(user_id):
    return _task_service.get_prioritized_tasks(user_id)


def get_task_by_id(task_id):
    return _task_service.get_task_by_id(task_id)


def update_task(task, **kwargs):
    return _task_service.update_task(task, **kwargs)


def toggle_task_status(task_id, user_id):
    return _task_service.toggle_task_status(task_id, user_id)


def delete_task(task_id, user_id):
    return _task_service.delete_task(task_id, user_id)