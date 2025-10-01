import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { TodoCard } from '../components/TodoCard'
import { Modal } from '../components/Modal'
import { TodoForm } from '../components/TodoForm'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { InlineAlert } from '../components/InlineAlert'
import { createTodo, deleteTodo, getTodos, updateTodo } from '../api/todos'
import type { Todo } from '../types'
import { getErrorMessage } from '../utils/errors'

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const priorityOptions = [
  { value: 'all', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function Dashboard() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null)

  const filters = useMemo(() => {
    const params: Record<string, string> = {}
    if (statusFilter !== 'all') params.status = statusFilter
    if (priorityFilter !== 'all') params.priority = priorityFilter
    return params
  }, [statusFilter, priorityFilter])

  const todosQuery = useQuery({
    queryKey: ['todos', filters],
    queryFn: () => getTodos(filters),
  })

  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Todo created')
      setIsCreateOpen(false)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to create todo')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateTodo>[1] }) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Todo updated')
      setEditingTodo(null)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to update todo')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Todo deleted')
      setDeletingTodo(null)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to delete todo')),
  })

  const todos = todosQuery.data ?? []
  const isEmpty = !todosQuery.isLoading && todos.length === 0

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">My Todos</h2>
            <p className="text-sm text-slate-600">Filter and manage your tasks.</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            Add todo
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Priority</label>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {todosQuery.isError && <InlineAlert variant="error" message={getErrorMessage(todosQuery.error)} />}

      {todosQuery.isLoading ? (
        <LoadingSpinner />
      ) : isEmpty ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          You have no todos yet. Get started by creating one.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onEdit={setEditingTodo}
              onDelete={setDeletingTodo}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create todo"
        footer={null}
      >
        <TodoForm
          onSubmit={(values) => createMutation.mutateAsync(values)}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={createMutation.isPending}
          includeStatus={false}
        />
      </Modal>

      <Modal
        isOpen={Boolean(editingTodo)}
        onClose={() => setEditingTodo(null)}
        title="Edit todo"
        footer={null}
      >
        {editingTodo && (
          <TodoForm
            initialValues={{
              title: editingTodo.title,
              description: editingTodo.description ?? '',
              dueDate: editingTodo.dueDate,
              priority: editingTodo.priority,
              status: editingTodo.status,
            }}
            onSubmit={(values) => updateMutation.mutateAsync({ id: editingTodo.id, data: values })}
            onCancel={() => setEditingTodo(null)}
            isSubmitting={updateMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(deletingTodo)}
        onClose={() => setDeletingTodo(null)}
        title="Delete todo"
        footer={null}
      >
        {deletingTodo && (
          <div className="space-y-6">
            <InlineAlert variant="error" message="This action cannot be undone." />
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold">{deletingTodo.title}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingTodo(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingTodo.id)}
                disabled={deleteMutation.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
