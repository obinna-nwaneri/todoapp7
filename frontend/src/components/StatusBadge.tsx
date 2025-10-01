import classNames from 'classnames'
import type { TodoPriority, TodoStatus } from '../types'

export function StatusBadge({ status }: { status: TodoStatus }) {
  const labelMap: Record<TodoStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
  }

  const styles = classNames('rounded-full px-3 py-1 text-xs font-medium', {
    'bg-amber-100 text-amber-700': status === 'pending',
    'bg-sky-100 text-sky-700': status === 'in_progress',
    'bg-emerald-100 text-emerald-700': status === 'completed',
  })

  return <span className={styles}>{labelMap[status]}</span>
}

export function PriorityBadge({ priority }: { priority: TodoPriority }) {
  const labelMap: Record<TodoPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  }

  const styles = classNames('rounded-full px-3 py-1 text-xs font-medium', {
    'bg-emerald-100 text-emerald-700': priority === 'low',
    'bg-indigo-100 text-indigo-700': priority === 'medium',
    'bg-rose-100 text-rose-700': priority === 'high',
  })

  return <span className={styles}>{labelMap[priority]}</span>
}
