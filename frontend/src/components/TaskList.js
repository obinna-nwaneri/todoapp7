export default function TaskList({ tasks, onEdit, onDelete, onStatusChange }) {
  if (!tasks.length) {
    return <p className="empty">No tasks available.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <li key={task.id} className={`task-item status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}>
          <div className="task-header">
            <h3>{task.title}</h3>
            <span className="badge priority">{task.priority}</span>
            <span className="badge status">{task.status}</span>
          </div>
          {task.due_date && <p className="meta">Due: {task.due_date}</p>}
          {task.description && <p>{task.description}</p>}
          {task.created_by && (
            <p className="meta">
              Owner: {task.created_by.username} ({task.created_by.role})
            </p>
          )}
          <div className="task-actions">
            <button onClick={() => onEdit(task)}>Edit</button>
            <button className="danger" onClick={() => onDelete(task.id)}>
              Delete
            </button>
            <div className="status-buttons">
              <button onClick={() => onStatusChange(task, 'Pending')}>Mark Pending</button>
              <button onClick={() => onStatusChange(task, 'In Progress')}>Mark In Progress</button>
              <button onClick={() => onStatusChange(task, 'Completed')}>Mark Completed</button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
