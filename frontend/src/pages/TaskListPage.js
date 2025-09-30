import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../utils/api";

const priorities = [
  { value: "", label: "All priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const statuses = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

const formatLabel = (value) => value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ priority: "", status: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("tasks");
      setTasks(response.data);
    } catch (error) {
      console.error("Unable to load tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.priority && task.priority !== filters.priority) {
        return false;
      }
      if (filters.status && task.status !== filters.status) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error("Unable to delete task", error);
    }
  };

  return (
    <div>
      <h1>Tasks</h1>
      <div className="filter-bar">
        <select name="status" value={filters.status} onChange={handleFilterChange}>
          {statuses.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilterChange}>
          {priorities.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="button" onClick={() => navigate("/tasks/new")}>Add Task</button>
      </div>
      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Owner</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.user}</td>
                <td>{formatLabel(task.priority)}</td>
                <td>{formatLabel(task.status)}</td>
                <td>{task.due_date || "—"}</td>
                <td>
                  <Link className="button secondary" to={`/tasks/${task.id}/edit`}>
                    Edit
                  </Link>{" "}
                  <button className="button secondary" onClick={() => handleDelete(task.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="6">No tasks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TaskListPage;
