import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { getUsers, updateUser, deleteUser } from '../api/users'
import { getTodos, updateTodo, deleteTodo } from '../api/todos'
import { TodoCard } from '../components/TodoCard'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { InlineAlert } from '../components/InlineAlert'
import { Modal } from '../components/Modal'
import { UserForm } from '../components/UserForm'
import { TodoForm } from '../components/TodoForm'
import type { Todo, UserWithStats } from '../types'
import { getErrorMessage } from '../utils/errors'

export function AdminDashboard() {
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<UserWithStats | null>(null)
  const [userToDelete, setUserToDelete] = useState<UserWithStats | null>(null)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null)

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: getUsers })
  const todosQuery = useQuery({ queryKey: ['todos', { scope: 'admin' }], queryFn: () => getTodos() })

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateUser>[1] }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User updated')
      setSelectedUser(null)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to update user')),
  })

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User removed')
      setUserToDelete(null)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to delete user')),
  })

  const updateTodoMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateTodo>[1] }) => updateTodo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Todo updated')
      setSelectedTodo(null)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to update todo')),
  })

  const deleteTodoMutation = useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      toast.success('Todo deleted')
      setTodoToDelete(null)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Unable to delete todo')),
  })

  const users = usersQuery.data ?? []
  const todos = todosQuery.data ?? []

  return (
    <div className="space-y-8">
      <section className="rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-slate-900">Users</h2>
        <p className="text-sm text-slate-600">Manage accounts and view activity.</p>

        {usersQuery.isLoading ? (
          <LoadingSpinner />
        ) : usersQuery.isError ? (
          <div className="mt-4">
            <InlineAlert variant="error" message={getErrorMessage(usersQuery.error)} />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Todos</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="bg-white">
                    <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3 capitalize text-slate-600">{user.role}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {user.stats ? (
                        <span>
                          {user.stats.completed}/{user.stats.totalTodos} completed
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="rounded-md border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">All todos</h2>
            <p className="text-sm text-slate-600">Review and manage tasks across the team.</p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600">
            {todos.length} total
          </span>
        </div>

        {todosQuery.isLoading ? (
          <LoadingSpinner />
        ) : todosQuery.isError ? (
          <div className="mt-4">
            <InlineAlert variant="error" message={getErrorMessage(todosQuery.error)} />
          </div>
        ) : todos.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No todos available.
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {todos.map((todo) => (
              <TodoCard
                key={todo.id}
                todo={todo}
                showOwner
                onEdit={setSelectedTodo}
                onDelete={setTodoToDelete}
              />
            ))}
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title="Update user"
        footer={null}
      >
        {selectedUser && (
          <UserForm
            initialValues={selectedUser}
            onSubmit={(values) => updateUserMutation.mutateAsync({ id: selectedUser.id, data: values })}
            onCancel={() => setSelectedUser(null)}
            isSubmitting={updateUserMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        title="Delete user"
        footer={null}
      >
        {userToDelete && (
          <div className="space-y-6">
            <InlineAlert variant="error" message="This will remove the user and all of their todos." />
            <p className="text-sm text-slate-600">
              Are you sure you want to remove <span className="font-semibold">{userToDelete.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setUserToDelete(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUserMutation.mutate(userToDelete.id)}
                disabled={deleteUserMutation.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(selectedTodo)}
        onClose={() => setSelectedTodo(null)}
        title="Update todo"
        footer={null}
      >
        {selectedTodo && (
          <TodoForm
            initialValues={{
              title: selectedTodo.title,
              description: selectedTodo.description ?? '',
              dueDate: selectedTodo.dueDate,
              priority: selectedTodo.priority,
              status: selectedTodo.status,
            }}
            onSubmit={(values) => updateTodoMutation.mutateAsync({ id: selectedTodo.id, data: values })}
            onCancel={() => setSelectedTodo(null)}
            isSubmitting={updateTodoMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(todoToDelete)}
        onClose={() => setTodoToDelete(null)}
        title="Delete todo"
        footer={null}
      >
        {todoToDelete && (
          <div className="space-y-6">
            <InlineAlert variant="error" message="Deleting this todo cannot be undone." />
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <span className="font-semibold">{todoToDelete.title}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTodoToDelete(null)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTodoMutation.mutate(todoToDelete.id)}
                disabled={deleteTodoMutation.isPending}
                className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-75"
              >
                {deleteTodoMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
