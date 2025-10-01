import { useCallback, useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../utils.js';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { title: '', description: '' };

const TodosPage = () => {
  const { token, user } = useAuth();
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }),
    [token],
  );

  const loadTodos = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error('Failed to load todos');
      }
      const data = await response.json();
      setTodos(data);
    } catch (err) {
      setError(err.message || 'Unable to load todos');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, token]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/todos`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: form.title,
          description: form.description,
        }),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Unable to create todo');
      }
      setForm(emptyForm);
      await loadTodos();
    } catch (err) {
      setError(err.message || 'Unable to create todo');
    } finally {
      setCreating(false);
    }
  };

  const toggleCompleted = async (todo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ completed: !todo.completed }),
      });
      if (!response.ok) {
        throw new Error('Unable to update todo');
      }
      await loadTodos();
    } catch (err) {
      setError(err.message || 'Unable to update todo');
    }
  };

  const handleEdit = async (todo) => {
    const newTitle = window.prompt('Update title', todo.title);
    if (newTitle === null) return;
    const newDescription = window.prompt('Update description', todo.description ?? '');
    if (newDescription === null) return;
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      if (!response.ok) {
        throw new Error('Unable to update todo');
      }
      await loadTodos();
    } catch (err) {
      setError(err.message || 'Unable to update todo');
    }
  };

  const handleDelete = async (todo) => {
    if (!window.confirm('Delete this todo?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) {
        throw new Error('Unable to delete todo');
      }
      await loadTodos();
    } catch (err) {
      setError(err.message || 'Unable to delete todo');
    }
  };

  return (
    <div className="todos-page">
      <section className="card">
        <h2>Welcome back{user?.name ? `, ${user.name}` : ''}!</h2>
        <p className="helper-text">
          Create, update, and complete tasks. All todos are private to your account.
        </p>
        <form className="todo-form" onSubmit={handleCreate}>
          <input
            name="title"
            type="text"
            placeholder="New todo title"
            value={form.title}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleInputChange}
            rows={3}
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Adding…' : 'Add todo'}
          </button>
        </form>
        {error && <div className="error mt-2">{error}</div>}
      </section>

      <section className="card">
        <div className="todos-header">
          <h3>Your todos</h3>
          <button type="button" className="ghost" onClick={loadTodos} disabled={loading}>
            Refresh
          </button>
        </div>
        {loading ? (
          <p>Loading todos…</p>
        ) : todos.length === 0 ? (
          <p>No todos yet. Start by adding a new one above!</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'completed' : ''}>
                <div className="todo-main">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleCompleted(todo)}
                  />
                  <div>
                    <div className="todo-title">{todo.title}</div>
                    {todo.description && <div className="todo-description">{todo.description}</div>}
                    <div className="todo-meta">
                      Updated {new Date(todo.updatedAt || todo.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="todo-actions">
                  <button type="button" onClick={() => handleEdit(todo)}>
                    Edit
                  </button>
                  <button type="button" className="danger" onClick={() => handleDelete(todo)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default TodosPage;
