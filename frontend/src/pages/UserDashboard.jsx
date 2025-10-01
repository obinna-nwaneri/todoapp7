import { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../hooks/useAuth'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'

const normalizeTodo = (todo) => ({
  ...todo,
  dueDate: todo.dueDate ?? todo.due_date ?? null,
  userId: todo.userId ?? todo.user_id,
})

export default function UserDashboard() {
  const { user } = useAuth()
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState(null)
  const [feedback, setFeedback] = useState('')

  const fetchTodos = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/todos')
      setTodos(data.map(normalizeTodo))
    } catch (error) {
      console.error('Failed to fetch todos', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  const handleSubmit = async (formValues) => {
    setSaving(true)
    setFeedback('')
    const payload = { ...formValues, dueDate: formValues.dueDate || null }
    try {
      if (selectedTodo) {
        await api.put(`/todos/${selectedTodo.id}`, payload)
        setFeedback('Todo updated successfully.')
      } else {
        await api.post('/todos', payload)
        setFeedback('Todo created successfully.')
      }
      setSelectedTodo(null)
      fetchTodos()
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Something went wrong, please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this todo?')) return
    try {
      await api.delete(`/todos/${id}`)
      setFeedback('Todo removed successfully.')
      fetchTodos()
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Failed to delete todo.')
    }
  }

  return (
    <div>
      <h1 style={{ marginTop: 0 }}>Dashboard</h1>
      <p>Manage your work effortlessly. Signed in as {user?.name}.</p>
      {feedback && <div style={{ marginBottom: '1rem', color: '#1d4ed8', fontWeight: 600 }}>{feedback}</div>}
      <TodoForm
        onSubmit={handleSubmit}
        submitting={saving}
        selectedTodo={selectedTodo}
        onCancel={() => setSelectedTodo(null)}
      />
      {loading ? (
        <div className="card">Loading todos…</div>
      ) : (
        <TodoList
          todos={todos}
          onEdit={(todo) => setSelectedTodo(normalizeTodo(todo))}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
