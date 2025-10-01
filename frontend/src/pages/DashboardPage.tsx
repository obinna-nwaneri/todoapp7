import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { StatsGrid } from '../components/StatsGrid'
import { TaskForm } from '../components/TaskForm'
import { TaskList } from '../components/TaskList'
import { useAuth } from '../hooks/useAuth'
import {
  createTodo,
  deleteTodo,
  fetchDashboard,
  fetchTodos,
  fetchUsers,
  updateTodo
} from '../services/api'
import type { AuthUser, DashboardSummary, Todo } from '../types'

export default function DashboardPage() {
  const { user, token, loading } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [availableUsers, setAvailableUsers] = useState<AuthUser[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const canAssignOthers = useMemo(
    () => user?.role === 'admin' || user?.role === 'team_lead',
    [user?.role]
  )

  useEffect(() => {
    if (!token) {
      return
    }

    let isMounted = true
    setIsBusy(true)
    setError(null)

    Promise.all([
      fetchDashboard(token),
      fetchTodos(token),
      canAssignOthers ? fetchUsers(token) : Promise.resolve(user ? [user] : [])
    ])
      .then(([dashboard, fetchedTodos, fetchedUsers]) => {
        if (!isMounted) return
        setSummary(dashboard)
        setTodos(fetchedTodos)
        setAvailableUsers(fetchedUsers)
      })
      .catch((err) => {
        if (!isMounted) return
        setError((err as Error).message)
      })
      .finally(() => {
        if (isMounted) {
          setIsBusy(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [token, canAssignOthers, user])

  const refreshDashboard = async () => {
    if (!token) return
    const dashboard = await fetchDashboard(token)
    setSummary(dashboard)
  }

  const handleCreate = async (payload: Partial<Todo>) => {
    if (!token) return
    setIsBusy(true)
    setError(null)
    try {
      const created = await createTodo(token, payload)
      setTodos((prev) => [created, ...prev])
      await refreshDashboard()
    } catch (err) {
      setError((err as Error).message)
      console.error(err)
    } finally {
      setIsBusy(false)
    }
  }

  const handleStatusChange = async (todo: Todo, status: Todo['status']) => {
    if (!token) return
    setIsBusy(true)
    setError(null)
    try {
      const updated = await updateTodo(token, todo.id, { status })
      setTodos((prev) => prev.map((item) => (item.id === todo.id ? updated : item)))
      await refreshDashboard()
    } catch (err) {
      setError((err as Error).message)
      console.error(err)
    } finally {
      setIsBusy(false)
    }
  }

  const handleDelete = async (todo: Todo) => {
    if (!token) return
    setIsBusy(true)
    setError(null)
    try {
      await deleteTodo(token, todo.id)
      setTodos((prev) => prev.filter((item) => item.id !== todo.id))
      await refreshDashboard()
    } catch (err) {
      setError((err as Error).message)
      console.error(err)
    } finally {
      setIsBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Loading workspace…</p>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-slate-500">Session expired. Please sign in again.</p>
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500">
              Track assignments, priorities, and status updates across your organization.
            </p>
          </div>
          {isBusy && <span className="text-sm text-primary">Syncing data…</span>}
        </div>

        {error && <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</div>}

        <StatsGrid summary={summary} />

        <TaskForm users={availableUsers} onSubmit={handleCreate} />

        <TaskList todos={todos} onStatusChange={handleStatusChange} onDelete={handleDelete} />

        <div className="rounded-lg bg-white p-4 text-sm text-slate-500 shadow">
          <p>
            <strong>Admin console:</strong> Visit the AdminJS interface at{' '}
            <code>http://localhost:3334/admin</code> and sign in with the credentials
            provided in the README to manage roles and deactivate accounts.
          </p>
        </div>
      </div>
    </Layout>
  )
}
