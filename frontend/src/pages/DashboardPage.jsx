import { useEffect, useState } from 'react';
import TodoForm from '../components/TodoForm.jsx';
import TodoList from '../components/TodoList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchTodos,
  createTodoRequest,
  updateTodoRequest,
  deleteTodoRequest
} from '../services/api.js';

export default function DashboardPage() {
  const { user, message, setMessage } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  const loadTodos = async () => {
    setLoading(true);
    const response = await fetchTodos();
    if (response.success) {
      setTodos(response.data);
    } else {
      setMessage(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateOrUpdate = async (payload) => {
    setSaving(true);
    let response;
    if (editingTodo) {
      response = await updateTodoRequest(editingTodo.id, payload);
    } else {
      response = await createTodoRequest(payload);
    }

    if (response.success) {
      setMessage(editingTodo ? 'Todo updated successfully' : 'Todo created successfully');
      setEditingTodo(null);
      loadTodos();
    } else {
      setMessage(response.message);
    }
    setSaving(false);
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return;
    const response = await deleteTodoRequest(id);
    if (response.success) {
      setMessage('Todo deleted successfully');
      loadTodos();
    } else {
      setMessage(response.message);
    }
  };

  return (
    <div className="dashboard">
      <section className="panel">
        <h2>{editingTodo ? 'Edit Todo' : 'Create Todo'}</h2>
        <TodoForm
          onSubmit={handleCreateOrUpdate}
          loading={saving}
          initialData={editingTodo}
          onCancel={() => setEditingTodo(null)}
          isAdmin={user.role === 'admin'}
        />
        {message && (
          <div className="alert" onAnimationEnd={() => setMessage(null)}>
            {message}
          </div>
        )}
      </section>
      <section className="panel">
        <div className="panel-header">
          <h2>Your Todos</h2>
          <button type="button" className="secondary" onClick={loadTodos} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {loading ? <p>Loading todos...</p> : <TodoList todos={todos} onEdit={handleEdit} onDelete={handleDelete} />}
      </section>
    </div>
  );
}
