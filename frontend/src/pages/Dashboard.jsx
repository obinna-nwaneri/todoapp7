import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const adminPanelUrl = useMemo(
    () => `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/admin`,
    []
  );

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/todos');
      setTodos(data);
    } catch (error) {
      const text = error.response?.data?.message || 'Unable to load todos.';
      setMessage({ type: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const handleCreate = async payload => {
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.post('/api/todos', payload);
      setTodos(prev => [data, ...prev]);
      setMessage({ type: 'success', text: 'Todo created successfully.' });
    } catch (error) {
      const text = error.response?.data?.message || 'Unable to create todo.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = todo => {
    setEditingTodo(todo);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async payload => {
    if (!editingTodo) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const { data } = await api.put(`/api/todos/${editingTodo.id}`, payload);
      setTodos(prev => prev.map(todo => (todo.id === data.id ? data : todo)));
      setMessage({ type: 'success', text: 'Todo updated successfully.' });
      setEditingTodo(null);
    } catch (error) {
      const text = error.response?.data?.message || 'Unable to update todo.';
      setMessage({ type: 'error', text });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async todo => {
    const confirmed = window.confirm(`Delete "${todo.title}"?`);
    if (!confirmed) return;
    setMessage(null);
    try {
      await api.delete(`/api/todos/${todo.id}`);
      setTodos(prev => prev.filter(item => item.id !== todo.id));
      setMessage({ type: 'success', text: 'Todo deleted successfully.' });
    } catch (error) {
      const text = error.response?.data?.message || 'Unable to delete todo.';
      setMessage({ type: 'error', text });
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Enterprise Todo Workspace</h1>
          <p className="muted">
            Welcome back, <strong>{user.name}</strong>! Manage your high-impact tasks and keep your team aligned.
          </p>
        </div>
        <div className="header-actions">
          {user.isAdmin && (
            <a href={adminPanelUrl} target="_blank" rel="noreferrer" className="secondary">
              Open Admin Panel
            </a>
          )}
          <button onClick={logout} className="danger">
            Logout
          </button>
        </div>
      </header>

      <section className="panel">
        <h2>{editingTodo ? 'Update Todo' : 'Create a new Todo'}</h2>
        <TodoForm
          initialData={editingTodo ?? undefined}
          onSubmit={editingTodo ? handleUpdate : handleCreate}
          submitLabel={editingTodo ? 'Update Todo' : 'Create Todo'}
          disabled={submitting}
        />
        {editingTodo && (
          <button className="secondary" onClick={() => setEditingTodo(null)} disabled={submitting}>
            Cancel edit
          </button>
        )}
      </section>

      {message && <p className={`message ${message.type}`}>{message.text}</p>}

      <section className="panel">
        <div className="panel__header">
          <h2>Your Todos</h2>
          <button className="secondary" onClick={fetchTodos} disabled={loading}>
            Refresh
          </button>
        </div>
        <TodoList todos={todos} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      </section>
    </div>
  );
};

export default Dashboard;
