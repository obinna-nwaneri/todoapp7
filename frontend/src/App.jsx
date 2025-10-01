import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import TodoForm from './components/TodoForm.jsx';
import TodoList from './components/TodoList.jsx';

const App = () => {
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterOwner, setFilterOwner] = useState('');
  const [filterCompleted, setFilterCompleted] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      if (filterOwner && String(todo.ownerId) !== filterOwner) {
        return false;
      }
      if (filterCompleted === 'true' && !todo.completed) {
        return false;
      }
      if (filterCompleted === 'false' && todo.completed) {
        return false;
      }
      return true;
    });
  }, [todos, filterOwner, filterCompleted]);

  const fetchTodos = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/todos');
      setTodos(response.data);
    } catch (err) {
      setError('Failed to load todos. Ensure the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Failed to load users.');
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchTodos();
  }, []);

  const handleCreate = async (payload) => {
    const response = await axios.post('/api/todos', payload);
    setTodos((prev) => [...prev, response.data]);
  };

  const handleToggleComplete = async (todo) => {
    const response = await axios.patch(`/api/todos/${todo.id}`, {
      completed: !todo.completed
    });
    setTodos((prev) => prev.map((item) => (item.id === todo.id ? response.data : item)));
  };

  const handleUpdate = async (id, changes) => {
    const response = await axios.patch(`/api/todos/${id}`, changes);
    setTodos((prev) => prev.map((item) => (item.id === id ? response.data : item)));
  };

  const handleDelete = async (id) => {
    await axios.delete(`/api/todos/${id}`);
    setTodos((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="app-container">
      <header>
        <h1>Team Todo Dashboard</h1>
        <p>Full-stack sample with Node.js, SQLite, and React.</p>
      </header>

      <section className="filters">
        <label>
          Assignee
          <select value={filterOwner} onChange={(event) => setFilterOwner(event.target.value)}>
            <option value="">All</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.role})
              </option>
            ))}
          </select>
        </label>

        <label>
          Status
          <select value={filterCompleted} onChange={(event) => setFilterCompleted(event.target.value)}>
            <option value="">All</option>
            <option value="false">Active</option>
            <option value="true">Completed</option>
          </select>
        </label>

        <button type="button" onClick={fetchTodos}>
          Refresh
        </button>
      </section>

      {error && <div className="alert">{error}</div>}

      <section className="main">
        <div className="left">
          <TodoForm users={users} onCreate={handleCreate} />
        </div>
        <div className="right">
          {loading ? (
            <p>Loading todos…</p>
          ) : (
            <TodoList
              todos={filteredTodos}
              onToggleComplete={handleToggleComplete}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              users={users}
            />
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
