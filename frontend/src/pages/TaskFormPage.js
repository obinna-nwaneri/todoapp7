import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import api from "../utils/api";

const defaultTask = {
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  status: "pending",
  assigned_user: "",
};

const TaskFormPage = ({ mode }) => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { isAdmin } = useAuth();
  const [task, setTask] = useState(defaultTask);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mode === "edit" && taskId) {
      const fetchTask = async () => {
        try {
          const response = await api.get(`tasks/${taskId}`);
          setTask({ ...defaultTask, ...response.data, assigned_user: response.data.user_id ? String(response.data.user_id) : "" });
        } catch (err) {
          setError("Unable to load task.");
        }
      };
      fetchTask();
    }
  }, [mode, taskId]);

  useEffect(() => {
    if (isAdmin) {
      const fetchUsers = async () => {
        try {
          const response = await api.get("admin/users");
          setUsers(response.data);
        } catch (err) {
          console.error("Unable to load users", err);
        }
      };
      fetchUsers();
    }
  }, [isAdmin]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const payload = {
      title: task.title,
      description: task.description,
      due_date: task.due_date || null,
      priority: task.priority,
      status: task.status,
    };
    if (isAdmin && task.assigned_user) {
      payload.assigned_user = Number(task.assigned_user);
    }

    try {
      if (mode === "edit" && taskId) {
        await api.put(`tasks/${taskId}`, payload);
      } else {
        await api.post("tasks", payload);
      }
      navigate("/tasks");
    } catch (err) {
      setError("Unable to save task. Please check the form values.");
    }
  };

  return (
    <div>
      <h1>{mode === "edit" ? "Edit Task" : "Add Task"}</h1>
      {error && <div className="alert">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={task.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={task.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            value={task.due_date || ""}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={task.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={task.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {isAdmin && (
          <div className="form-group">
            <label htmlFor="assigned_user">Assign To</label>
            <select
              id="assigned_user"
              name="assigned_user"
              value={task.assigned_user || ""}
              onChange={handleChange}
            >
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="form-actions">
          <button className="button" type="submit">
            {mode === "edit" ? "Update Task" : "Create Task"}
          </button>
          <button className="button secondary" type="button" onClick={() => navigate("/tasks")}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskFormPage;
