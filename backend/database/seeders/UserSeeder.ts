import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Todo from '#models/todo'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const admin = await User.updateOrCreate(
      { email: 'admin@example.com' },
      {
        name: 'Administrator',
        password: 'admin123',
        role: 'admin',
      }
    )

    const user = await User.updateOrCreate(
      { email: 'user@example.com' },
      {
        name: 'Regular User',
        password: 'user123',
        role: 'user',
      }
    )

    await Todo.firstOrCreate(
      { title: 'Review quarterly reports', userId: admin.id },
      {
        description: 'Analyze performance metrics and prepare presentation for leadership.',
        priority: 'high',
        status: 'in-progress',
        dueDate: DateTime.now().plus({ days: 7 }),
      }
    )

    await Todo.firstOrCreate(
      { title: 'Complete onboarding checklist', userId: user.id },
      {
        description: 'Finish the required documents and setup accounts for new hire.',
        priority: 'medium',
        status: 'pending',
        dueDate: DateTime.now().plus({ days: 3 }),
      }
    )
  }
}
