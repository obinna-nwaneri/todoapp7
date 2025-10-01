import type { FormEvent } from 'react'
import { useEffect, useState } from 'react'
import type { UpdateUserPayload, UserRole } from '../types'

interface UserFormProps {
  initialValues?: Partial<UpdateUserPayload & { name: string; email: string; role: UserRole }>
  onSubmit: (values: UpdateUserPayload) => Promise<unknown> | void
  onCancel: () => void
  isSubmitting?: boolean
  allowRoleEdit?: boolean
}

const defaultValues = {
  name: '',
  email: '',
  role: 'user' as UserRole,
  password: '',
}

export function UserForm({ initialValues, onSubmit, onCancel, isSubmitting, allowRoleEdit = true }: UserFormProps) {
  const [values, setValues] = useState(defaultValues)

  useEffect(() => {
    setValues({
      ...defaultValues,
      ...initialValues,
      role: initialValues?.role ?? 'user',
      password: '',
    })
  }, [initialValues])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    const payload: UpdateUserPayload = {
      name: values.name,
      email: values.email,
    }

    if (values.password) {
      payload.password = values.password
    }

    if (allowRoleEdit) {
      payload.role = values.role
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
      </div>
      {allowRoleEdit && (
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="role">
            Role
          </label>
          <select
            id="role"
            name="role"
            value={values.role}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="password">
          Temporary password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="Leave blank to keep existing password"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
        />
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
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
