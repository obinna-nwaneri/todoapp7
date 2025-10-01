import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { fetchProject } from '../api/projects';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const projectQuery = useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });

  if (projectQuery.isLoading) {
    return <div>Loading project...</div>;
  }

  if (!projectQuery.data) {
    return <div className="text-sm text-gray-600">Project not found.</div>;
  }

  const project = projectQuery.data;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">{project.name}</h1>
      <div className="rounded bg-white p-4 shadow">
        <p className="text-gray-700">{project.description}</p>
        <p className="mt-2 text-sm text-gray-500">Owner: {project.ownerId}</p>
        <p className="mt-2 text-sm text-gray-500">
          Created: {new Date(project.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
