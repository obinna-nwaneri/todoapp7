import type { DashboardSummary } from '../types'

const LABELS: Record<string, string> = {
  totalTasks: 'Total Tasks',
  completedTasks: 'Completed',
  inProgressTasks: 'In Progress',
  pendingTasks: 'Pending',
  activeUsers: 'Active Users'
}

export function StatsGrid({ summary }: { summary: DashboardSummary | null }) {
  if (!summary) {
    return null
  }

  const entries = Object.entries(summary).filter(([key]) => key in LABELS)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-slate-500">{LABELS[key]}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{value as number}</p>
        </div>
      ))}
    </div>
  )
}
