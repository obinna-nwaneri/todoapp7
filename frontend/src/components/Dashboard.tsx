import { FormEvent, useEffect, useMemo, useState } from 'react'
import { DateTime } from 'luxon'

import {
  createTodo,
  deleteTodo,
  fetchTodos,
  fetchUsers,
  logout,
  updateTodo,
  type CreateTodoInput,
  type TodoFilters,
} from '../api/client'
import type { Todo, TodoPriority, TodoStatus, UserSummary } from '../types'

const STATUS_LABELS: Record<TodoStatus, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  blocked: 'Blocked',
}

const PRIORITY_LABELS: Record<TodoPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const PRIORITY_COLORS: Record<TodoPriority, string> = {
  low: '#10b981',
  medium: '#3b82f6',
  high: '#f97316',
  critical: '#ef4444',
}

interface DashboardProps {
  token: string
  currentUser: UserSummary
  onLoggedOut: () => void
}

const formatDate = (value: string | null) => {
  if (!value) {
    return 'No due date'
  }

  const date = DateTime.fromISO(value)
  if (!date.isValid) {
    return 'No due date'
  }

  return date.toFormat('MMM d, yyyy')
}

const computeCountdown = (value: string | null) => {
  if (!value) {
    return null
  }
  const date = DateTime.fromISO(value)
  if (!date.isValid) {
    return null
  }
  const diff = date.startOf('day').diff(DateTime.now().startOf('day'), 'days').days
  if (diff === undefined) {
    return null
  }
  if (diff === 0) {
    return 'Due today'
  }
  if (diff > 0) {
    return `Due in ${Math.round(diff)} day${Math.round(diff) === 1 ? '' : 's'}`
  }
  return `Overdue by ${Math.abs(Math.round(diff))} day${Math.abs(Math.round(diff)) === 1 ? '' : 's'}`
}

export function Dashboard({ token, currentUser, onLoggedOut }: DashboardProps) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [users, setUsers] = useState<UserSummary[]>([])
  const [filters, setFilters] = useState<TodoFilters>({
    status: 'all',
    priority: 'all',
    assignedToId: 'me',
    search: '',
  })
  const [loadingTodos, setLoadingTodos] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<Pick<CreateTodoInput, 'title' | 'description' | 'priority' | 'dueDate' | 'assignedToId'>>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: null,
    assignedToId: null,
  })

  const loadUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetchUsers(token)
      setUsers(response)
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      }
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadTodos = async (activeFilters: TodoFilters = filters) => {
    setLoadingTodos(true)
    try {
      const response = await fetchTodos(token, activeFilters)
      setTodos(response)
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      }
    } finally {
      setLoadingTodos(false)
    }
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  useEffect(() => {
    void loadTodos(filters)
  }, [filters])

  const handleFilterChange = (partial: Partial<TodoFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...partial,
    }))
  }

  const handleCreateTodo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setCreateError('Title is required')
      return
    }

    setIsSubmitting(true)
    setCreateError(null)

    try {
      await createTodo(token, {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        priority: form.priority,
        dueDate: form.dueDate || null,
        assignedToId: form.assignedToId ?? (filters.assignedToId === 'me' ? currentUser.id : null),
      })
      setForm({ title: '', description: '', priority: 'medium', dueDate: null, assignedToId: null })
      await loadTodos()
    } catch (requestError) {
      if (requestError instanceof Error) {
        setCreateError(requestError.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (todo: Todo, status: TodoStatus) => {
    try {
      await updateTodo(token, todo.id, { status })
      await loadTodos()
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      }
    }
  }

  const handleDelete = async (todo: Todo) => {
    if (!window.confirm(`Delete "${todo.title}"?`)) {
      return
    }

    try {
      await deleteTodo(token, todo.id)
      await loadTodos()
    } catch (requestError) {
      if (requestError instanceof Error) {
        setError(requestError.message)
      }
    }
  }

  const handleLogout = async () => {
    try {
      await logout(token)
    } catch (requestError) {
      // ignore logout errors, token may already be invalid
      console.warn('Logout failed', requestError)
    } finally {
      onLoggedOut()
    }
  }

  const summary = useMemo(() => {
    const open = todos.filter((todo) => todo.status !== 'completed').length
    const completed = todos.filter((todo) => todo.status === 'completed').length
    const dueSoon = todos.filter((todo) => {
      if (!todo.dueDate || todo.status === 'completed') {
        return false
      }
      const date = DateTime.fromISO(todo.dueDate)
      return date.isValid && date.diffNow('days').days <= 7
    }).length
    const myQueue = todos.filter((todo) => todo.assignedToId === currentUser.id && todo.status !== 'completed').length

    return { open, completed, dueSoon, myQueue }
  }, [todos, currentUser.id])

  const teamLoad = useMemo(() => {
    if (!users.length) {
      return []
    }
    return users
      .map((user) => ({
        user,
        assigned: todos.filter((todo) => todo.assignedToId === user.id && todo.status !== 'completed').length,
      }))
      .sort((a, b) => b.assigned - a.assigned)
      .slice(0, 3)
  }, [users, todos])

  return (
    <div className="app-shell">
      <header style={{ background: '#312e81', color: '#ffffff', padding: '1.4rem 0' }}>
        <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>Enterprise Todo Hub</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 600 }}>Executive Control Center</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600 }}>{currentUser.fullName ?? currentUser.email}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.75 }}>{currentUser.email}</div>
            </div>
            <button className="button secondary" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="page-container" style={{ display: 'grid', gap: '2rem' }}>
        {error && (
          <div className="card muted-card" style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#b91c1c' }}>
            {error}
          </div>
        )}

        <section className="grid two-column">
          <div className="card" style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
                My workspace
              </h2>
              <p className="text-muted" style={{ margin: 0 }}>
                Monitor enterprise deliverables and keep your team aligned.
              </p>
            </div>

            <div className="grid two-column">
              <div className="card muted-card">
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Open initiatives
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{summary.open}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Active items across the organisation
                </div>
              </div>
              <div className="card muted-card" style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.3)' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Completed
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{summary.completed}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Deliverables closed to date
                </div>
              </div>
              <div className="card muted-card" style={{ background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.28)' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  Due soon
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{summary.dueSoon}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Items due within the next 7 days
                </div>
              </div>
              <div className="card muted-card" style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.28)' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  In my queue
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>{summary.myQueue}</div>
                <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                  Assigned items awaiting your review
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Create an initiative</h2>
              <p className="text-muted" style={{ margin: 0 }}>
                Capture upcoming deliverables for your enterprise teams.
              </p>
            </div>

            <form onSubmit={handleCreateTodo} style={{ display: 'grid', gap: '1rem' }}>
              <div className="field">
                <label htmlFor="title">Title</label>
                <input
                  id="title"
                  name="title"
                  placeholder="Define the work to deliver"
                  value={form.title}
                  onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                />
              </div>
              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Add context, milestones, or expectations"
                  value={form.description ?? ''}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
              <div className="tablet-stack">
                <div className="field">
                  <label htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, priority: event.target.value as TodoPriority }))
                    }
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="dueDate">Due date</label>
                  <input
                    id="dueDate"
                    type="date"
                    value={form.dueDate ?? ''}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, dueDate: event.target.value || null }))
                    }
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="assignee">Assign to</label>
                <select
                  id="assignee"
                  value={form.assignedToId ?? ''}
                  onChange={(event) => {
                    const value = event.target.value
                    setForm((prev) => ({
                      ...prev,
                      assignedToId: value ? Number(value) : null,
                    }))
                  }}
                >
                  <option value="">Auto (based on filters)</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName ?? user.email}
                    </option>
                  ))}
                </select>
              </div>

              {createError && (
                <div className="card muted-card" style={{ padding: '0.75rem', color: '#b91c1c' }}>
                  {createError}
                </div>
              )}

              <button className="button primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Add initiative'}
              </button>
            </form>
          </div>
        </section>

        <section className="card" style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="tablet-stack" style={{ alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Initiative tracker</h2>
              <p className="text-muted" style={{ margin: 0 }}>
                Filter by status, priority, and ownership to focus on what matters most.
              </p>
            </div>
            <div className="tablet-stack" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="field" style={{ minWidth: '150px' }}>
                <label htmlFor="filter-status">Status</label>
                <select
                  id="filter-status"
                  value={filters.status ?? 'all'}
                  onChange={(event) => handleFilterChange({ status: event.target.value as TodoStatus | 'all' })}
                >
                  <option value="all">All</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ minWidth: '150px' }}>
                <label htmlFor="filter-priority">Priority</label>
                <select
                  id="filter-priority"
                  value={filters.priority ?? 'all'}
                  onChange={(event) => handleFilterChange({ priority: event.target.value as TodoPriority | 'all' })}
                >
                  <option value="all">All</option>
                  {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ minWidth: '180px' }}>
                <label htmlFor="filter-assignee">Owner</label>
                <select
                  id="filter-assignee"
                  value={filters.assignedToId ?? 'all'}
                  onChange={(event) => handleFilterChange({ assignedToId: event.target.value })}
                >
                  <option value="all">Entire organisation</option>
                  <option value="me">Assigned to me</option>
                  <option value="unassigned">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={String(user.id)}>
                      {user.fullName ?? user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field" style={{ minWidth: '200px' }}>
                <label htmlFor="filter-search">Search</label>
                <input
                  id="filter-search"
                  placeholder="Search titles or descriptions"
                  value={filters.search ?? ''}
                  onChange={(event) => handleFilterChange({ search: event.target.value })}
                />
              </div>
            </div>
          </div>

          {loadingTodos ? (
            <div className="empty-state">Loading initiatives…</div>
          ) : todos.length === 0 ? (
            <div className="empty-state">
              No initiatives match the selected filters. Try adjusting the criteria or add a new item above.
            </div>
          ) : (
            <div className="grid" style={{ gap: '1rem' }}>
              {todos.map((todo) => {
                const countdown = computeCountdown(todo.dueDate)
                const priorityColor = PRIORITY_COLORS[todo.priority]

                return (
                  <div key={todo.id} className="card todo-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem' }}>{todo.title}</h3>
                        {todo.description && (
                          <p className="text-muted" style={{ margin: '0.5rem 0 0' }}>
                            {todo.description}
                          </p>
                        )}
                      </div>
                      <span className="status-tag" style={{ background: 'rgba(15,23,42,0.05)', color: '#0f172a' }}>
                        <span
                          className="priority-dot"
                          style={{ background: priorityColor, boxShadow: `0 0 0 4px ${priorityColor}22` }}
                        />
                        {PRIORITY_LABELS[todo.priority]}
                      </span>
                    </div>

                    <div className="chip-group">
                      <span className="chip">{STATUS_LABELS[todo.status]}</span>
                      <span className="chip">{formatDate(todo.dueDate)}</span>
                      {countdown && <span className="chip">{countdown}</span>}
                      <span className="chip">
                        Owner: {todo.assignee?.fullName ?? todo.assignee?.email ?? 'Not assigned'}
                      </span>
                      <span className="chip">
                        Created by: {todo.creator?.fullName ?? todo.creator?.email ?? 'Unknown'}
                      </span>
                    </div>

                    <div className="todo-actions">
                      <select
                        value={todo.status}
                        onChange={(event) => handleStatusChange(todo, event.target.value as TodoStatus)}
                      >
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      <button className="button secondary" onClick={() => handleDelete(todo)}>
                        Remove
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="card" style={{ display: 'grid', gap: '1.2rem' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Team bandwidth</h2>
            <p className="text-muted" style={{ margin: 0 }}>
              Track who has the heaviest workload and plan resource allocation proactively.
            </p>
          </div>

          {loadingUsers ? (
            <div className="empty-state">Loading team insights…</div>
          ) : teamLoad.length === 0 ? (
            <div className="empty-state">Invite teammates to see allocation insights.</div>
          ) : (
            <div className="grid" style={{ gap: '0.75rem' }}>
              {teamLoad.map(({ user, assigned }) => (
                <div key={user.id} className="card muted-card" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.fullName ?? user.email}</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                      {user.email}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.4rem' }}>{assigned}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      Active items
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
