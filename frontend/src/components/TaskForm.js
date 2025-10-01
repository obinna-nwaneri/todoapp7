import React, { useEffect, useState } from 'react';

const defaultTask = {
  title: '',
  description: '',
  due_date: '',
  priority: 'Medium',
  status: 'Pending',
};

const TaskForm = ({ onSubmit, onCancel, initialData }) => {
  const [task, setTask] = useState(defaultTask);

  useEffect(() => {
    if (initialData) {
      setTask({
        title: initialData.title || '',
        description: initialData.description || '',
        due_date: initialData.due_date || '',
        priority: initialData.priority || 'Medium',
        status: initialData.status || 'Pending',
      });
    } else {
      setTask(defaultTask);
    }
  }, [initialData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(task);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" value={task.title} onChange={handleChange} required />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" value={task.description} onChange={handleChange} rows={4} />
      </div>
      <div className="row">
        <div className="field">
          <label htmlFor="due_date">Due Date</label>
          <input id="due_date" name="due_date" type="date" value={task.due_date || ''} onChange={handleChange} />
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={task.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={task.status} onChange={handleChange}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="actions">
        <button type="submit" className="primary">
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
        {onCancel && (
          <button type="button" className="secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
