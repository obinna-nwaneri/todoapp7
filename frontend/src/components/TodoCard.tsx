import { formatDate, formatDateTime } from '../utils/date'
import type { Todo } from '../types'
import { PriorityBadge, StatusBadge } from './StatusBadge'

interface TodoCardProps {
  todo: Todo
  onEdit?: (todo: Todo) => void
  onDelete?: (todo: Todo) => void
  showOwner?: boolean
}

export function TodoCard({ todo, onEdit, onDelete, showOwner }: TodoCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{todo.title}</h3>
          {todo.description && <p className="mt-1 text-sm text-slate-600">{todo.description}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span>Due: {formatDate(todo.dueDate)}</span>
            <span>Updated: {formatDateTime(todo.updatedAt)}</span>
            {showOwner && todo.user && <span>Owner: {todo.user.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={todo.status} />
          <PriorityBadge priority={todo.priority} />
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {onEdit && (
            <button
              onClick={() => onEdit(todo)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(todo)}
              className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}
