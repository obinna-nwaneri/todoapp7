import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { PRIORITY_OPTIONS, STATUS_LABELS, STATUS_OPTIONS } from "../constants.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../services/api.js";

const STATUS_COLORS = ["#0d6efd", "#fd7e14", "#198754"];

const blankUser = {
  username: "",
  email: "",
  password: "",
  first_name: "",
  last_name: "",
  is_staff: false,
  is_superuser: false,
};

const blankTask = {
  title: "",
  description: "",
  due_date: "",
  priority: "medium",
  status: "pending",
  owner: "",
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userForm, setUserForm] = useState(blankUser);
  const [taskForm, setTaskForm] = useState(blankTask);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setErrors("");
    try {
      const [overviewResponse, usersResponse, tasksResponse] = await Promise.all([
        api.get("/admin/overview/"),
        api.get("/admin/users/"),
        api.get("/admin/tasks/"),
      ]);
      setOverview(overviewResponse.data);
      setUsers(usersResponse.data);
      setTasks(tasksResponse.data);
    } catch (err) {
      setErrors("Unable to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = useMemo(() => {
    if (!overview) return [];
    return STATUS_OPTIONS.map((option) => ({
      name: option.label,
      value: overview.status_breakdown?.[option.value] || 0,
    }));
  }, [overview]);

  const handleUserChange = (event) => {
    const { name, type, checked, value } = event.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTaskChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetUserForm = () => {
    setEditingUserId(null);
    setUserForm(blankUser);
  };

  const resetTaskForm = () => {
    setEditingTaskId(null);
    setTaskForm(blankTask);
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    setErrors("");

    const payload = { ...userForm };
    if (!payload.password) {
      delete payload.password;
    }

    try {
      if (editingUserId) {
        const response = await api.put(`/admin/users/${editingUserId}/`, payload);
        setUsers((prev) => prev.map((item) => (item.id === editingUserId ? response.data : item)));
      } else {
        const response = await api.post("/admin/users/", payload);
        setUsers((prev) => [response.data, ...prev]);
      }
      resetUserForm();
      await loadData();
    } catch (err) {
      const detail = err.response?.data;
      if (detail) {
        const message = Object.values(detail).flat().join(" ");
        setErrors(message || "Unable to save user.");
      } else {
        setErrors("Unable to save user.");
      }
    } finally {
      setSavingUser(false);
    }
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setSavingTask(true);
    setErrors("");

    const payload = {
      ...taskForm,
      owner: taskForm.owner ? Number(taskForm.owner) : null,
      due_date: taskForm.due_date || null,
    };

    try {
      if (editingTaskId) {
        const response = await api.put(`/admin/tasks/${editingTaskId}/`, payload);
        setTasks((prev) => prev.map((item) => (item.id === editingTaskId ? response.data : item)));
      } else {
        const response = await api.post("/admin/tasks/", payload);
        setTasks((prev) => [response.data, ...prev]);
      }
      resetTaskForm();
      await loadData();
    } catch (err) {
      const detail = err.response?.data;
      if (detail) {
        const message = Object.values(detail).flat().join(" ");
        setErrors(message || "Unable to save task.");
      } else {
        setErrors("Unable to save task.");
      }
    } finally {
      setSavingTask(false);
    }
  };

  const editUser = (selectedUser) => {
    setEditingUserId(selectedUser.id);
    setUserForm({
      username: selectedUser.username,
      email: selectedUser.email || "",
      password: "",
      first_name: selectedUser.first_name || "",
      last_name: selectedUser.last_name || "",
      is_staff: selectedUser.is_staff,
      is_superuser: selectedUser.is_superuser,
    });
  };

  const editTask = (selectedTask) => {
    setEditingTaskId(selectedTask.id);
    setTaskForm({
      title: selectedTask.title,
      description: selectedTask.description,
      due_date: selectedTask.due_date || "",
      priority: selectedTask.priority,
      status: selectedTask.status,
      owner: selectedTask.owner ? String(selectedTask.owner) : "",
    });
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}/`);
      setUsers((prev) => prev.filter((item) => item.id !== id));
      if (editingUserId === id) {
        resetUserForm();
      }
      await loadData();
    } catch (err) {
      setErrors("Unable to delete user.");
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }
    try {
      await api.delete(`/admin/tasks/${id}/`);
      setTasks((prev) => prev.filter((item) => item.id !== id));
      if (editingTaskId === id) {
        resetTaskForm();
      }
      await loadData();
    } catch (err) {
      setErrors("Unable to delete task.");
    }
  };

  const latestUsers = overview?.latest_users || [];

  return (
    <div className="row g-4">
      <div className="col-12">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between">
          <div>
            <h1 className="h3 mb-1">Admin Dashboard</h1>
            <p className="text-muted mb-0">Manage users and tasks across the organization.</p>
          </div>
          <div className="text-muted small">Logged in as {user?.username}</div>
        </div>
      </div>
      {errors && (
        <div className="col-12">
          <div className="alert alert-danger mb-0">{errors}</div>
        </div>
      )}
      <div className="col-12">
        <div className="row g-3">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Total Users</h6>
                <p className="display-6 mb-0">{overview?.total_users ?? "—"}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Total Tasks</h6>
                <p className="display-6 mb-0">{overview?.total_tasks ?? "—"}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Pending Tasks</h6>
                <p className="display-6 mb-0">
                  {overview?.status_breakdown?.pending ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <h2 className="h5 mb-3">Task status overview</h2>
            {loading ? (
              <div className="text-center text-muted">Loading chart...</div>
            ) : (
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                      {chartData.map((entry, index) => (
                        <Cell key={entry.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-body">
            <h2 className="h5 mb-3">Latest registered users</h2>
            {loading ? (
              <div className="text-muted">Loading users...</div>
            ) : latestUsers.length === 0 ? (
              <p className="text-muted mb-0">No users found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestUsers.map((item) => (
                      <tr key={item.id}>
                        <td>{item.username}</td>
                        <td>{item.email || "—"}</td>
                        <td>{format(new Date(item.date_joined), "MMM d, yyyy")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="col-lg-6">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Manage Users</h2>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={resetUserForm}>
                Add new
              </button>
            </div>
            <form onSubmit={handleUserSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="username">
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    className="form-control"
                    value={userForm.username}
                    onChange={handleUserChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    value={userForm.email}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="first_name">
                    First name
                  </label>
                  <input
                    id="first_name"
                    name="first_name"
                    className="form-control"
                    value={userForm.first_name}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="last_name">
                    Last name
                  </label>
                  <input
                    id="last_name"
                    name="last_name"
                    className="form-control"
                    value={userForm.last_name}
                    onChange={handleUserChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    className="form-control"
                    value={userForm.password}
                    onChange={handleUserChange}
                    placeholder={editingUserId ? "Leave blank to keep current" : "Set a password"}
                  />
                </div>
                <div className="col-md-6 d-flex align-items-center gap-3">
                  <div className="form-check">
                    <input
                      id="is_staff"
                      type="checkbox"
                      className="form-check-input"
                      name="is_staff"
                      checked={userForm.is_staff}
                      onChange={handleUserChange}
                    />
                    <label className="form-check-label" htmlFor="is_staff">
                      Staff
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      id="is_superuser"
                      type="checkbox"
                      className="form-check-input"
                      name="is_superuser"
                      checked={userForm.is_superuser}
                      onChange={handleUserChange}
                    />
                    <label className="form-check-label" htmlFor="is_superuser">
                      Superuser
                    </label>
                  </div>
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" type="submit" disabled={savingUser}>
                  {savingUser ? "Saving..." : editingUserId ? "Update user" : "Create user"}
                </button>
                {editingUserId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetUserForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5 mb-3">All Users</h2>
            {loading ? (
              <p className="text-muted">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-muted mb-0">No users available.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id}>
                        <td>{item.username}</td>
                        <td>{item.email || "—"}</td>
                        <td>{item.is_superuser ? "Superuser" : item.is_staff ? "Staff" : "User"}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary" type="button" onClick={() => editUser(item)}>
                              Edit
                            </button>
                            <button className="btn btn-outline-danger" type="button" onClick={() => deleteUser(item.id)}>
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
      <div className="col-lg-6">
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h5 mb-0">Manage Tasks</h2>
              <button className="btn btn-sm btn-outline-primary" type="button" onClick={resetTaskForm}>
                Add new
              </button>
            </div>
            <form onSubmit={handleTaskSubmit}>
              <div className="mb-3">
                <label className="form-label" htmlFor="task-title">
                  Title
                </label>
                <input
                  id="task-title"
                  name="title"
                  className="form-control"
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label" htmlFor="task-description">
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  className="form-control"
                  rows="3"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  required
                />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="task-owner">
                    Owner
                  </label>
                  <select
                    id="task-owner"
                    name="owner"
                    className="form-select"
                    value={taskForm.owner}
                    onChange={handleTaskChange}
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="task-due">
                    Due date
                  </label>
                  <input
                    id="task-due"
                    type="date"
                    name="due_date"
                    className="form-control"
                    value={taskForm.due_date || ""}
                    onChange={handleTaskChange}
                  />
                </div>
              </div>
              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="task-priority">
                    Priority
                  </label>
                  <select
                    id="task-priority"
                    name="priority"
                    className="form-select"
                    value={taskForm.priority}
                    onChange={handleTaskChange}
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="task-status">
                    Status
                  </label>
                  <select
                    id="task-status"
                    name="status"
                    className="form-select"
                    value={taskForm.status}
                    onChange={handleTaskChange}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" type="submit" disabled={savingTask}>
                  {savingTask ? "Saving..." : editingTaskId ? "Update task" : "Create task"}
                </button>
                {editingTaskId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetTaskForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <h2 className="h5 mb-3">All Tasks</h2>
            {loading ? (
              <p className="text-muted">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-muted mb-0">No tasks available.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Due</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((item) => (
                      <tr key={item.id}>
                        <td>{item.title}</td>
                        <td>{item.owner_username}</td>
                        <td>{STATUS_LABELS[item.status]}</td>
                        <td className="text-capitalize">{item.priority}</td>
                        <td>{item.due_date ? format(new Date(item.due_date), "MMM d, yyyy") : "—"}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-secondary" type="button" onClick={() => editTask(item)}>
                              Edit
                            </button>
                            <button className="btn btn-outline-danger" type="button" onClick={() => deleteTask(item.id)}>
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
    </div>
  );
};

export default AdminDashboard;
