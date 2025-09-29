import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from "./taskApi";
import { Task, TaskPriority, TaskStatus } from "../../types/task";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
  status: z.enum(["Pending", "In Progress", "Completed"]).default("Pending"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

const statusOptions: TaskStatus[] = ["Pending", "In Progress", "Completed"];
const priorityOptions: TaskPriority[] = ["Low", "Medium", "High"];
const dueFilters = [
  { value: "", label: "All" },
  { value: "overdue", label: "Overdue" },
  { value: "today", label: "Due today" },
  { value: "week", label: "This week" },
];

export const TasksPage = () => {
  const [filters, setFilters] = useState({ status: "", priority: "", due: "", search: "" });
  const { data, isLoading } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { priority: "Medium", status: "Pending" },
  });

  const onCreate = async (values: TaskFormValues) => {
    await createTask.mutateAsync({
      ...values,
      due_date: values.due_date || null,
    });
    reset({ title: "", description: "", due_date: "", priority: "Medium", status: "Pending" });
  };

  const filteredTasks = useMemo(() => data?.results ?? [], [data]);

  const handleUpdate = async (task: Task, key: "status" | "priority", value: string) => {
    await updateTask.mutateAsync({ id: task.id, data: { [key]: value } });
  };

  const handleDelete = async (task: Task) => {
    if (confirm(`Delete task "${task.title}"?`)) {
      await deleteTask.mutateAsync(task.id);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <h2 className="text-xl font-semibold">Create task</h2>
        <form onSubmit={handleSubmit(onCreate)} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-200">
              Title
            </label>
            <input
              id="task-title"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              {...register("title")}
            />
            {errors.title && <p className="mt-1 text-sm text-rose-400">{errors.title.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-200">
              Description
            </label>
            <textarea
              id="task-description"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              rows={3}
              {...register("description")}
            />
          </div>
          <div>
            <label htmlFor="task-due" className="block text-sm font-medium text-slate-200">
              Due date
            </label>
            <input
              id="task-due"
              type="date"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
              {...register("due_date")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-slate-200">
                Priority
              </label>
              <select
                id="task-priority"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                {...register("priority")}
              >
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-status" className="block text-sm font-medium text-slate-200">
                Status
              </label>
              <select
                id="task-status"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                {...register("status")}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-400"
            >
              Add task
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-5">
            <div>
              <label className="block text-xs uppercase text-slate-400">Status</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="">All</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400">Priority</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                value={filters.priority}
                onChange={(event) => setFilters((prev) => ({ ...prev, priority: event.target.value }))}
              >
                <option value="">All</option>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase text-slate-400">Due</label>
              <select
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                value={filters.due}
                onChange={(event) => setFilters((prev) => ({ ...prev, due: event.target.value }))}
              >
                {dueFilters.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase text-slate-400">Search</label>
              <input
                type="search"
                className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2"
                value={filters.search}
                onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                placeholder="Search title or description"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-sm">
            <thead>
              <tr className="bg-slate-800 text-left text-xs uppercase tracking-wider text-slate-300">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Loading tasks...
                  </td>
                </tr>
              )}
              {!isLoading && filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No tasks found.
                  </td>
                </tr>
              )}
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-100">{task.title}</div>
                    {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    {task.due_date ? dayjs(task.due_date).format("MMM D, YYYY") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.priority}
                      onChange={(event) => handleUpdate(task, "priority", event.target.value)}
                      className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onChange={(event) => handleUpdate(task, "status", event.target.value)}
                      className="rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-sm"
                    >
                      {statusOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(task)}
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
