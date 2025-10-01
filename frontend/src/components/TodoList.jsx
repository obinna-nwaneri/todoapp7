export default function TodoList({ todos, onEdit, onDelete }) {
  if (!todos.length) {
    return <p>No todos yet. Add your first task!</p>;
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <div key={todo.id} className={`todo-card status-${todo.status}`}>
          <div className="todo-header">
            <h3>{todo.title}</h3>
            <div className="todo-actions">
              <button type="button" onClick={() => onEdit(todo)}>
                Edit
              </button>
              <button type="button" className="danger" onClick={() => onDelete(todo.id)}>
                Delete
              </button>
            </div>
          </div>
          {todo.description && <p className="todo-description">{todo.description}</p>}
          <dl className="todo-meta">
            <div>
              <dt>Due</dt>
              <dd>{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'Not set'}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd className={`priority-${todo.priority}`}>{todo.priority}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{todo.status}</dd>
            </div>
            {todo.user && (
              <div>
                <dt>Owner</dt>
                <dd>{todo.user.name} ({todo.user.email})</dd>
              </div>
            )}
          </dl>
        </div>
      ))}
    </div>
  );
}
