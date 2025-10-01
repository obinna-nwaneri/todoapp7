import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { fetchTodo, updateTodo } from '@/api/todos'
import { fetchUsers } from '@/api/users'
import TodoForm from '@/components/TodoForm'
import { useAuth } from '@/hooks/useAuth'

const EditTodoPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const todoQuery = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(Number(id)),
    enabled: Boolean(id),
  })

  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers, enabled: isAdmin })

  const mutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateTodo>[1]) => updateTodo(Number(id), payload),
    onSuccess: () => {
      toast.success('Todo updated')
      navigate('/')
    },
    onError: () => toast.error('Unable to update todo'),
  })

  if (todoQuery.isLoading) {
    return <p className="text-sm text-slate-600">Loading todo...</p>
  }

  if (!todoQuery.data) {
    return <p className="text-sm text-rose-600">Todo not found.</p>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Edit todo</h1>
        <p className="text-sm text-slate-600">Update task details and keep collaborators informed.</p>
      </div>
      <TodoForm
        initialValues={todoQuery.data}
        onSubmit={(values) =>
          mutation.mutate({
            title: values.title,
            description: values.description,
            dueDate: values.dueDate || undefined,
            priority: values.priority,
            status: values.status,
            userId: values.userId,
          })
        }
        submitting={mutation.isPending}
        users={usersQuery.data}
        canAssign={isAdmin}
      />
    </div>
  )
}

export default EditTodoPage
