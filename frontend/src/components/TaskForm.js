import { useEffect, useState } from 'react';

const initialState = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Pending',
};

export default function TaskForm({ onSubmit, onCancel, initialTask }) {
  const [formData, setFormData] = useState({ ...initialState });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        title: initialTask.title || '',
        description: initialTask.description || '',
        due_date: initialTask.due_date || '',
        priority: initialTask.priority || 'Medium',
        status: initialTask.status || 'Pending',
      });
    } else {
      setFormData({ ...initialState });
    }
  }, [initialTask]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input name="title" value={formData.title} onChange={handleChange} required />
      </label>
      <label>
        Description
        <textarea name="description" value={formData.description} onChange={handleChange} />
      </label>
      <label>
        Due Date
        <input type="date" name="due_date" value={formData.due_date || ''} onChange={handleChange} />
      </label>
      <label>
        Priority
        <select name="priority" value={formData.priority} onChange={handleChange}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>
      <label>
        Status
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </label>
      <div className="form-actions">
        <button type="submit">{initialTask ? 'Update Task' : 'Create Task'}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="secondary">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
