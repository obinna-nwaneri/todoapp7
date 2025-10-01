import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createProject, fetchProjects } from '../api/projects';

export default function ProjectsPage() {
  const [q, setQ] = useState('');
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({
    queryKey: ['projects', q],
    queryFn: () => fetchProjects({ q }),
  });
  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Projects</h1>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            createMutation.mutate({
              name: formData.get('name') as string,
              description: formData.get('description') as string,
            });
            event.currentTarget.reset();
          }}
          className="flex flex-col gap-2 rounded bg-white p-4 shadow sm:flex-row"
        >
          <input
            name="name"
            placeholder="Project name"
            className="rounded border border-gray-300 px-3 py-2"
            required
          />
          <input
            name="description"
            placeholder="Description"
            className="rounded border border-gray-300 px-3 py-2"
            required
          />
          <button
            type="submit"
            className="rounded bg-indigo-600 px-4 py-2 text-white"
            disabled={createMutation.isPending}
          >
            Create
          </button>
        </form>
      </div>
      <div className="rounded bg-white p-4 shadow">
        <div className="mb-4 flex justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects"
            className="w-full rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projectsQuery.data?.data.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-800">
                  <Link to={`/projects/${project.id}`} className="text-indigo-600 hover:underline">
                    {project.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{project.description}</td>
              </tr>
            ))}
            {!projectsQuery.data?.data.length && (
              <tr>
                <td colSpan={2} className="px-4 py-4 text-center text-sm text-gray-500">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
