import { defineConfig } from '@adonisjs/lucid'
import app from '@adonisjs/core/services/app'

const pgConnection = {
  client: 'pg',
  connection: {
    host: app.env.get('PG_HOST'),
    port: Number(app.env.get('PG_PORT')), 
    user: app.env.get('PG_USER'),
    password: app.env.get('PG_PASSWORD'),
    database: app.env.get('PG_DB_NAME'),
  },
  migrations: {
    naturalSort: true,
  },
  healthCheck: true,
}

export default defineConfig({
  connection: app.env.get('DB_CONNECTION', 'pg'),
  connections: {
    pg: pgConnection,
  },
})
