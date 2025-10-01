import React, { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

type UserRow = {
  id: number
  fullName: string
  email: string
  role: 'admin' | 'user' | 'team_lead'
  isActive: boolean
}

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'user' as UserRow['role'] })

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get('/api/admin/users')
      setUsers(data)
      setLoading(false)
    }
    if (user?.role === 'admin') {
      load()
    }
  }, [user])

  if (user?.role !== 'admin') {
    return <div className="text-slate-600">You need administrator access to view this page.</div>
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const { data } = await apiClient.post('/api/admin/users', form)
    setUsers((prev) => [data, ...prev])
    setShowForm(false)
    setForm({ fullName: '', email: '', password: '', role: 'user' })
  }

  const toggleActive = async (row: UserRow) => {
    if (row.isActive) {
      await apiClient.post(`/api/admin/users/${row.id}/deactivate`)
    } else {
      await apiClient.post(`/api/admin/users/${row.id}/activate`)
    }
    setUsers((prev) =>
      prev.map((user) => (user.id === row.id ? { ...user, isActive: !user.isActive } : user))
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
        >
          New User
        </button>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {users.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">{row.fullName}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3 capitalize">{row.role.replace('_', ' ')}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      row.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {row.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => toggleActive(row)}
                    className="rounded border border-slate-200 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    {row.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-sm text-slate-500">Loading users...</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Invite User</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-800">
                ✕
              </button>
            </div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-600">Full name</label>
                <input
                  name="fullName"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Email</label>
                <input
                  name="email"
                  type="email"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Temporary password</label>
                <input
                  name="password"
                  type="password"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Role</label>
                <select
                  name="role"
                  className="mt-1 w-full rounded border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="user">User</option>
                  <option value="team_lead">Team Lead</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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

export default AdminUsersPage
