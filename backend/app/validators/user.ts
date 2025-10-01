import vine from '@vinejs/vine'

export const updateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().trim().email().optional(),
    role: vine.enum(['admin', 'user'] as const).optional(),
    password: vine.string().trim().minLength(8).maxLength(64).optional(),
  })
)

export const updateProfileValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine.string().trim().email().optional(),
    password: vine.string().trim().minLength(8).maxLength(64).optional(),
  })
)
