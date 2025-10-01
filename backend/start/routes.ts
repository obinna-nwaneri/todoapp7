/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

import { middleware } from '#start/kernel'

router.get('/', async () => ({ status: 'ok' }))

router.group(() => {
  router.post('login', [() => import('#controllers/auth_controller'), 'login'])
  router.post('logout', [() => import('#controllers/auth_controller'), 'logout']).use(middleware.auth())
}).prefix('api/auth')

router
  .group(() => {
    router.get('me', [() => import('#controllers/users_controller'), 'me'])
    router.get('users', [() => import('#controllers/users_controller'), 'index'])
    router.get('users/:id', [() => import('#controllers/users_controller'), 'show'])

    router.get('todos', [() => import('#controllers/todos_controller'), 'index'])
    router.post('todos', [() => import('#controllers/todos_controller'), 'store'])
    router.get('todos/:id', [() => import('#controllers/todos_controller'), 'show'])
    router.put('todos/:id', [() => import('#controllers/todos_controller'), 'update'])
    router.patch('todos/:id', [() => import('#controllers/todos_controller'), 'update'])
    router.delete('todos/:id', [() => import('#controllers/todos_controller'), 'destroy'])
  })
  .prefix('api')
  .use(middleware.auth())
