import React from 'react';

const TaskList = ({ tasks, onEdit, onDelete }) => {
  if (!tasks.length) {
    return <p>No tasks available. Create one to get started.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div key={task.id} className="task-card">
          <header>
            <h3>{task.title}</h3>
            <span className={`status status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}>{task.status}</span>
          </header>
          <p className="description">{task.description || 'No description provided.'}</p>
          <div className="meta">
            <span><strong>Priority:</strong> {task.priority}</span>
            {task.due_date && <span><strong>Due:</strong> {task.due_date}</span>}
            {task.created_by && <span><strong>Owner:</strong> {task.created_by.username}</span>}
          </div>
          <div className="actions">
            <button className="secondary" onClick={() => onEdit(task)}>Edit</button>
            <button className="danger" onClick={() => onDelete(task.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
