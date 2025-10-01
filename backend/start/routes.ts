import router from '@adonisjs/core/services/router'

router.get('/', async () => ({ message: 'Enterprise Todo API' }))

router.group(() => {
  router.post('register', '#app/Controllers/Http/AuthController.register')
  router.post('login', '#app/Controllers/Http/AuthController.login')
}).prefix('auth')

router.group(() => {
  router.get('me', '#app/Controllers/Http/AuthController.me')
  router.post('logout', '#app/Controllers/Http/AuthController.logout')

  router.resource('todos', '#app/Controllers/Http/TodosController').apiOnly()

  router.get('dashboard', '#app/Controllers/Http/DashboardController.index')

  router.group(() => {
    router.resource('users', '#app/Controllers/Http/UsersController').apiOnly()
    router.post('users/:id/activate', '#app/Controllers/Http/UsersController.activate')
    router.post('users/:id/deactivate', '#app/Controllers/Http/UsersController.deactivate')
  }).prefix('admin').middleware(['role:admin'])
}).prefix('api').middleware(['auth'])
