import dayjs from 'dayjs'
import clsx from 'clsx'
import type { Todo } from '@/types'

interface TodoCardProps {
  todo: Todo
  onEdit?: (todo: Todo) => void
  onDelete?: (todo: Todo) => void
}

const priorityStyles: Record<Todo['priority'], string> = {
  low: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
}

const statusStyles: Record<Todo['status'], string> = {
  pending: 'bg-slate-200 text-slate-700',
  in_progress: 'bg-sky-100 text-sky-700',
  completed: 'bg-emerald-100 text-emerald-700',
}

const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit, onDelete }) => {
  const due = todo.dueDate ? dayjs(todo.dueDate).format('MMM D, YYYY') : 'No due date'
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{todo.title}</h3>
          {todo.description && <p className="mt-1 text-sm text-slate-600">{todo.description}</p>}
        </div>
        <div className="flex items-center gap-2">
          <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', priorityStyles[todo.priority])}>
            {todo.priority.toUpperCase()}
          </span>
          <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', statusStyles[todo.status])}>
            {todo.status.replace('_', ' ')}
          </span>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Due: {due}</span>
        <div className="flex gap-3">
          {onEdit && (
            <button onClick={() => onEdit(todo)} className="text-primary-600 hover:text-primary-700">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(todo)} className="text-rose-600 hover:text-rose-700">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default TodoCard
