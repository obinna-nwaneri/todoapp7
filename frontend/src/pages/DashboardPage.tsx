import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchTodos, deleteTodo } from '@/api/todos'
import { fetchUsers } from '@/api/users'
import TodoCard from '@/components/TodoCard'
import DeleteModal from '@/components/DeleteModal'
import { useAuth } from '@/hooks/useAuth'
import type { Todo } from '@/types'

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState({ status: 'all', priority: 'all', userId: 'all' })
  const [selected, setSelected] = useState<Todo | null>(null)

  const todosQuery = useQuery({
    queryKey: ['todos', filters],
    queryFn: () =>
      fetchTodos({
        status: filters.status !== 'all' ? filters.status : undefined,
        priority: filters.priority !== 'all' ? filters.priority : undefined,
        userId: filters.userId !== 'all' ? Number(filters.userId) : undefined,
      }),
  })

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: isAdmin,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      toast.success('Todo deleted')
      setSelected(null)
      todosQuery.refetch()
    },
    onError: () => toast.error('Unable to delete todo'),
  })

  const summary = useMemo(() => {
    const list = todosQuery.data ?? []
    return {
      total: list.length,
      completed: list.filter((todo) => todo.status === 'completed').length,
      upcoming: list.filter((todo) => todo.status !== 'completed').length,
    }
  }, [todosQuery.data])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Your Todos</h1>
          <p className="text-sm text-slate-600">Track progress, adjust priorities, and stay ahead of deadlines.</p>
        </div>
        <button
          onClick={() => navigate('/todos/new')}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Create todo
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Total todos</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.total}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-600">{summary.completed}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">In progress</p>
          <p className="mt-2 text-2xl font-semibold text-sky-600">{summary.upcoming}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={filters.status}
              onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Priority</label>
            <select
              value={filters.priority}
              onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-slate-700">Owner</label>
              <select
                value={filters.userId}
                onChange={(event) => setFilters((prev) => ({ ...prev, userId: event.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="all">All users</option>
                {usersQuery.data?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {todosQuery.isLoading ? (
        <p className="text-sm text-slate-600">Loading todos...</p>
      ) : todosQuery.data && todosQuery.data.length > 0 ? (
        <div className="grid gap-4">
          {todosQuery.data.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={() => navigate(`/todos/${todo.id}/edit`)}
              onDelete={() => setSelected(todo)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No todos found. Create your first task to get started.
        </div>
      )}

      <DeleteModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirm={() => selected && deleteMutation.mutate(selected.id)}
        loading={deleteMutation.isPending}
        title="Delete todo"
        description={`Are you sure you want to delete "${selected?.title}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default DashboardPage
