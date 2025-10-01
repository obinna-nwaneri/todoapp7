import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.get('/', async () => ({ message: 'Enterprise Todo API ready' }))

router.group(() => {
  router.post('/register', [() => import('#controllers/auth_controller'), 'register'])
  router.post('/login', [() => import('#controllers/auth_controller'), 'login'])
  router
    .post('/logout', [() => import('#controllers/auth_controller'), 'logout'])
    .middleware([middleware.auth()])
}).prefix('auth')

router
  .group(() => {
    router.get('/', [() => import('#controllers/todos_controller'), 'index'])
    router.post('/', [() => import('#controllers/todos_controller'), 'store'])
    router.get('/:id', [() => import('#controllers/todos_controller'), 'show'])
    router.patch('/:id', [() => import('#controllers/todos_controller'), 'update'])
    router.delete('/:id', [() => import('#controllers/todos_controller'), 'destroy'])
  })
  .prefix('todos')
  .middleware([middleware.auth()])

router
  .group(() => {
    router.get('/', [() => import('#controllers/users_controller'), 'index'])
    router.patch('/:id', [() => import('#controllers/users_controller'), 'update'])
  })
  .prefix('users')
  .middleware([middleware.auth()])

router
  .group(() => {
    router.get('/', [() => import('#controllers/profile_controller'), 'show'])
    router.patch('/', [() => import('#controllers/profile_controller'), 'update'])
  })
  .prefix('profile')
  .middleware([middleware.auth()])
