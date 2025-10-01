import { useEffect, useState } from 'react';

const defaultState = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending'
};

export default function TodoForm({ onSubmit, loading, initialData, onCancel, isAdmin }) {
  const [form, setForm] = useState(defaultState);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.substring(0, 10) : '',
        priority: initialData.priority || 'medium',
        status: initialData.status || 'pending'
      });
      setUserId(initialData.userId ? String(initialData.userId) : '');
    } else {
      setForm(defaultState);
      setUserId('');
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, userId: userId ? Number(userId) : undefined });
  };

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-row">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
      </div>
      <div className="form-row">
        <label htmlFor="dueDate">Due Date</label>
        <input
          id="dueDate"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        />
      </div>
      <div className="form-row inline">
        <div>
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {isAdmin && (
          <div>
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              name="userId"
              type="number"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="Assign to user"
              min="1"
            />
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Todo'}
        </button>
        {initialData && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
