from flask import Flask, jsonify, request
import json
import os
from flask_cors import CORS
from datetime import datetime


DATA_FILE = "tasks.json"


def load_tasks():
    """Load tasks from JSON file."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []


def save_tasks(tasks):
    """Save tasks to JSON file."""
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(tasks, f, indent=2)
    except IOError as e:
        print(f"Error saving tasks: {e}")


def get_next_id(tasks):
    """Get the next available ID by finding the max ID."""
    if not tasks:
        return 1
    return max(t.get("id", 0) for t in tasks) + 1


app = Flask(__name__)
CORS(app)


@app.route("/tasks", methods=["GET"])
def get_tasks():
    """Retrieve all tasks sorted by creation order."""
    tasks = load_tasks()
    return jsonify(tasks)


@app.route("/tasks", methods=["POST"])
def add_task():
    """Add a new task with validation."""
    data = request.get_json()
    
    # Validation
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    if "title" not in data:
        return jsonify({"error": "Missing required field: title"}), 400
    if not isinstance(data["title"], str):
        return jsonify({"error": "Title must be a string"}), 400
    
    title = data["title"].strip()
    if not title:
        return jsonify({"error": "Title cannot be empty"}), 400
    if len(title) > 500:
        return jsonify({"error": "Title is too long (max 500 characters)"}), 400
    
    priority = data.get("priority", "medium").lower()
    if priority not in ["low", "medium", "high"]:
        priority = "medium"
    
    tasks = load_tasks()
    task = {
        "id": get_next_id(tasks),
        "title": title,
        "completed": False,
        "priority": priority,
        "created_at": datetime.now().isoformat()
    }
    tasks.append(task)
    save_tasks(tasks)
    return jsonify(task), 201


@app.route("/tasks/<int:task_id>", methods=["PUT"])
def complete_task(task_id):
    """Mark a task as completed or update task details."""
    data = request.get_json() or {}
    tasks = load_tasks()
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # If title is provided, update it
    if "title" in data:
        title = str(data["title"]).strip()
        if not title:
            return jsonify({"error": "Title cannot be empty"}), 400
        if len(title) > 500:
            return jsonify({"error": "Title is too long (max 500 characters)"}), 400
        task["title"] = title
    
    # If priority is provided, update it
    if "priority" in data:
        priority = str(data["priority"]).lower()
        if priority in ["low", "medium", "high"]:
            task["priority"] = priority
    
    # If no data provided (toggle completion)
    if not data:
        task["completed"] = not task.get("completed", False)
    
    task["updated_at"] = datetime.now().isoformat()
    save_tasks(tasks)
    return jsonify(task)


@app.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    """Delete a task."""
    tasks = load_tasks()
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    tasks.remove(task)
    save_tasks(tasks)
    return jsonify({"message": "Task deleted", "id": task_id}), 200


@app.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id):
    """Get a specific task."""
    tasks = load_tasks()
    task = next((t for t in tasks if t["id"] == task_id), None)
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    return jsonify(task)


@app.route("/stats", methods=["GET"])
def get_stats():
    """Get task statistics."""
    tasks = load_tasks()
    completed = sum(1 for t in tasks if t.get("completed", False))
    
    return jsonify({
        "total": len(tasks),
        "completed": completed,
        "remaining": len(tasks) - completed,
        "completion_percentage": round((completed / len(tasks) * 100) if tasks else 0)
    })


@app.route("/")
def home():
    """Home route."""
    return jsonify({"message": "TaskFlow API is running!", "version": "1.0.0"})


@app.errorhandler(400)
def bad_request(error):
    """Handle bad requests."""
    return jsonify({"error": "Bad request"}), 400


@app.errorhandler(404)
def not_found(error):
    """Handle not found errors."""
    return jsonify({"error": "Resource not found"}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle server errors."""
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True)


if __name__ == "__main__":
    app.run(debug=True)