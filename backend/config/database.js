'use strict'

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

/** @type {import('@adonisjs/ignitor/src/Helpers')} */
const Helpers = use('Helpers')

module.exports = {
  connection: Env.get('DB_CONNECTION', 'pg'),

  sqlite: {
    client: 'sqlite3',
    connection: {
      filename: Helpers.databasePath(`${Env.get('DB_DATABASE', 'development')}.sqlite`)
    },
    useNullAsDefault: true,
    debug: Env.get('DB_DEBUG', false)
  },

  mysql: {
    client: 'mysql',
    connection: {
      host: Env.get('DB_HOST', 'localhost'),
      port: Env.get('DB_PORT', ''),
      user: Env.get('DB_USER', 'root'),
      password: Env.get('DB_PASSWORD', ''),
      database: Env.get('DB_DATABASE', 'adonis')
    },
    debug: Env.get('DB_DEBUG', false)
  },

  pg: {
    client: 'pg',
    connection: {
      host: Env.get('PG_HOST', 'localhost'),
      port: Env.get('PG_PORT', 5432),
      user: Env.get('PG_USER', 'postgres'),
      password: Env.get('PG_PASSWORD', 'admin'),
      database: Env.get('PG_DB_NAME', 'Docapp3')
    },
    debug: Env.get('DB_DEBUG', false)
  }
}
