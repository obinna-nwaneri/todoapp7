import server from '@adonisjs/core/services/server'

server.middleware.register([
  () => import('@adonisjs/bodyparser/middleware'),
])

server.middleware.registerNamed({
  auth: () => import('@adonisjs/auth/middleware/auth_middleware'),
  silentAuth: () => import('@adonisjs/auth/middleware/silent_auth_middleware'),
  role: () => import('#middleware/role_middleware'),
})
