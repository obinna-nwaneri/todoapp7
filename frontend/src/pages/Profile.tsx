import type { FormEvent } from 'react'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { updateProfile } from '../api/profile'
import { InlineAlert } from '../components/InlineAlert'
import { getErrorMessage } from '../utils/errors'

export function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
  })

  const mutation = useMutation({
    mutationFn: () => updateProfile({
      name: form.name,
      email: form.email,
      password: form.password || undefined,
    }),
    onSuccess: (updatedUser) => {
      setUser(updatedUser)
      toast.success('Profile updated')
      setForm((prev) => ({ ...prev, password: '' }))
    },
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
      <p className="text-sm text-slate-600">Update your account information.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {mutation.isError && <InlineAlert variant="error" message={getErrorMessage(mutation.error)} />}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
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
              value={form.email}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            />
          </div>
        </div>
        <div className="max-w-md">
          <label className="block text-sm font-medium text-slate-700" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Leave blank to keep existing password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-75"
        >
          {mutation.isPending ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}
