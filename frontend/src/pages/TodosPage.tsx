import React, { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

type Todo = {
  id: number
  title: string
  description?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  userId?: number
}

const statusLabels: Record<Todo['status'], string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const priorityLabels: Record<Todo['priority'], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const TodosPage: React.FC = () => {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Todo | null>(null)

  const initialForm: Todo = {
    id: 0,
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
  }

  const [form, setForm] = useState<Todo>(initialForm)

  const canAssign = useMemo(() => user?.role === 'admin' || user?.role === 'team_lead', [user])

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get('/api/todos')
      setTodos(data)
      setLoading(false)
    }
    load()
  }, [])

  const openCreate = () => {
    setForm(initialForm)
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (todo: Todo) => {
    setEditing(todo)
    setForm({ ...todo })
    setFormOpen(true)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: form.status,
      dueDate: form.dueDate ? form.dueDate : undefined,
      userId: form.userId ? Number(form.userId) : undefined,
    }
    if (editing) {
      const { data } = await apiClient.put(`/api/todos/${editing.id}`, payload)
      setTodos((prev) => prev.map((item) => (item.id === data.id ? data : item)))
    } else {
      const { data } = await apiClient.post('/api/todos', payload)
      setTodos((prev) => [data, ...prev])
    }
    setFormOpen(false)
  }

  const handleDelete = async (id: number) => {
    await apiClient.delete(`/api/todos/${id}`)
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  if (loading) {
    return <div>Loading tasks...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">My Tasks</h1>
        <button
          onClick={openCreate}
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          New Task
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {todos.map((todo) => (
              <tr key={todo.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{todo.title}</p>
                  {todo.description && <p className="text-xs text-slate-500">{todo.description}</p>}
                </td>
                <td className="px-4 py-3">{priorityLabels[todo.priority]}</td>
                <td className="px-4 py-3">{statusLabels[todo.status]}</td>
                <td className="px-4 py-3">{todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(todo)}
                      className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editing ? 'Edit Task' : 'Create Task'}
              </h2>
              <button onClick={() => setFormOpen(false)} className="text-slate-500 hover:text-slate-800">
                ✕
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-600">Title</label>
                <input
                  name="title"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Description</label>
                <textarea
                  name="description"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-600">Priority</label>
                  <select
                    name="priority"
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600">Status</label>
                  <select
                    name="status"
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              {canAssign && (
                <div>
                  <label className="block text-sm font-medium text-slate-600">Assign to user ID</label>
                  <input
                    name="userId"
                    type="number"
                    className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                    value={form.userId ?? ''}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-600">Due date</label>
                <input
                  name="dueDate"
                  type="date"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.dueDate ? form.dueDate.substring(0, 10) : ''}
                  onChange={handleChange}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="rounded border border-slate-200 px-4 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TodosPage
