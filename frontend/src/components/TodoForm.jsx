import { useEffect, useState } from 'react'

const initialState = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  dueDate: '',
  userId: '',
}

export default function TodoForm({
  onSubmit,
  submitting,
  selectedTodo,
  onCancel,
  users = [],
  allowUserSelection = false,
}) {
  const [form, setForm] = useState({ ...initialState })

  useEffect(() => {
    if (selectedTodo) {
      setForm({
        title: selectedTodo.title,
        description: selectedTodo.description,
        priority: selectedTodo.priority,
        status: selectedTodo.status,
        dueDate: selectedTodo.dueDate ? selectedTodo.dueDate.substring(0, 10) : '',
        userId: selectedTodo.userId?.toString() || selectedTodo.user?.id?.toString() || '',
      })
    } else {
      setForm({ ...initialState })
    }
  }, [selectedTodo])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const payload = {
      ...form,
      userId: allowUserSelection && form.userId ? Number(form.userId) : undefined,
    }
    onSubmit(payload)
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{selectedTodo ? 'Update todo' : 'Create a new todo'}</h3>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" value={form.description} onChange={handleChange} required />
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
          Status
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
        <label>
          Due date
          <input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
        </label>
        {allowUserSelection && (
          <label>
            Assign to user
            <select name="userId" value={form.userId} onChange={handleChange} required>
              <option value="">Select a user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </label>
        )}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          {selectedTodo && (
            <button className="secondary" type="button" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
          )}
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : selectedTodo ? 'Update todo' : 'Create todo'}
          </button>
        </div>
      </form>
    </div>
  )
}
