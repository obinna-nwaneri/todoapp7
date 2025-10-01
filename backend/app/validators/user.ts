import vine from '@vinejs/vine'

const roles = ['admin', 'user'] as const
export type RoleInput = (typeof roles)[number]

export const adminUpdateUserValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100).optional(),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail()
      .optional(),
    role: vine.enum(roles).optional(),
    password: vine.string().trim().minLength(8).maxLength(180).optional(),
  })
)
