import { useEffect, useState } from 'react'
import type { AuthUser, Todo } from '../types'
import { useAuth } from '../hooks/useAuth'

type TaskFormProps = {
  users: AuthUser[]
  onSubmit: (payload: Partial<Todo>) => Promise<void>
}

const priorities: Array<{ label: string; value: 'low' | 'medium' | 'high' }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' }
]

export function TaskForm({ users, onSubmit }: TaskFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [assignedUserId, setAssignedUserId] = useState<number | null>(user?.id ?? null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectableUsers = users.length > 0 ? users : user ? [user] : []

  useEffect(() => {
    if (selectableUsers.length === 0) {
      return
    }

    if (assignedUserId && selectableUsers.some((item) => item.id === assignedUserId)) {
      return
    }

    setAssignedUserId(selectableUsers[0]?.id ?? null)
  }, [selectableUsers, assignedUserId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!assignedUserId) {
      setError('Select a user to assign this task to.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        title,
        description,
        due_date: dueDate || null,
        priority,
        status: 'pending',
        assigned_user_id: assignedUserId
      } as Partial<Todo>)
      setTitle('')
      setDescription('')
      setDueDate('')
      setPriority('medium')
      setAssignedUserId(user?.id ?? null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-lg font-semibold text-slate-800">Create a new task</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-600">Title</label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="Enter task title"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-slate-600">Description</label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none"
            placeholder="Provide additional context"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Due date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Priority</label>
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value as 'low' | 'medium' | 'high')}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none"
          >
            {priorities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600">Assign to</label>
          <select
            value={assignedUserId ?? ''}
            onChange={(event) => setAssignedUserId(Number(event.target.value))}
            className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 focus:border-primary focus:outline-none"
            disabled={selectableUsers.length <= 1}
          >
            {selectableUsers.map((item) => (
              <option key={item.id} value={item.id}>
                {item.full_name} ({item.role.replace('_', ' ')})
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-dark disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create task'}
        </button>
      </div>
    </form>
  )
}
