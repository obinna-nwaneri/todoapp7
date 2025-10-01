import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../../api/client';
import { PaginatedResponse, Project, Todo, TodoPriority, TodoStatus, User } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  assigneeId: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

export const TodoDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const todoQuery = useQuery(['todo', id], async () => {
    const { data } = await api.get<Todo>(`/todos/${id}`);
    return data;
  });

  const projectsQuery = useQuery(['projects', 'options'], async () => {
    const { data } = await api.get<PaginatedResponse<Project>>('/projects', { params: { limit: 100 } });
    return data.data;
  });

  const usersQuery = useQuery(
    ['users', 'options'],
    async () => {
      const { data } = await api.get<PaginatedResponse<User>>('/users', { params: { limit: 100 } });
      return data.data;
    },
    { enabled: user?.role === 'ADMIN' },
  );

  const updateMutation = useMutation(
    (payload: FormValues) => api.patch(`/todos/${id}`, payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['todo', id]);
        queryClient.invalidateQueries(['todos']);
      },
    },
  );

  const deleteMutation = useMutation(() => api.delete(`/todos/${id}`), {
    onSuccess: () => {
      queryClient.invalidateQueries(['todos']);
      navigate('/app/todos');
    },
  });

  const todo = todoQuery.data;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: '',
      projectId: '',
      assigneeId: '',
    },
  });

  useEffect(() => {
    if (todo) {
      form.reset({
        title: todo.title,
        description: todo.description ?? '',
        priority: todo.priority,
        status: todo.status,
        dueDate: todo.dueDate ? todo.dueDate.split('T')[0] : '',
        projectId: todo.projectId ?? '',
        assigneeId: todo.assigneeId ?? '',
      });
    }
  }, [todo, form]);

  const onSubmit = async (values: FormValues) => {
    await updateMutation.mutateAsync({
      ...values,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      projectId: values.projectId || null,
      assigneeId: values.assigneeId || null,
    });
  };

  const canEditAssignee = user?.role === 'ADMIN';

  if (todoQuery.isLoading || !todo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Todo</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Title</label>
                <Input {...form.register('title')} />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Due date</label>
                <Input type="date" {...form.register('dueDate')} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Priority</label>
                <Select {...form.register('priority')}>
                  {(['LOW', 'MEDIUM', 'HIGH'] as TodoPriority[]).map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
                <Select {...form.register('status')}>
                  {(['PENDING', 'IN_PROGRESS', 'COMPLETED'] as TodoStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Project</label>
                <Select {...form.register('projectId')}>
                  <option value="">Unassigned</option>
                  {projectsQuery.data?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            {canEditAssignee && (
              <div>
                <label className="text-xs font-semibold uppercase text-slate-500">Assignee</label>
                <Select {...form.register('assigneeId')}>
                  <option value="">Me</option>
                  {usersQuery.data?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.firstName} {option.lastName}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Description</label>
              <Textarea rows={6} {...form.register('description')} />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={updateMutation.isLoading}>
                {updateMutation.isLoading ? 'Saving...' : 'Save changes'}
              </Button>
              <Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()}>
                Delete todo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
