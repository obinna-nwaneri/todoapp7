import Server from '@adonisjs/core/services/server'

Server.middleware.register([
  () => import('@adonisjs/core/bodyparser_middleware'),
])
