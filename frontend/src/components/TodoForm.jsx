import React, { useState } from 'react';

const initialState = {
  title: '',
  description: '',
  ownerId: '',
  priority: 'medium',
  dueDate: ''
};

const TodoForm = ({ users, onCreate }) => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.ownerId) {
      setError('A title and assignee are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        ownerId: Number(form.ownerId),
        priority: form.priority,
        dueDate: form.dueDate || null
      });
      setForm(initialState);
    } catch (err) {
      setError('Failed to create todo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Create Todo</h2>
      {error && <div className="alert">{error}</div>}
      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} placeholder="What needs to be done?" />
      </label>
      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Add extra context" />
      </label>
      <label>
        Priority
        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
      <label>
        Due date
        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
      </label>
      <label>
        Assignee
        <select name="ownerId" value={form.ownerId} onChange={handleChange}>
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.role})
            </option>
          ))}
        </select>
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Saving…' : 'Add Todo'}
      </button>
    </form>
  );
};

export default TodoForm;
