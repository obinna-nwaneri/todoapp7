import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import { PaginatedResponse, Project, Todo } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';

export const ProjectDetailPage = () => {
  const { id } = useParams();

  const projectQuery = useQuery(['project', id], async () => {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  });

  const todosQuery = useQuery(['projectTodos', id], async () => {
    const { data } = await api.get<PaginatedResponse<Todo>>('/todos', { params: { projectId: id, limit: 100 } });
    return data.data;
  });

  if (projectQuery.isLoading) {
    return <div>Loading...</div>;
  }

  const project = projectQuery.data;

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">{project.description}</p>
          <div className="mt-2 text-xs text-slate-500">Created {format(new Date(project.createdAt), 'PP')}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Project Todos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Status</TH>
                <TH>Priority</TH>
                <TH>Due</TH>
              </TR>
            </THead>
            <TBody>
              {todosQuery.data?.map((todo) => (
                <TR key={todo.id}>
                  <TD>
                    <Link className="font-medium text-blue-600 hover:underline" to={`/app/todos/${todo.id}`}>
                      {todo.title}
                    </Link>
                  </TD>
                  <TD>
                    <Badge variant={todo.status === 'COMPLETED' ? 'success' : todo.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
                      {todo.status.replace('_', ' ')}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge
                      variant={
                        todo.priority === 'HIGH'
                          ? 'danger'
                          : todo.priority === 'MEDIUM'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {todo.priority}
                    </Badge>
                  </TD>
                  <TD>{todo.dueDate ? format(new Date(todo.dueDate), 'PP') : '—'}</TD>
                </TR>
              ))}
              {todosQuery.data?.length === 0 && (
                <TR>
                  <TD colSpan={4} className="py-6 text-center text-sm text-slate-500">
                    No todos yet.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
