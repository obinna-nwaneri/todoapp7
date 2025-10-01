import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine
    .object({
      name: vine.string().trim().minLength(2).maxLength(100).optional(),
      email: vine.string().trim().email().normalizeEmail().optional(),
      password: vine.string().trim().minLength(8).maxLength(180).optional(),
    })
)
