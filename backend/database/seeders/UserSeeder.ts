import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#app/Models/User'
import Todo from '#app/Models/Todo'

export default class UserSeeder extends BaseSeeder {
  public static environment = ['development']

  public async run() {
    await User.updateOrCreateMany('email', [
      {
        email: 'admin@example.com',
        password: 'Admin123!',
        fullName: 'System Administrator',
        role: 'admin',
        isActive: true,
      },
      {
        email: 'user@example.com',
        password: 'User123!',
        fullName: 'Enterprise User',
        role: 'user',
        isActive: true,
      },
      {
        email: 'lead@example.com',
        password: 'Lead123!',
        fullName: 'Team Lead',
        role: 'team_lead',
        isActive: true,
      },
    ])

    const admin = await User.findByOrFail('email', 'admin@example.com')
    const regular = await User.findByOrFail('email', 'user@example.com')

    await Todo.updateOrCreateMany('title', [
      {
        title: 'Prepare Q1 Planning',
        description: 'Gather inputs from all departments',
        priority: 'high',
        status: 'in_progress',
        creatorId: admin.id,
        userId: regular.id,
      },
      {
        title: 'Update CRM Entries',
        description: 'Ensure all leads are tagged correctly',
        priority: 'medium',
        status: 'pending',
        creatorId: admin.id,
        userId: regular.id,
      },
    ])
  }
}
