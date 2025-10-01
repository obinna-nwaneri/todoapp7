import User from '#models/user'

export default class UserPolicy {
  before(user: User | null) {
    if (user && user.role === 'admin') {
      return true
    }
    return null
  }

  view(user: User, target: User) {
    return user.id === target.id
  }

  update(user: User, target: User) {
    return user.id === target.id
  }

  delete(_user: User, _target: User) {
    return false
  }
}
