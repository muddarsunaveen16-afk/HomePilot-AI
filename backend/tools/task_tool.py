tasks = [
    "Clean the study table",
    "Check kitchen supplies",
    "Organize workspace"
]


def get_tasks():
    return {
        "tasks": tasks,
        "count": len(tasks)
    }


def add_task(task: str):
    tasks.append(task)

    return {
        "message": f"Task added: {task}",
        "tasks": tasks
    }


def complete_task(task: str):
    if task in tasks:
        tasks.remove(task)
        return {
            "message": f"Task completed: {task}",
            "tasks": tasks
        }

    return {
        "message": "Task not found.",
        "tasks": tasks
    }