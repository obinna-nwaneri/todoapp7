import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

import { PRIORITY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from "../constants.js";
import api from "../services/api.js";

const initialTask = {
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  status: "pending",
};

const UserDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "" });
  const [formTask, setFormTask] = useState(initialTask);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchTasks = async (activeFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.priority) params.priority = activeFilters.priority;
      const response = await api.get("/tasks/", { params });
      setTasks(response.data);
    } catch (err) {
      setError("Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    fetchTasks(updatedFilters);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (task) => {
    setEditingTaskId(task.id);
    setFormTask({
      title: task.title,
      description: task.description,
      due_date: task.due_date || "",
      priority: task.priority,
      status: task.status,
    });
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      await api.delete(`/tasks/${taskId}/`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      if (editingTaskId === taskId) {
        resetForm();
      }
    } catch (err) {
      setError("Unable to delete task.");
    }
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setFormTask(initialTask);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      ...formTask,
      due_date: formTask.due_date || null,
    };

    try {
      if (editingTaskId) {
        const response = await api.put(`/tasks/${editingTaskId}/`, payload);
        setTasks((prev) => prev.map((task) => (task.id === editingTaskId ? response.data : task)));
      } else {
        const response = await api.post("/tasks/", payload);
        setTasks((prev) => [response.data, ...prev]);
      }
      resetForm();
    } catch (err) {
      const detail = err.response?.data;
      if (detail) {
        const message = Object.values(detail).flat().join(" ");
        setError(message || "Unable to save task.");
      } else {
        setError("Unable to save task.");
      }
    } finally {
      setSaving(false);
    }
  };

  const upcomingTasks = useMemo(() => {
    const today = new Date();
    return tasks
      .filter((task) => task.due_date && new Date(task.due_date) >= today)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  }, [tasks]);

  return (
    <div className="row g-4">
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h4 mb-0">My Tasks</h2>
              <button className="btn btn-outline-primary" type="button" onClick={resetForm}>
                Add new task
              </button>
            </div>
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label text-muted">Filter by status</label>
                <select
                  className="form-select"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">All statuses</option>
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted">Filter by priority</label>
                <select
                  className="form-select"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                >
                  <option value="">All priorities</option>
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
              <div className="text-center py-5 text-muted">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-5 text-muted">No tasks found. Create your first task above.</div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <h6 className="mb-1">{task.title}</h6>
                          <p className="text-muted small mb-0">{task.description}</p>
                        </td>
                        <td>
                          <span className="badge text-bg-light border">{STATUS_LABELS[task.status]}</span>
                        </td>
                        <td className="text-capitalize">{task.priority}</td>
                        <td>{task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "—"}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm" role="group">
                            <button className="btn btn-outline-secondary" type="button" onClick={() => handleEdit(task)}>
                              Edit
                            </button>
                            <button className="btn btn-outline-danger" type="button" onClick={() => handleDelete(task.id)}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <h2 className="h5 mb-3">{editingTaskId ? "Update task" : "Create new task"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  className="form-control"
                  value={formTask.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  rows="3"
                  value={formTask.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="due_date">
                  Due date
                </label>
                <input
                  id="due_date"
                  type="date"
                  name="due_date"
                  className="form-control"
                  value={formTask.due_date || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="priority">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="form-select"
                  value={formTask.priority}
                  onChange={handleInputChange}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="status">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formTask.status}
                  onChange={handleInputChange}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="d-flex gap-2">
                <button className="btn btn-primary flex-grow-1" type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingTaskId ? "Update" : "Create"}
                </button>
                {editingTaskId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5 mb-3">Upcoming deadlines</h2>
            {upcomingTasks.length === 0 ? (
              <p className="text-muted mb-0">No upcoming tasks scheduled.</p>
            ) : (
              <ul className="list-group list-group-flush">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="list-group-item px-0">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="mb-1">{task.title}</h6>
                        <small className="text-muted">{STATUS_LABELS[task.status]}</small>
                      </div>
                      <span className="badge text-bg-primary">
                        {format(new Date(task.due_date), "MMM d")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
