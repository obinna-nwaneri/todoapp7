import databaseConfig from '../config/database.js'

declare module '@adonisjs/lucid/types' {
  interface DatabaseConfig {
    Pg: typeof databaseConfig
  }
}
