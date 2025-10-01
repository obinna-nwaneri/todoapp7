import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']),
  SQLITE_DB_PATH: Env.schema.string.optional(),
  JWT_SECRET: Env.schema.string.optional(),
  JWT_EXPIRES_IN: Env.schema.string.optional(),
  FRONTEND_URL: Env.schema.string.optional(),
})
