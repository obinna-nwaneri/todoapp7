import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';
import { fetchProjects } from '../api/projects';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  const tasksQuery = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: () => fetchTasks({ pageSize: 100 }),
  });
  const projectsQuery = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: () => fetchProjects({ pageSize: 100 }),
  });

  const openTasks = tasksQuery.data?.data.filter((task) => task.status !== 'COMPLETED') ?? [];
  const overdueTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date());
  const ownedProjects = projectsQuery.data?.data.filter((project) => project.ownerId === user?.id) ?? [];
  const recentTasks = tasksQuery.data?.data.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Welcome back, {user?.firstName}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard title="My Open Tasks" value={openTasks.length} />
        <DashboardCard title="Overdue Tasks" value={overdueTasks.length} />
        <DashboardCard title="Projects Owned" value={ownedProjects.length} />
        <DashboardCard title="Recently Updated Tasks" value={recentTasks.length} />
      </div>
      <div className="rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold text-gray-700">Recent Tasks</h2>
        <ul className="space-y-2">
          {recentTasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between rounded border border-gray-200 p-3">
              <div>
                <p className="font-medium text-gray-800">{task.title}</p>
                <p className="text-sm text-gray-500">Status: {task.status}</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                {task.priority}
              </span>
            </li>
          ))}
          {!recentTasks.length && <p className="text-sm text-gray-500">No tasks yet.</p>}
        </ul>
      </div>
    </div>
  );
}

function DashboardCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-indigo-600">{value}</p>
    </div>
  );
}
