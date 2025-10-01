import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import type { TodoPayload, TodoPriority, TodoStatus } from '../types'

interface TodoFormProps {
  initialValues?: Partial<TodoPayload>
  onSubmit: (values: TodoPayload) => Promise<unknown> | void
  onCancel: () => void
  isSubmitting?: boolean
  includeStatus?: boolean
}

const defaultValues: TodoPayload = {
  title: '',
  description: '',
  dueDate: null,
  priority: 'medium',
  status: 'pending',
}

export function TodoForm({ initialValues, onSubmit, onCancel, isSubmitting, includeStatus = true }: TodoFormProps) {
  const [values, setValues] = useState<TodoPayload>(defaultValues)

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
      dueDate: initialValues?.dueDate ?? null,
      priority: initialValues?.priority ?? 'medium',
      status: initialValues?.status ?? 'pending',
    })
  }, [initialValues])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setValues((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!values.title) return

    const payload: TodoPayload = {
      title: values.title,
      description: values.description ?? null,
      dueDate: values.dueDate ?? null,
      priority: (values.priority ?? 'medium') as TodoPriority,
      status: (values.status ?? 'pending') as TodoStatus,
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          value={values.title ?? ''}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="Enter todo title"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description ?? ''}
          onChange={handleChange}
          rows={3}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          placeholder="Add more details (optional)"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="block text-sm font-medium text-slate-700" htmlFor="dueDate">
            Due date
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            value={values.dueDate ? values.dueDate.slice(0, 10) : ''}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={values.priority ?? 'medium'}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {includeStatus && (
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={values.status ?? 'pending'}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-75"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
}
