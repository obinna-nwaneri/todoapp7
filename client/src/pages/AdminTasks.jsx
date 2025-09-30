import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const emptyTask = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Pending',
  user_id: ''
};

const AdminTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const headers = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/admin/tasks', headers);
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load tasks');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', headers);
      setUsers(response.data.map(({ tasks: _tasks, ...user }) => user));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load users');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyTask);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (editingId) {
        await axios.put(`/api/admin/tasks/${editingId}`, { ...form, user_id: Number(form.user_id) }, headers);
        setSuccess('Task updated successfully');
      } else {
        await axios.post('/api/admin/tasks', { ...form, user_id: Number(form.user_id) }, headers);
        setSuccess('Task created successfully');
      }
      resetForm();
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      priority: task.priority,
      status: task.status,
      user_id: task.user_id
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/admin/tasks/${id}`, headers);
      setSuccess('Task deleted successfully');
      if (editingId === id) {
        resetForm();
      }
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task');
    }
  };

  return (
    <div className="card">
      <h2>Manage Tasks</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input id="title" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange} rows="3" />
        </div>
        <div className="form-group">
          <label htmlFor="due_date">Due Date</label>
          <input id="due_date" name="due_date" type="date" value={form.due_date} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="user_id">Assigned User</label>
          <select id="user_id" name="user_id" value={form.user_id} onChange={handleChange} required>
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-between">
          <button type="submit">{editingId ? 'Update Task' : 'Create Task'}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginTop: '2rem' }}>All Tasks</h3>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Owner</th>
            <th>Due Date</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.username}</td>
              <td>{task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}</td>
              <td>{task.priority}</td>
              <td>{task.status}</td>
              <td>
                <button type="button" onClick={() => handleEdit(task)}>
                  Edit
                </button>{' '}
                <button type="button" onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTasks;
