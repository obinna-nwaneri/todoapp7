import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Todo, { TodoPriority, TodoStatus } from '#models/todo'
import User from '#models/user'
import { DateTime } from 'luxon'

type SeedTodo = { title: string; status: TodoStatus; priority: TodoPriority }

export default class DatabaseSeeder extends BaseSeeder {
  public static developmentOnly = true

  public async run() {
    await this.createUsersWithTodos()
  }

  private async createUsersWithTodos() {
    const admin = await User.updateOrCreate(
      { email: 'admin@example.com' },
      {
        name: 'Admin User',
        password: 'Admin@123',
        role: 'admin',
      }
    )

    const alice = await User.updateOrCreate(
      { email: 'alice@example.com' },
      {
        name: 'Alice Johnson',
        password: 'User@123',
        role: 'user',
      }
    )

    const bob = await User.updateOrCreate(
      { email: 'bob@example.com' },
      {
        name: 'Bob Smith',
        password: 'User@123',
        role: 'user',
      }
    )

    await this.seedTodos(admin, [
      { title: 'Review team metrics', status: 'completed', priority: 'high' },
      { title: 'Plan sprint retrospective', status: 'in_progress', priority: 'medium' },
      { title: 'Audit infrastructure', status: 'pending', priority: 'high' },
      { title: 'Approve budget', status: 'pending', priority: 'medium' },
      { title: 'Security training', status: 'pending', priority: 'low' },
    ])

    await this.seedTodos(alice, [
      { title: 'Buy groceries', status: 'pending', priority: 'medium' },
      { title: 'Schedule dentist appointment', status: 'completed', priority: 'medium' },
      { title: 'Finish book club reading', status: 'in_progress', priority: 'low' },
      { title: 'Workout session', status: 'pending', priority: 'high' },
      { title: 'Plan weekend trip', status: 'pending', priority: 'medium' },
    ])

    await this.seedTodos(bob, [
      { title: 'Prepare presentation', status: 'in_progress', priority: 'high' },
      { title: 'Submit project report', status: 'pending', priority: 'high' },
      { title: 'Team standup notes', status: 'completed', priority: 'medium' },
      { title: 'Refactor codebase', status: 'pending', priority: 'medium' },
      { title: 'Client follow-up', status: 'pending', priority: 'high' },
    ])
  }

  private async seedTodos(user: User, todos: SeedTodo[]) {
    await Todo.query().where('user_id', user.id).delete()

    const today = DateTime.now()

    for (let index = 0; index < todos.length; index++) {
      const todo = todos[index]
      await Todo.create({
        title: todo.title,
        description: null,
        dueDate: today.plus({ days: index + 1 }),
        status: todo.status,
        priority: todo.priority,
        userId: user.id,
      })
    }
  }
}
