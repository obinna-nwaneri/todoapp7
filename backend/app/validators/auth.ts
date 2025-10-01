import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(2).maxLength(100),
    email: vine
      .string()
      .trim()
      .email()
      .normalizeEmail(),
    password: vine.string().trim().minLength(8).maxLength(180),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email(),
    password: vine.string().trim().minLength(8).maxLength(180),
  })
)
