import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminPanel from '../components/AdminPanel'
import TodoForm from '../components/TodoForm'

const normalizeTodo = (todo) => ({
  ...todo,
  dueDate: todo.dueDate ?? todo.due_date ?? null,
  userId: todo.userId ?? todo.user_id ?? todo.user?.id,
})

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingTodo, setEditingTodo] = useState(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  const fetchData = async () => {
    setLoading(true)
    setFeedback('')
    try {
      const [usersResponse, todosResponse] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/todos'),
      ])
      setUsers(usersResponse.data)
      setTodos(todosResponse.data.map(normalizeTodo))
    } catch (error) {
      console.error('Failed to fetch admin data', error)
      setFeedback(error.response?.data?.message || 'Unable to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleTodoUpdate = async (formValues) => {
    if (!editingTodo) return
    setSaving(true)
    setFeedback('')
    const payload = {
      ...formValues,
      userId: formValues.userId || editingTodo.user?.id || editingTodo.userId,
      dueDate: formValues.dueDate || null,
    }

    try {
      await api.put(`/admin/todos/${editingTodo.id}`, payload)
      setFeedback('Todo updated successfully.')
      setEditingTodo(null)
      fetchData()
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to update todo.')
    } finally {
      setSaving(false)
    }
  }

  const handleTodoDelete = async (id) => {
    if (!window.confirm('Delete this todo permanently?')) return
    try {
      await api.delete(`/admin/todos/${id}`)
      setFeedback('Todo deleted successfully.')
      fetchData()
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to delete todo.')
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Admin dashboard</h1>
      <p>Monitor all activity across the organization.</p>
      {feedback && <div style={{ marginBottom: '1rem', color: '#1d4ed8', fontWeight: 600 }}>{feedback}</div>}
      {loading ? (
        <div className="card">Loading data…</div>
      ) : (
        <AdminPanel
          users={users}
          todos={todos}
          onRefresh={fetchData}
          onEditTodo={(todo) => setEditingTodo(normalizeTodo(todo))}
          onDeleteTodo={handleTodoDelete}
        />
      )}
      {editingTodo && (
        <TodoForm
          onSubmit={handleTodoUpdate}
          submitting={saving}
          selectedTodo={editingTodo}
          onCancel={() => setEditingTodo(null)}
          users={users}
          allowUserSelection
        />
      )}
    </div>
  )
}
