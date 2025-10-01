import { useEffect, useMemo, useState } from 'react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  const isAdmin = user?.role === 'admin';
  const title = useMemo(
    () => (isAdmin ? 'All Tasks (Admin)' : 'My Tasks'),
    [isAdmin],
  );

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('tasks/');
        setTasks(response.data);
      } catch (err) {
        setError('Unable to load tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const refreshTasks = async () => {
    const response = await api.get('tasks/');
    setTasks(response.data);
  };

  const handleCreate = async (data) => {
    setError(null);
    try {
      await api.post('tasks/', data);
      await refreshTasks();
      setEditingTask(null);
    } catch (err) {
      setError('Unable to create task.');
    }
  };

  const handleUpdate = async (data) => {
    if (!editingTask) return;
    setError(null);
    try {
      await api.put(`tasks/${editingTask.id}/`, data);
      await refreshTasks();
      setEditingTask(null);
    } catch (err) {
      setError('Unable to update task.');
    }
  };

  const handleDelete = async (taskId) => {
    setError(null);
    try {
      await api.delete(`tasks/${taskId}/`);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      setError('Unable to delete task.');
    }
  };

  const handleStatusChange = async (task, status) => {
    setError(null);
    try {
      await api.patch(`tasks/${task.id}/`, { status });
      setTasks((prev) =>
        prev.map((current) => (current.id === task.id ? { ...current, status } : current)),
      );
    } catch (err) {
      setError('Unable to update status.');
    }
  };

  const handleSubmit = (data) => {
    if (editingTask) {
      handleUpdate(data);
    } else {
      handleCreate(data);
    }
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Enterprise Todo Dashboard</h1>
        <div className="user-info">
          <span>
            Logged in as {user?.username} ({user?.role})
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>
      <section className="tasks-section">
        <div className="tasks-overview">
          <h2>{title}</h2>
          {error && <p className="error">{error}</p>}
          <TaskList tasks={tasks} onEdit={setEditingTask} onDelete={handleDelete} onStatusChange={handleStatusChange} />
        </div>
        <div className="task-editor">
          <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
          <TaskForm
            initialTask={editingTask}
            onSubmit={handleSubmit}
            onCancel={() => setEditingTask(null)}
          />
        </div>
      </section>
    </div>
  );
}
