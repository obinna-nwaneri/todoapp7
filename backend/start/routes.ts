import Route from '@adonisjs/core/services/router'
import './adminjs.js'

Route.get('/', async () => {
  return { message: 'Enterprise Todo API up and running' }
})

Route.group(() => {
  Route.get('/', 'TodosController.index')
  Route.post('/', 'TodosController.store')
  Route.get('/:id', 'TodosController.show')
  Route.put('/:id', 'TodosController.update')
  Route.delete('/:id', 'TodosController.destroy')
}).prefix('/todos')

Route.group(() => {
  Route.get('/', 'UsersController.index')
  Route.post('/', 'UsersController.store')
}).prefix('/users')
