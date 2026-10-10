def leaving_home():
    return {
        "routine": "Leaving Home",
        "actions": [
            "Turn off unnecessary lights",
            "Turn off unused appliances",
            "Check doors and windows",
            "Review pending household tasks"
        ],
        "message": "Your leaving-home routine is ready."
    }


def arriving_home():
    return {
        "routine": "Arriving Home",
        "actions": [
            "Check home environment",
            "Review pending tasks",
            "Check shopping requirements"
        ],
        "message": "Welcome home. Your home overview is ready."
    }


def bedtime():
    return {
        "routine": "Bedtime",
        "actions": [
            "Turn off unnecessary lights",
            "Check doors and windows",
            "Reduce unnecessary appliance usage",
            "Review tomorrow's reminders"
        ],
        "message": "Your bedtime routine is ready."
    }