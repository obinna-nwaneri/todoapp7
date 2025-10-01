import env from '@adonisjs/core/services/env'
import { DatabaseConfig } from '@adonisjs/lucid/types/database'

const databaseConfig: DatabaseConfig = {
  connection: 'pg',
  connections: {
    pg: {
      client: 'pg',
      connection: {
        host: env.get('PG_HOST', 'localhost'),
        port: Number(env.get('PG_PORT', 5432)),
        user: env.get('PG_USER', 'postgres'),
        password: env.get('PG_PASSWORD', 'admin'),
        database: env.get('PG_DB_NAME', 'Docapp3'),
      },
      migrations: {
        naturalSort: true,
      },
      healthCheck: true,
      debug: false,
    },
  },
}

export default databaseConfig
