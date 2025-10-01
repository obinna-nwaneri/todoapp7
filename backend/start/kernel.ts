import server from '@adonisjs/core/services/server'

server.middleware.register([
  () => import('#app/Middleware/SilentAuth'),
])

server.middleware.registerNamed({
  auth: () => import('#app/Middleware/Auth'),
  role: () => import('#app/Middleware/Role'),
})
