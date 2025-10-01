import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { createTask, deleteTask, fetchTasks, updateTask } from '../services/api';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, access, logout, isAuthenticated } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    const loadTasks = async () => {
      setLoading(true);
      try {
        const { data } = await fetchTasks(access);
        setTasks(data);
      } catch (err) {
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, [isAuthenticated, navigate, access]);

  const handleCreateOrUpdate = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      if (editingTask) {
        await updateTask(access, editingTask.id, formData);
      } else {
        await createTask(access, formData);
      }
      const { data } = await fetchTasks(access);
      setTasks(data);
      setEditingTask(null);
    } catch (err) {
      setError('Unable to save the task.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteTask(access, id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError('Unable to delete the task.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => setEditingTask(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          {user && (
            <p>
              Logged in as <strong>{user.username}</strong> ({user.role})
            </p>
          )}
        </div>
        <button className="secondary" onClick={handleLogout}>
          Log out
        </button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="task-section">
        <h2>{editingTask ? 'Edit Task' : 'Create a new Task'}</h2>
        <TaskForm
          initialData={editingTask}
          onSubmit={handleCreateOrUpdate}
          onCancel={editingTask ? handleCancelEdit : undefined}
        />
      </section>

      <section className="task-section">
        <div className="section-header">
          <h2>{user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}</h2>
          {loading && <span className="status">Loading...</span>}
        </div>
        <TaskList tasks={tasks} onEdit={handleEdit} onDelete={handleDelete} />
      </section>
    </div>
  );
};

export default DashboardPage;
