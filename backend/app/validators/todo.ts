import vine from '@vinejs/vine'

export const statusEnum = ['pending', 'in_progress', 'completed'] as const
export const priorityEnum = ['low', 'medium', 'high'] as const

export const createTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255),
    description: vine.string().trim().maxLength(2000).optional(),
    dueDate: vine.date().optional(),
    priority: vine.enum(priorityEnum).optional(),
    status: vine.enum(statusEnum).optional(),
    userId: vine.number().optional(),
  })
)

export const updateTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).maxLength(255).optional(),
    description: vine.string().trim().maxLength(2000).optional(),
    dueDate: vine.date().optional().nullable(),
    priority: vine.enum(priorityEnum).optional(),
    status: vine.enum(statusEnum).optional(),
    userId: vine.number().optional(),
  })
)
