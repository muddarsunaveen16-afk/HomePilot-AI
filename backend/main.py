from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.tools.home_tool import leaving_home, arriving_home, bedtime
from backend.tools.task_tool import get_tasks, add_task, complete_task
from backend.tools.shopping_tool import get_shopping_list, add_item, remove_item
from backend.tools.energy_tool import analyze_energy
from backend.tools.personal_work_tool import (
    add_personal_work,
    get_personal_work,
    complete_personal_work,
)

# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="HomePilot AI",
    version="1.1.0",
    description="AI-powered intelligent home and personal assistant",
)

# Local development CORS configuration.
# For production, replace "*" with your deployed frontend URL.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# DATA MODELS
# ============================================================

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str
    tool_used: str


class PersonalWorkCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=250)
    deadline: str | None = None
    priority: str = "Medium"


class PersonalWorkComplete(BaseModel):
    task_id: int


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def result_count(result: dict) -> int:
    """Safely obtain the number of tasks or shopping items."""
    if "count" in result:
        return int(result["count"])

    items = result.get("tasks", result.get("items", []))
    return len(items)


def format_task_list(result: dict) -> str:
    """Convert the household task list into readable text."""
    tasks = result.get("tasks", [])

    if not tasks:
        return "You don't have any pending tasks."

    task_text = ", ".join(str(task) for task in tasks)

    return (
        f"You currently have {result_count(result)} "
        f"pending tasks: {task_text}."
    )


def format_shopping_list(result: dict) -> str:
    """Convert the shopping list into readable text."""
    items = result.get("items", [])

    if not items:
        return "Your shopping list is currently empty."

    item_text = ", ".join(str(item) for item in items)

    return (
        f"Your shopping list contains {result_count(result)} "
        f"items: {item_text}."
    )


# ============================================================
# HOME PILOT AI AGENT
# ============================================================

def process_message(message: str) -> tuple[str, str]:
    """Identify the user's intent and call the appropriate tool."""

    text = " ".join(message.lower().strip().split())

    if not text:
        return (
            "Please type a message so I can help.",
            "homepilot_agent",
        )

    # --------------------------------------------------------
    # PREPARE HOME BEFORE LEAVING
    # --------------------------------------------------------

    leaving_intent = any(phrase in text for phrase in (
        "leaving home",
        "leave home",
        "heading out",
        "going out",
        "leaving now",
        "going outside",
        "i'm leaving",
        "im leaving",
        "i am leaving",
        "i am heading out",
    ))

    preparation_intent = any(phrase in text for phrase in (
        "prepare",
        "get everything ready",
        "prepare my home",
        "make everything ready",
        "everything ready",
        "ready before i leave",
    ))

    if leaving_intent and preparation_intent:
        leaving_home()

        task_result = get_tasks()
        shopping_result = get_shopping_list()
        energy_result = analyze_energy()

        return (
            "I've started your Leaving Home routine. "
            f"You have {result_count(task_result)} pending household tasks, "
            f"{result_count(shopping_result)} shopping items, and your "
            f"energy usage is {energy_result.get('status', 'unknown')}. "
            f"Peak usage is "
            f"{energy_result.get('peak_period', 'not available')}.",
            "homepilot_multi_agent",
        )

    # --------------------------------------------------------
    # LEAVING HOME
    # --------------------------------------------------------

    if leaving_intent:
        leaving_home()

        return (
            "I've prepared your Leaving Home routine. "
            "Check that unnecessary lights and appliances are turned off "
            "and that doors and windows are secured before you leave.",
            "home_routine",
        )

    # --------------------------------------------------------
    # ARRIVING HOME
    # --------------------------------------------------------

    arriving_keywords = (
        "arriving home",
        "arrive home",
        "coming home",
        "i'm home",
        "im home",
        "i am home",
        "just got home",
        "back home",
    )

    if any(phrase in text for phrase in arriving_keywords):
        arriving_home()

        return (
            "Welcome home! Your arrival routine has been started. "
            "You can review your home status, pending tasks, "
            "and shopping needs.",
            "home_routine",
        )

    # --------------------------------------------------------
    # BEDTIME ROUTINE
    # --------------------------------------------------------

    bedtime_keywords = (
        "bedtime",
        "going to bed",
        "go to sleep",
        "going to sleep",
        "sleep now",
        "time to sleep",
        "good night",
        "prepare my bedtime",
        "bedtime routine",
    )

    if any(phrase in text for phrase in bedtime_keywords):
        bedtime()

        return (
            "Your bedtime routine has been started. "
            "Review doors and windows, turn off unnecessary devices, "
            "and check your reminders for tomorrow.",
            "bedtime_routine",
        )

    # --------------------------------------------------------
    # ADD HOUSEHOLD TASK
    # --------------------------------------------------------

    add_task_prefixes = (
        "add task ",
        "create task ",
        "remind me to ",
        "remember to ",
    )

    for prefix in add_task_prefixes:
        if text.startswith(prefix):
            task = message.strip()[len(prefix):].strip()

            if not task:
                return (
                    "What task would you like me to add?",
                    "task_manager",
                )

            add_task(task)

            return (
                f"Done. I've added '{task}' to your task list.",
                "task_manager",
            )

    if text in (
        "add task",
        "create task",
        "remind me to",
        "remember to",
    ):
        return (
            "What task would you like me to add?",
            "task_manager",
        )

    # --------------------------------------------------------
    # COMPLETE HOUSEHOLD TASK
    # --------------------------------------------------------

    complete_prefixes = (
        "complete task ",
        "finish task ",
        "mark task complete ",
    )

    for prefix in complete_prefixes:
        if text.startswith(prefix):
            task = message.strip()[len(prefix):].strip()

            if not task:
                return (
                    "Which task would you like me to complete?",
                    "task_manager",
                )

            result = complete_task(task)

            return (
                result.get(
                    "message",
                    f"I processed the request to complete '{task}'.",
                ),
                "task_manager",
            )

    if text in (
        "complete task",
        "finish task",
        "mark task complete",
    ):
        return (
            "Which task would you like me to complete?",
            "task_manager",
        )

    # --------------------------------------------------------
    # SHOW HOUSEHOLD TASKS
    # IMPORTANT: Handles "What tasks do I have?"
    # --------------------------------------------------------

    task_keywords = (
        "what tasks do i have",
        "what are my tasks",
        "what tasks have i got",
        "show my tasks",
        "show tasks",
        "list my tasks",
        "list tasks",
        "my tasks",
        "pending tasks",
        "my pending tasks",
        "what are my pending tasks",
        "what do i need to do",
        "what should i do",
        "what do i have to do",
        "what tasks are pending",
        "what is on my task list",
        "what's on my task list",
        "whats on my task list",
        "to-do",
        "todo",
    )

    if any(phrase in text for phrase in task_keywords):
        result = get_tasks()

        return format_task_list(result), "task_manager"

    # --------------------------------------------------------
    # ADD SHOPPING ITEM
    # --------------------------------------------------------

    shopping_prefixes = (
        "add shopping ",
        "add item ",
        "buy ",
    )

    for prefix in shopping_prefixes:
        if text.startswith(prefix):
            item = message.strip()[len(prefix):].strip()

            if not item:
                return (
                    "What would you like me to add to your shopping list?",
                    "shopping_manager",
                )

            add_item(item)

            return (
                f"Done. I've added '{item}' to your shopping list.",
                "shopping_manager",
            )

    if text in (
        "add shopping",
        "add item",
        "add to shopping list",
    ):
        return (
            "What would you like me to add to your shopping list?",
            "shopping_manager",
        )

    # Supports: "Add milk to shopping list"
    if text.startswith("add ") and (
        "shopping" in text or "shopping list" in text
    ):
        item = message.strip()[4:]

        for suffix in (
            "to my shopping list",
            "to the shopping list",
            "to shopping list",
            "to shopping",
        ):
            if item.lower().endswith(suffix):
                item = item[:-len(suffix)].strip()
                break

        if item:
            add_item(item)

            return (
                f"Done. I've added '{item}' to your shopping list.",
                "shopping_manager",
            )

    # --------------------------------------------------------
    # REMOVE SHOPPING ITEM
    # --------------------------------------------------------

    remove_prefixes = (
        "remove shopping ",
        "remove item ",
        "remove ",
    )

    for prefix in remove_prefixes:
        if text.startswith(prefix):
            item = message.strip()[len(prefix):].strip()

            if not item:
                return (
                    "Which item would you like me to remove?",
                    "shopping_manager",
                )

            result = remove_item(item)

            return (
                result.get(
                    "message",
                    f"I processed the request to remove '{item}'.",
                ),
                "shopping_manager",
            )

    # --------------------------------------------------------
    # SHOW SHOPPING LIST
    # --------------------------------------------------------

    shopping_keywords = (
        "shopping list",
        "what should i buy",
        "what do i need to buy",
        "show shopping",
        "show my shopping",
        "what's on my shopping list",
        "whats on my shopping list",
        "what is on my shopping list",
        "what do i need from the store",
        "groceries",
    )

    if any(phrase in text for phrase in shopping_keywords):
        result = get_shopping_list()

        return format_shopping_list(result), "shopping_manager"

    # --------------------------------------------------------
    # ENERGY ANALYSIS
    # --------------------------------------------------------

    energy_keywords = (
        "energy",
        "electricity",
        "power consumption",
        "energy usage",
        "electricity usage",
        "save electricity",
        "reduce power",
        "electricity bill",
        "power usage",
        "reduce electricity",
        "save energy",
        "energy consumption",
    )

    if any(phrase in text for phrase in energy_keywords):
        result = analyze_energy()

        recommendations = result.get("recommendations", [])
        recommendation_text = "; ".join(
            str(item) for item in recommendations
        )

        response = (
            f"Your energy usage is currently "
            f"{result.get('status', 'unknown')}. "
            f"Your peak period is "
            f"{result.get('peak_period', 'not available')}."
        )

        if recommendation_text:
            response += (
                f" My recommendations are: {recommendation_text}."
            )

        return response, "energy_analyzer"

    # --------------------------------------------------------
    # PERSONAL WORK CHAT SHORTCUTS
    # --------------------------------------------------------

    personal_work_keywords = (
        "my personal work",
        "show personal work",
        "personal work tasks",
        "what am i working on",
    )

    if any(phrase in text for phrase in personal_work_keywords):
        result = get_personal_work(status="Pending")

        if isinstance(result, dict):
            items = result.get(
                "items",
                result.get("tasks", result.get("work", [])),
            )

            if not items:
                return (
                    "You don't have any pending personal work yet.",
                    "personal_work_manager",
                )

            return (
                f"Here is your pending personal work: {items}",
                "personal_work_manager",
            )

        return (
            f"Here is your pending personal work: {result}",
            "personal_work_manager",
        )

    # --------------------------------------------------------
    # GENERAL ASSISTANT FALLBACK
    # --------------------------------------------------------

    return (
        "I'm HomePilot AI. I can help you manage your home, "
        "household tasks, shopping list, bedtime routines, and "
        "energy usage. Try asking 'I'm leaving home', "
        "'Prepare my home before I leave', 'What tasks do I have?', "
        "'What do I need to buy?', 'Remind me to clean my room', "
        "or 'How can I save electricity?'.",
        "homepilot_agent",
    )


# ============================================================
# ROOT ENDPOINT
# ============================================================

@app.get("/")
def root():
    return {
        "name": "HomePilot AI",
        "status": "online",
        "message": "Your intelligent home assistant is ready.",
    }


# ============================================================
# DASHBOARD DATA
# ============================================================

@app.get("/dashboard")
def dashboard():
    tasks = get_tasks()
    shopping = get_shopping_list()
    energy = analyze_energy()

    return {
        "home_status": "Secure & Comfortable",
        "energy_status": energy.get("status", "Unknown"),
        "energy_peak_period": energy.get(
            "peak_period",
            "Not available",
        ),
        "tasks_count": result_count(tasks),
        "shopping_count": result_count(shopping),
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "HomePilot AI",
    }


# ============================================================
# CHAT ENDPOINT
# ============================================================

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    response, tool_used = process_message(request.message)

    return {
        "response": response,
        "tool_used": tool_used,
    }


# ============================================================
# PERSONAL WORK API
# ============================================================

@app.post("/personal-work")
def create_personal_work(work: PersonalWorkCreate):
    if not work.title.strip():
        raise HTTPException(
            status_code=422,
            detail="Personal work title cannot be empty.",
        )

    return add_personal_work(
        title=work.title.strip(),
        deadline=work.deadline,
        priority=work.priority,
    )


@app.get("/personal-work")
def list_personal_work(status: str | None = None):
    if status and status not in {"Pending", "Completed"}:
        raise HTTPException(
            status_code=400,
            detail="Status must be Pending or Completed.",
        )

    return get_personal_work(status=status)


@app.patch("/personal-work/complete")
def mark_personal_work_complete(work: PersonalWorkComplete):
    return complete_personal_work(work.task_id)