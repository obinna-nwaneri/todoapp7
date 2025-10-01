import vine from '@vinejs/vine'

export const createUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim(),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
    role: vine.enum(['admin', 'user', 'team_lead']).default('user'),
    isActive: vine.boolean().optional(),
  })
)

export const updateUserValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim().optional(),
    email: vine.string().trim().email().optional(),
    password: vine.string().trim().minLength(8).optional(),
    role: vine.enum(['admin', 'user', 'team_lead']).optional(),
    isActive: vine.boolean().optional(),
  })
)
