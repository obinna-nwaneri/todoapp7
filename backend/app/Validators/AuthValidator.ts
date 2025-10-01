import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    fullName: vine.string().trim(),
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8),
    role: vine.enum(['admin', 'user', 'team_lead']).optional(),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim(),
  })
)
