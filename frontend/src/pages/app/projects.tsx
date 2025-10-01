import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { PaginatedResponse, Project, User } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';

const fetchProjects = async (params: Record<string, unknown>) => {
  const { data } = await api.get<PaginatedResponse<Project>>('/projects', { params });
  return data;
};

export const ProjectsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', ownerId: '' });

  const projectsQuery = useQuery(['projects', page, query], () =>
    fetchProjects({ page, limit: 10, q: query || undefined }),
  );

  const usersQuery = useQuery(
    ['users', 'owners'],
    async () => {
      const { data } = await api.get<PaginatedResponse<User>>('/users', { params: { limit: 100 } });
      return data.data;
    },
    { enabled: user?.role === 'ADMIN' },
  );

  const createMutation = useMutation(
    () =>
      api.post('/projects', {
        name: newProject.name,
        description: newProject.description,
        ownerId: newProject.ownerId || undefined,
      }),
    {
      onSuccess: () => {
        setIsCreating(false);
        setNewProject({ name: '', description: '', ownerId: '' });
        queryClient.invalidateQueries(['projects']);
      },
    },
  );

  const onCreate = () => {
    if (!newProject.name || !newProject.description) return;
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Search projects"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              className="md:w-80"
            />
            <Button onClick={() => setIsCreating((prev) => !prev)}>{isCreating ? 'Cancel' : 'New Project'}</Button>
          </div>
          {isCreating && (
            <div className="grid gap-3 md:grid-cols-2">
              <Input
                placeholder="Project name"
                value={newProject.name}
                onChange={(event) => setNewProject((prev) => ({ ...prev, name: event.target.value }))}
              />
              {user?.role === 'ADMIN' && (
                <>
                  <Input
                    placeholder="Owner (optional)"
                    value={newProject.ownerId}
                    onChange={(event) => setNewProject((prev) => ({ ...prev, ownerId: event.target.value }))}
                    list="owners"
                  />
                  <datalist id="owners">
                    {usersQuery.data?.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName}
                      </option>
                    ))}
                  </datalist>
                </>
              )}
              <Input
                placeholder="Description"
                value={newProject.description}
                onChange={(event) => setNewProject((prev) => ({ ...prev, description: event.target.value }))}
              />
              <Button className="md:col-span-2" onClick={onCreate} disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Creating...' : 'Create project'}
              </Button>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {projectsQuery.data?.data.map((project) => (
              <Card key={project.id} className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">
                    <Link className="text-blue-600 hover:underline" to={`/app/projects/${project.id}`}>
                      {project.name}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-slate-600">{project.description}</p>
                  <div className="text-xs text-slate-500">Todos: {project.todoCount ?? 0}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          {projectsQuery.data?.data.length === 0 && (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No projects found.
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Page {page} of {Math.max(1, Math.ceil((projectsQuery.data?.total ?? 0) / 10))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.ceil((projectsQuery.data?.total ?? 0) / 10)}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
