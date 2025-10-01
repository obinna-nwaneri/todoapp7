import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createTodo } from '@/api/todos'
import { fetchUsers } from '@/api/users'
import TodoForm from '@/components/TodoForm'
import { useAuth } from '@/hooks/useAuth'

const CreateTodoPage: React.FC = () => {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const usersQuery = useQuery({ queryKey: ['users'], queryFn: fetchUsers, enabled: isAdmin })

  const mutation = useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      toast.success('Todo created')
      navigate('/')
    },
    onError: () => toast.error('Unable to create todo'),
  })

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create todo</h1>
        <p className="text-sm text-slate-600">Provide details and assign a priority to keep your team aligned.</p>
      </div>
      <TodoForm
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

export default CreateTodoPage
