shopping_list = [
    "Milk",
    "Rice",
    "Detergent",
    "Vegetables"
]


def get_shopping_list():
    return {
        "items": shopping_list,
        "count": len(shopping_list)
    }


def add_item(item: str):
    shopping_list.append(item)

    return {
        "message": f"Added {item} to your shopping list.",
        "items": shopping_list
    }


def remove_item(item: str):
    if item in shopping_list:
        shopping_list.remove(item)

        return {
            "message": f"Removed {item} from your shopping list.",
            "items": shopping_list
        }

    return {
        "message": f"{item} was not found in your shopping list.",
        "items": shopping_list
    }