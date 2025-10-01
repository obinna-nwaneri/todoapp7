import { defineConfig, env } from '@adonisjs/lucid'

const databaseConfig = defineConfig({
  connection: env('DB_CONNECTION', 'pg'),
  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: env('PG_HOST', 'localhost'),
        port: env.number('PG_PORT', 5432),
        user: env('PG_USER', 'postgres'),
        password: env('PG_PASSWORD', 'admin'),
        database: env('PG_DB_NAME', 'Docapp')
      },
      migrations: {
        tableName: 'adonis_schema',
      }
    }
  }
})

export default databaseConfig
