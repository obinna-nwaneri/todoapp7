import { Bouncer } from '@adonisjs/bouncer'
import type Todo from '#models/todo'
import type User from '#models/user'

export const isAdmin = Bouncer.ability((user: User) => {
  return user.isAdmin()
})

export const manageUsers = Bouncer.ability((user: User) => {
  return user.isAdmin()
})

export const manageTodo = Bouncer.ability((user: User, todo: Todo) => {
  if (user.isAdmin()) {
    return true
  }

  return todo.userId === user.id
})
