import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, fetchTasks, updateTask, type Task } from '../api/tasks';
import { fetchProjects } from '../api/projects';
import Modal from '../components/Modal';

const statusOptions = ['PENDING', 'IN_PROGRESS', 'COMPLETED'] as const;
const priorityOptions = ['LOW', 'MEDIUM', 'HIGH'] as const;

type TaskFormState = {
  projectId: string;
  title: string;
  description: string;
  priority: (typeof priorityOptions)[number];
  status: (typeof statusOptions)[number];
};

const emptyForm: TaskFormState = {
  projectId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING',
};

export default function TasksPage() {
  const [filters, setFilters] = useState({ status: '', priority: '', q: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<TaskFormState>(emptyForm);
  const queryClient = useQueryClient();
  const projectsQuery = useQuery({ queryKey: ['project-options'], queryFn: () => fetchProjects({ pageSize: 100 }) });
  const tasksQuery = useQuery({
    queryKey: ['tasks', filters],
    queryFn: () =>
      fetchTasks({
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        q: filters.q || undefined,
        pageSize: 50,
      }),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormState(emptyForm);
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: Partial<TaskFormState> }) => updateTask(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setFormState(emptyForm);
      setModalOpen(false);
    },
  });

  const projects = useMemo(() => projectsQuery.data?.data ?? [], [projectsQuery.data]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormState({ ...emptyForm, projectId: projects[0]?.id ?? '' });
    setModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingId(task.id);
    setFormState({
      projectId: task.projectId,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
    });
    setModalOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formState });
    } else {
      createMutation.mutate(formState);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Tasks</h1>
        <button
          onClick={openCreateModal}
          className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          New Task
        </button>
      </div>
      <div className="rounded bg-white p-4 shadow">
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            placeholder="Search tasks"
            className="rounded border border-gray-300 px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">All status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Title</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Priority</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Due</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasksQuery.data?.data.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-800">{task.title}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{task.priority}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{task.status}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-2 text-right text-sm">
                  <button onClick={() => openEditModal(task)} className="text-indigo-600 hover:underline">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {!tasksQuery.data?.data.length && (
              <tr>
                <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Task' : 'New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project</label>
            <select
              value={formState.projectId}
              onChange={(e) => setFormState((prev) => ({ ...prev, projectId: e.target.value }))}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            >
              <option value="">Select project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              value={formState.title}
              onChange={(e) => setFormState((prev) => ({ ...prev, title: e.target.value }))}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={formState.description}
              onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              rows={3}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={formState.priority}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, priority: e.target.value as TaskFormState['priority'] }))
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formState.status}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, status: e.target.value as TaskFormState['status'] }))
                }
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded border border-gray-300 px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingId ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
