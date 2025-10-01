import router from '@adonisjs/core/services/router'

router.post('/register', 'AuthController.register')
router.post('/login', 'AuthController.login')

router
  .group(() => {
    router.get('/todos', 'TodosController.index')
    router.post('/todos', 'TodosController.store')
    router.get('/todos/:id', 'TodosController.show')
    router.put('/todos/:id', 'TodosController.update')
    router.delete('/todos/:id', 'TodosController.destroy')
  })
  .middleware(['auth'])

router
  .group(() => {
    router.get('/users', 'AdminController.users')
    router.get('/todos', 'AdminController.todos')
    router.put('/todos/:id', 'AdminController.updateTodo')
    router.delete('/todos/:id', 'AdminController.deleteTodo')
  })
  .prefix('/admin')
  .middleware(['auth', 'role:admin'])
