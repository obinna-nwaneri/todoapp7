import { useEffect, useState } from 'react';

const defaultState = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
};

const TodoForm = ({ initialData = {}, onSubmit, submitLabel = 'Create Todo', disabled = false }) => {
  const [form, setForm] = useState({ ...defaultState, ...initialData });

  useEffect(() => {
    setForm({ ...defaultState, ...initialData });
  }, [initialData]);

  const handleChange = event => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = event => {
    event.preventDefault();
    if (!form.title) {
      return;
    }
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter todo title"
          required
          disabled={disabled}
        />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Optional details"
          disabled={disabled}
        />
      </div>
      <div className="grid">
        <div className="field">
          <label htmlFor="dueDate">Due Date</label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={form.dueDate ? form.dueDate.substring(0, 10) : ''}
            onChange={handleChange}
            disabled={disabled}
          />
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={form.priority} onChange={handleChange} disabled={disabled}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={form.status} onChange={handleChange} disabled={disabled}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      <button type="submit" className="primary" disabled={disabled}>
        {submitLabel}
      </button>
    </form>
  );
};

export default TodoForm;
