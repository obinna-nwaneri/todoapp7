import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

router.group(() => {
  router.post('register', '#controllers/auth_controller.register')
  router.post('login', '#controllers/auth_controller.login')
  router.post('logout', '#controllers/auth_controller.logout').use(middleware.auth())
}).prefix('auth')

router.group(() => {
  router.get('profile', '#controllers/profile_controller.show')
  router.patch('profile', '#controllers/profile_controller.update')

  router.get('todos', '#controllers/todos_controller.index')
  router.post('todos', '#controllers/todos_controller.store')
  router.get('todos/:id', '#controllers/todos_controller.show')
  router.patch('todos/:id', '#controllers/todos_controller.update')
  router.delete('todos/:id', '#controllers/todos_controller.destroy')
}).use(middleware.auth())

router.group(() => {
  router.get('users', '#controllers/users_controller.index')
  router.patch('users/:id', '#controllers/users_controller.update')
  router.delete('users/:id', '#controllers/users_controller.destroy')
}).use([middleware.auth(), middleware.admin()])
