'use strict'

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.group(() => {
  Route.post('auth/register', 'AuthController.register')
  Route.post('auth/login', 'AuthController.login')

  Route.get('tasks', 'TaskController.index').middleware(['auth'])
  Route.post('tasks', 'TaskController.store').middleware(['auth'])
  Route.get('tasks/:id', 'TaskController.show').middleware(['auth'])
  Route.put('tasks/:id', 'TaskController.update').middleware(['auth'])
  Route.delete('tasks/:id', 'TaskController.destroy').middleware(['auth'])
}).prefix('api')

Route.group(() => {
  Route.get('dashboard/overview', 'Admin/DashboardController.overview')
  Route.resource('users', 'Admin/UserController').apiOnly()
  Route.resource('tasks', 'Admin/TaskController').apiOnly()
})
  .prefix('api/admin')
  .middleware(['auth', 'role:admin'])
