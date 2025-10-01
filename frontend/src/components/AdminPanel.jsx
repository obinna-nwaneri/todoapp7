export default function AdminPanel({ users, todos, onRefresh, onEditTodo, onDeleteTodo }) {
  const formatDate = (value) => {
    if (!value) return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Admin oversight</h2>
        <button className="secondary" type="button" onClick={onRefresh}>
          Refresh data
        </button>
      </div>
      <section style={{ marginTop: '1.5rem' }}>
        <h3>Users</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                <td>{formatDate(user.created_at ?? user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h3>Todos</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Owner</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Due date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.map((todo) => (
              <tr key={todo.id}>
                <td>{todo.title}</td>
                <td>{todo.user?.name ?? 'Unknown'}</td>
                <td style={{ textTransform: 'capitalize' }}>{todo.priority}</td>
                <td style={{ textTransform: 'capitalize' }}>{todo.status}</td>
                <td>{formatDate(todo.dueDate)}</td>
                <td>
                  <button className="secondary" type="button" onClick={() => onEditTodo(todo)}>
                    Edit
                  </button>
                  <button
                    className="secondary"
                    type="button"
                    style={{ marginLeft: '0.5rem' }}
                    onClick={() => onDeleteTodo(todo.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
