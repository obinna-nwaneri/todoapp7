import dayjs from "dayjs";
import { useState } from "react";

import {
  useAdminActivity,
  useAdminCreateTask,
  useAdminDeleteTask,
  useAdminMetrics,
  useAdminTasks,
  useAdminUsers,
} from "./adminApi";

export const AdminDashboardPage = () => {
  const metrics = useAdminMetrics();
  const users = useAdminUsers();
  const [activityFilters, setActivityFilters] = useState({ action: "", user: "" });
  const activity = useAdminActivity(activityFilters);
  const tasks = useAdminTasks();
  const deleteTask = useAdminDeleteTask();
  const createTask = useAdminCreateTask();
  const [newTask, setNewTask] = useState({
    title: "",
    owner: "",
    priority: "Medium",
    status: "Pending",
  });

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTask.title || !newTask.owner) {
      alert("Title and owner are required.");
      return;
    }
    createTask.mutate({
      title: newTask.title,
      owner: Number(newTask.owner),
      priority: newTask.priority as any,
      status: newTask.status as any,
    });
    setNewTask({ title: "", owner: "", priority: "Medium", status: "Pending" });
  };

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard title="Total users" value={metrics.data?.total_users} loading={metrics.isLoading} />
        <SummaryCard title="Total tasks" value={metrics.data?.total_tasks} loading={metrics.isLoading} />
        <SummaryCard
          title="Active 7 days"
          value={metrics.data?.active_last_7_days}
          loading={metrics.isLoading}
        />
        <SummaryCard
          title="Active 30 days"
          value={metrics.data?.active_last_30_days}
          loading={metrics.isLoading}
        />
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h2 className="text-lg font-semibold">Tasks breakdown</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-slate-200">By status</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {metrics.data?.tasks_by_status.map((item) => (
                <li key={item.status} className="flex items-center justify-between">
                  <span>{item.status}</span>
                  <span className="font-semibold">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-200">By priority</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-300">
              {metrics.data?.tasks_by_priority.map((item) => (
                <li key={item.priority} className="flex items-center justify-between">
                  <span>{item.priority}</span>
                  <span className="font-semibold">{item.total}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h2 className="text-lg font-semibold">Users</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-800 text-left text-xs uppercase text-slate-300">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Last login</th>
                <th className="px-4 py-3">Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.data?.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-slate-100">{user.username}</td>
                  <td className="px-4 py-3 text-slate-300">{user.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {user.last_login ? dayjs(user.last_login).format("MMM D, YYYY h:mm A") : "Never"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-indigo-300">{user.task_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h2 className="text-lg font-semibold">Activity log</h2>
          <div className="flex gap-3">
            <select
              value={activityFilters.action}
              onChange={(event) =>
                setActivityFilters((prev) => ({ ...prev, action: event.target.value }))
              }
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="">All actions</option>
              {[
                "login",
                "logout",
                "task_create",
                "task_update",
                "task_delete",
                "password_change",
                "register",
              ].map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filter by user id"
              value={activityFilters.user}
              onChange={(event) =>
                setActivityFilters((prev) => ({ ...prev, user: event.target.value }))
              }
              className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-800 text-left text-xs uppercase text-slate-300">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {activity.data?.results.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-slate-300">
                    {dayjs(log.created_at).format("MMM D, YYYY h:mm A")}
                  </td>
                  <td className="px-4 py-3 text-slate-100">{log.user ?? "System"}</td>
                  <td className="px-4 py-3 text-slate-300">{log.action}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(log.context, null, 2)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h2 className="text-lg font-semibold">Task management</h2>
        <form onSubmit={handleCreateTask} className="mt-4 grid gap-3 md:grid-cols-5">
          <input
            type="text"
            placeholder="Title"
            value={newTask.title}
            onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm md:col-span-2"
          />
          <input
            type="number"
            placeholder="Owner ID"
            value={newTask.owner}
            onChange={(event) => setNewTask((prev) => ({ ...prev, owner: event.target.value }))}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          />
          <select
            value={newTask.priority}
            onChange={(event) => setNewTask((prev) => ({ ...prev, priority: event.target.value }))}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            {[
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
            ].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={newTask.status}
            onChange={(event) => setNewTask((prev) => ({ ...prev, status: event.target.value }))}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            {[
              { label: "Pending", value: "Pending" },
              { label: "In Progress", value: "In Progress" },
              { label: "Completed", value: "Completed" },
            ].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Create
          </button>
        </form>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead className="bg-slate-800 text-left text-xs uppercase text-slate-300">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {tasks.data?.results.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3 text-slate-100">{task.title}</td>
                  <td className="px-4 py-3 text-slate-300">{task.owner?.username ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-300">{task.status}</td>
                  <td className="px-4 py-3 text-slate-300">{task.priority}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.due_date ? dayjs(task.due_date).format("MMM D") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => deleteTask.mutate(task.id)}
                      className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

const SummaryCard = ({
  title,
  value,
  loading,
}: {
  title: string;
  value: number | undefined;
  loading: boolean;
}) => (
  <div className="rounded-lg border border-slate-800 bg-slate-900 p-4 shadow">
    <p className="text-xs uppercase text-slate-400">{title}</p>
    <p className="mt-2 text-2xl font-semibold text-slate-100">{loading ? "—" : value ?? 0}</p>
  </div>
);
