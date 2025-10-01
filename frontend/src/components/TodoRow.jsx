import React, { useState } from 'react';

const TodoRow = ({ todo, expanded, onToggleComplete, onToggleDetails, onUpdate, onDelete, users }) => {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: todo.title,
    description: todo.description,
    priority: todo.priority,
    dueDate: todo.dueDate || '',
    ownerId: todo.ownerId
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(todo.id, {
      title: form.title,
      description: form.description,
      priority: form.priority,
      dueDate: form.dueDate || null,
      ownerId: Number(form.ownerId)
    });
    setSaving(false);
    setEditing(false);
  };

  const displayDueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'No due date';

  return (
    <li className={`todo-row ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-row-main">
        <button className="icon" type="button" onClick={onToggleComplete} aria-label="Toggle complete">
          {todo.completed ? '✔' : '○'}
        </button>
        <div className="todo-text">
          <h3>{todo.title}</h3>
          <p>
            Assigned to {todo.ownerName} ({todo.ownerRole}) • Priority {todo.priority} • {displayDueDate}
          </p>
        </div>
        <div className="actions">
          <button type="button" className="icon" onClick={onToggleDetails} aria-expanded={expanded}>
            {expanded ? '▲' : '▼'}
          </button>
          <button type="button" className="icon" onClick={() => setEditing((value) => !value)}>
            ✎
          </button>
          <button type="button" className="icon" onClick={() => onDelete(todo.id)}>
            🗑
          </button>
        </div>
      </div>
      {expanded && (
        <div className="todo-row-details">
          {editing ? (
            <div className="edit-form">
              <label>
                Title
                <input name="title" value={form.title} onChange={handleChange} />
              </label>
              <label>
                Description
                <textarea name="description" value={form.description} onChange={handleChange} />
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
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role})
                    </option>
                  ))}
                </select>
              </label>
              <div className="edit-actions">
                <button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p>{todo.description || 'No description provided.'}</p>
              <p className="meta">Created {new Date(todo.createdAt || Date.now()).toLocaleString()}</p>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export default TodoRow;
