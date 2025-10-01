import vine from '@vinejs/vine'

import { TODO_PRIORITIES, TODO_STATUSES } from '#constants/todo'

export const createTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3),
    description: vine.string().trim().nullable().optional(),
    status: vine.enum(TODO_STATUSES).optional(),
    priority: vine.enum(TODO_PRIORITIES).optional(),
    dueDate: vine.date({ formats: ['iso8601'] }).optional(),
    assignedToId: vine.number().positive().optional(),
  })
)
