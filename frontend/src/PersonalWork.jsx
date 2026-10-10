
import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

export default function PersonalWork() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}/personal-work?status=${filter}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Could not load personal work.");
      }

      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || "Unable to connect to HomePilot AI.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function handleAdd(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      const response = await fetch(`${API}/personal-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          deadline: deadline || null,
          priority,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.message || "Could not save task.");
      }

      setTitle("");
      setDeadline("");
      setPriority("Medium");
      setFilter("Pending");
      setMessage("Personal work saved successfully!");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to save personal work.");
    }
  }

  async function handleComplete(taskId) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API}/personal-work/complete`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task_id: taskId }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.detail || data.message || "Could not complete task.");
      }

      setMessage("Task marked as completed!");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to update task.");
    }
  }

  return (
    <section className="personal-work">
      <h2>🧠 Personal Work Memory</h2>
      <p>Save your work and keep track of what you need to finish.</p>

      <form onSubmit={handleAdd} className="personal-work-form">
        <label>
          Work title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Finish hackathon submission"
            required
          />
        </label>

        <label>
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </label>

        <label>
          Priority
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>

        <button type="submit">+ Save Personal Work</button>
      </form>

      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}

      <div className="personal-work-filters">
        <button type="button" onClick={() => setFilter("Pending")}>
          Pending
        </button>
        <button type="button" onClick={() => setFilter("Completed")}>
          Completed
        </button>
        <button type="button" onClick={() => setFilter("")}>
          All Work
        </button>
      </div>

      {loading ? (
        <p>Loading your saved work...</p>
      ) : tasks.length === 0 ? (
        <p>No work found in this category. Add a task above!</p>
      ) : (
        <ul className="personal-work-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <div>
                <strong>{task.title}</strong>
                <p>
                  Deadline: {task.deadline || "Not set"} · Priority:{" "}
                  {task.priority} · Status: {task.status}
                </p>
              </div>

              {task.status === "Pending" && (
                <button
                  type="button"
                  onClick={() => handleComplete(task.id)}
                >
                  Mark Complete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
