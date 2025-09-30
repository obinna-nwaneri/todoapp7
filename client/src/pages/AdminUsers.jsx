import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  role: 'user'
};

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingId) {
        await axios.put(`/api/admin/users/${editingId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('User updated successfully');
      } else {
        await axios.post('/api/admin/users', form, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setSuccess('User created successfully');
      }
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save user');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({ username: user.username, email: user.email, password: '', role: user.role });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess('User deleted successfully');
      if (editingId === id) {
        resetForm();
      }
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete user');
    }
  };

  return (
    <div className="card">
      <h2>Manage Users</h2>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input id="username" name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password {editingId && <small>(leave blank to keep existing)</small>}</label>
          <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required={!editingId} />
        </div>
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex-between">
          <button type="submit">{editingId ? 'Update User' : 'Create User'}</button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginTop: '2rem' }}>Existing Users</h3>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Tasks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.tasks.length}</td>
              <td>
                <button type="button" onClick={() => handleEdit(user)}>
                  Edit
                </button>{' '}
                <button type="button" onClick={() => handleDelete(user.id)}>
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

export default AdminUsers;
