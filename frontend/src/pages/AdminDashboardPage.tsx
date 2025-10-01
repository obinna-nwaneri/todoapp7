import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchUsers, updateUser } from '@/api/users'
import { fetchTodos } from '@/api/todos'
import TodoCard from '@/components/TodoCard'

const AdminDashboardPage: React.FC = () => {
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const todosQuery = useQuery({ queryKey: ['todos', { scope: 'admin' }], queryFn: () => fetchTodos() })
  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  const updateMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'admin' | 'user' }) => updateUser(id, { role }),
    onSuccess: () => {
      toast.success('User updated')
      usersQuery.refetch()
      setEditingUserId(null)
    },
    onError: () => toast.error('Unable to update user'),
  })

  const stats = useMemo(() => {
    const todos = todosQuery.data ?? []
    return {
      totalTodos: todos.length,
      overdue: todos.filter((todo) => todo.status !== 'completed' && todo.dueDate && new Date(todo.dueDate) < new Date()).length,
      highPriority: todos.filter((todo) => todo.priority === 'high').length,
    }
  }, [todosQuery.data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin overview</h1>
        <p className="text-sm text-slate-600">Manage team members, audit tasks, and access AdminJS for advanced controls.</p>
        <a
          href="/admin"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center rounded-lg border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50"
        >
          Open AdminJS panel
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total users</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{usersQuery.data?.length ?? 0}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">High priority todos</p>
          <p className="mt-2 text-2xl font-semibold text-rose-600">{stats.highPriority}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">At risk of delay</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">{stats.overdue}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Team members</h2>
        <p className="mt-1 text-sm text-slate-600">Promote users to administrators or adjust access levels.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 font-medium text-slate-600">Name</th>
                <th className="px-4 py-2 font-medium text-slate-600">Email</th>
                <th className="px-4 py-2 font-medium text-slate-600">Role</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {usersQuery.data?.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-2 text-slate-800">{user.name}</td>
                  <td className="px-4 py-2 text-slate-600">{user.email}</td>
                  <td className="px-4 py-2">
                    <select
                      value={user.role}
                      onChange={(event) => {
                        setEditingUserId(user.id)
                        updateMutation.mutate({ id: user.id, role: event.target.value as 'admin' | 'user' })
                      }}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-2 text-right text-xs text-slate-500">
                    {editingUserId === user.id && updateMutation.isPending ? 'Saving...' : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">All todos</h2>
        <p className="mt-1 text-sm text-slate-600">Monitor high-impact work across the organisation.</p>
        {todosQuery.isLoading ? (
          <p className="mt-4 text-sm text-slate-600">Loading todos...</p>
        ) : todosQuery.data && todosQuery.data.length > 0 ? (
          <div className="mt-4 grid gap-4">
            {todosQuery.data.slice(0, 6).map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">No todos available.</p>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
