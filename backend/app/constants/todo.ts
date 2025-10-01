export const TODO_STATUSES = ['pending', 'in_progress', 'completed', 'blocked'] as const
export type TodoStatus = (typeof TODO_STATUSES)[number]

export const TODO_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const
export type TodoPriority = (typeof TODO_PRIORITIES)[number]
