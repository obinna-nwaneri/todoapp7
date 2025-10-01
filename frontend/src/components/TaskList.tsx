import type { Todo } from '../types'
import { useAuth } from '../hooks/useAuth'

const STATUS_OPTIONS: Array<{ label: string; value: Todo['status'] }> = [
  { label: 'Pending', value: 'pending' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' }
]

const PRIORITY_BADGE: Record<Todo['priority'], string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700'
}

type TaskListProps = {
  todos: Todo[]
  onStatusChange: (todo: Todo, status: Todo['status']) => Promise<void>
  onDelete: (todo: Todo) => Promise<void>
}

export function TaskList({ todos, onStatusChange, onDelete }: TaskListProps) {
  const { user } = useAuth()
  const canManageAll = user?.role === 'admin' || user?.role === 'team_lead'

  if (todos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500">
        No tasks yet. Create one to get started.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Due</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {todos.map((todo) => {
            const canUpdate = canManageAll || todo.assigned_user_id === user?.id

            return (
              <tr key={todo.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 align-top">
                  <p className="font-medium text-slate-800">{todo.title}</p>
                  {todo.description && (
                    <p className="mt-1 text-sm text-slate-500">{todo.description}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${PRIORITY_BADGE[todo.priority]}`}>
                    {todo.priority.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {todo.assignedUser?.full_name ?? `User #${todo.assigned_user_id}`}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  <select
                    value={todo.status}
                    onChange={(event) => onStatusChange(todo, event.target.value as Todo['status'])}
                    disabled={!canUpdate}
                    className="rounded-md border border-slate-200 px-2 py-1 text-sm focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {todo.due_date ? new Date(todo.due_date).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDelete(todo)}
                    disabled={!canUpdate}
                    className="rounded-md border border-red-200 px-3 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
