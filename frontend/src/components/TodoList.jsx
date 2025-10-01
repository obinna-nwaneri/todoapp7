const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const statusLabels = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const TodoList = ({ todos, onEdit, onDelete, loading }) => {
  if (loading) {
    return <p className="muted">Loading todos...</p>;
  }

  if (!todos.length) {
    return <p className="muted">No todos yet. Start by creating one above.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map(todo => (
        <li key={todo.id} className="todo-card">
          <div className="todo-card__content">
            <div className="todo-card__header">
              <h3>{todo.title}</h3>
              <span className={`chip priority-${todo.priority}`}>{priorityLabels[todo.priority] ?? todo.priority}</span>
            </div>
            {todo.description && <p className="todo-card__description">{todo.description}</p>}
            <div className="todo-card__meta">
              {todo.dueDate && <span>Due: {new Date(todo.dueDate).toLocaleDateString()}</span>}
              <span>Status: {statusLabels[todo.status] ?? todo.status}</span>
              {todo.user && <span>Owner: {todo.user.name}</span>}
            </div>
          </div>
          <div className="todo-card__actions">
            <button onClick={() => onEdit(todo)} className="secondary">Edit</button>
            <button onClick={() => onDelete(todo)} className="danger">Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default TodoList;
