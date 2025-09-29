export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "Pending" | "In Progress" | "Completed";

export type Task = {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  owner?: {
    id: number;
    username: string;
  };
};

export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};
