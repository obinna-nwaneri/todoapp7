import { useEffect, useState } from 'react'
import type { AuthUser, Todo } from '@/types'

interface TodoFormValues {
  title: string
  description: string
  dueDate: string
  priority: Todo['priority']
  status: Todo['status']
  userId?: number
}

interface TodoFormProps {
  initialValues?: Partial<Todo>
  onSubmit: (values: TodoFormValues) => void
  submitting?: boolean
  users?: AuthUser[]
  canAssign?: boolean
}

const defaultValues: TodoFormValues = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
}

const TodoForm: React.FC<TodoFormProps> = ({ initialValues, onSubmit, submitting, users, canAssign }) => {
  const [values, setValues] = useState<TodoFormValues>(defaultValues)

  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        dueDate: initialValues.dueDate ?? '',
        priority: initialValues.priority ?? 'medium',
        status: initialValues.status ?? 'pending',
        userId: initialValues.userId,
      })
    }
  }, [initialValues])

  const handleChange = (field: keyof TodoFormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = event.target.type === 'number' ? Number(event.target.value) : event.target.value
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(values)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input
          type="text"
          required
          value={values.title}
          onChange={handleChange('title')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={3}
          value={values.description}
          onChange={handleChange('description')}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Due date</label>
          <input
            type="date"
            value={values.dueDate}
            onChange={handleChange('dueDate')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={values.priority}
            onChange={handleChange('priority')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Status</label>
          <select
            value={values.status}
            onChange={handleChange('status')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      {canAssign && users && (
        <div>
          <label className="block text-sm font-medium text-slate-700">Assign to user</label>
          <select
            value={values.userId ?? ''}
            onChange={handleChange('userId')}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select user</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? 'Saving...' : 'Save Todo'}
        </button>
      </div>
    </form>
  )
}

export default TodoForm
