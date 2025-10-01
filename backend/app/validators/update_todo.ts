import vine from '@vinejs/vine'

import { TODO_PRIORITIES, TODO_STATUSES } from '#constants/todo'

export const updateTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).optional(),
    description: vine.string().trim().nullable().optional(),
    status: vine.enum(TODO_STATUSES).optional(),
    priority: vine.enum(TODO_PRIORITIES).optional(),
    dueDate: vine.date({ formats: ['iso8601'] }).nullable().optional(),
    completedAt: vine.date({ formats: ['iso8601'] }).nullable().optional(),
    assignedToId: vine.number().positive().nullable().optional(),
  })
)
