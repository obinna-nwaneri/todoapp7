const formatDate = (value) => {
  if (!value) return 'Not set'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString()
}

export default function TodoList({ todos, onEdit, onDelete }) {
  if (!todos.length) {
    return (
      <div className="card">
        <p style={{ margin: 0 }}>No todos found yet. Create your first one!</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Your todos</h3>
      {todos.map((todo) => (
        <div className="todo-item" key={todo.id}>
          <div className="todo-item-header">
            <div>
              <h4 style={{ margin: '0 0 0.25rem 0' }}>{todo.title}</h4>
              <small>Due: {formatDate(todo.dueDate)}</small>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className={`badge ${todo.priority}`}>{todo.priority}</span>
              <span className={`badge ${todo.status}`}>{todo.status}</span>
            </div>
          </div>
          <p style={{ marginTop: '0.5rem' }}>{todo.description}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="secondary" type="button" onClick={() => onEdit(todo)}>
              Edit
            </button>
            <button className="secondary" type="button" onClick={() => onDelete(todo.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
