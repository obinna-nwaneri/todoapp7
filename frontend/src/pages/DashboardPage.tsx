import React, { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { useAuth } from '../context/AuthContext'

type AdminStats = {
  overview: {
    users: number
    inProgress: number
    completed: number
    overdue: number
  }
}

type UserStats = {
  overview: Record<string, number>
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<AdminStats | UserStats | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await apiClient.get('/api/dashboard')
      setStats(data)
    }
    load()
  }, [])

  if (!stats) {
    return <div>Loading dashboard...</div>
  }

  if (user?.role === 'admin') {
    const adminStats = stats as AdminStats
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Users', value: adminStats.overview.users },
          { label: 'In Progress', value: adminStats.overview.inProgress },
          { label: 'Completed', value: adminStats.overview.completed },
          { label: 'Overdue', value: adminStats.overview.overdue },
        ].map((item) => (
          <div key={item.label} className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm uppercase text-slate-500">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{item.value}</p>
          </div>
        ))}
      </div>
    )
  }

  const overview = (stats as UserStats).overview

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">My Task Summary</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        {Object.entries(overview).map(([key, value]) => (
          <div key={key} className="rounded-lg bg-white p-6 shadow">
            <p className="text-sm uppercase text-slate-500">{key.replace('_', ' ')}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
