import { defineConfig } from '@adonisjs/core/env'

export default defineConfig({
  APP_KEY: {
    format: 'string',
  },
  NODE_ENV: {
    format: 'string',
    default: 'development',
  },
  HOST: {
    format: 'host',
    default: '0.0.0.0',
  },
  PORT: {
    format: 'number',
    default: 3333,
  },
  PG_HOST: {
    format: 'string',
    default: 'localhost',
  },
  PG_PORT: {
    format: 'number',
    default: 5432,
  },
  PG_USER: {
    format: 'string',
    default: 'postgres',
  },
  PG_PASSWORD: {
    format: 'string',
    default: 'admin',
  },
  PG_DB_NAME: {
    format: 'string',
    default: 'Docapp3',
  },
})
