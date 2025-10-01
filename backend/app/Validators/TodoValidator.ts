import vine from '@vinejs/vine'

const baseSchema = {
  title: vine.string().trim().minLength(3),
  description: vine.string().trim().nullable(),
  dueDate: vine.date().optional(),
  priority: vine.enum(['low', 'medium', 'high']),
  status: vine.enum(['pending', 'in_progress', 'completed']).optional(),
  userId: vine.number().positive().optional(),
}

export const createTodoValidator = vine.compile(
  vine.object({
    ...baseSchema,
    status: vine.enum(['pending', 'in_progress', 'completed']).default('pending'),
  })
)

export const updateTodoValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(3).optional(),
    description: vine.string().trim().nullable().optional(),
    dueDate: vine.date().optional(),
    priority: vine.enum(['low', 'medium', 'high']).optional(),
    status: vine.enum(['pending', 'in_progress', 'completed']).optional(),
    userId: vine.number().positive().optional(),
  })
)
