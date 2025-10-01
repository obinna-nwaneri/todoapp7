import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

router.use([
  () => import('@adonisjs/core/bodyparser_middleware'),
  () => import('#middleware/ensure_auth_context_middleware'),
  () => import('#middleware/initialize_bouncer_middleware'),
])

export const middleware = router.named({
  auth: () => import('#middleware/jwt_auth_middleware'),
  admin: () => import('#middleware/admin_middleware'),
})
