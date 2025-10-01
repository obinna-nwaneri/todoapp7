'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.post('auth/register', 'AuthController.register')
  Route.post('auth/login', 'AuthController.login')
  Route.get('auth/me', 'AuthController.me').middleware(['auth'])
  Route.post('auth/logout', 'AuthController.logout').middleware(['auth'])

  Route.get('dashboard', 'DashboardController.overview').middleware(['auth'])
  Route.get('users', 'UserController.index').middleware(['auth'])

  Route.resource('todos', 'TodoController').apiOnly().middleware(['auth'])
}).prefix('api')

Route.get('/', () => {
  return { greeting: 'Enterprise Todo API is running' }
})
