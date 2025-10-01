import Todo from '#models/todo'
import User from '#models/user'

export default class TodoPolicy {
  before(user: User | null) {
    if (user && user.role === 'admin') {
      return true
    }
    return null
  }

  view(user: User, todo: Todo) {
    return todo.userId === user.id
  }

  update(user: User, todo: Todo) {
    return todo.userId === user.id
  }

  delete(user: User, todo: Todo) {
    return todo.userId === user.id
  }

  manage(user: User, todo: Todo) {
    return todo.userId === user.id
  }
}
