import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Todo from '#models/todo'

export default class extends BaseSeeder {
  static environment = ['development', 'production', 'testing']

  async run() {
    const admin = await User.updateOrCreate(
      { email: 'admin@example.com' },
      {
        name: 'System Admin',
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

    const samples = [
      {
        title: 'Prepare quarterly financial report',
        description: 'Compile revenue and expense data for the leadership review.',
        priority: 'high',
        status: 'in_progress',
        dueDate: DateTime.now().plus({ days: 5 }),
        user: alice,
      },
      {
        title: 'Schedule product roadmap sync',
        description: 'Coordinate with stakeholders for next roadmap discussion.',
        priority: 'medium',
        status: 'pending',
        dueDate: DateTime.now().plus({ days: 10 }),
        user: alice,
      },
      {
        title: 'Customer onboarding follow-up',
        description: 'Reach out to ACME Corp and gather feedback on onboarding.',
        priority: 'high',
        status: 'pending',
        dueDate: DateTime.now().plus({ days: 3 }),
        user: alice,
      },
      {
        title: 'Draft Q2 OKRs',
        description: 'Outline objectives and key results for next quarter.',
        priority: 'medium',
        status: 'in_progress',
        dueDate: DateTime.now().plus({ days: 12 }),
        user: alice,
      },
      {
        title: 'Update team handbook',
        description: 'Incorporate new remote-work guidelines into the handbook.',
        priority: 'low',
        status: 'completed',
        dueDate: DateTime.now().minus({ days: 2 }),
        user: alice,
      },
      {
        title: 'Review security incident report',
        description: 'Analyze incident summary and define remediation steps.',
        priority: 'high',
        status: 'pending',
        dueDate: DateTime.now().plus({ days: 2 }),
        user: bob,
      },
      {
        title: 'Refine deployment pipeline',
        description: 'Improve CI/CD pipeline speed and reliability.',
        priority: 'medium',
        status: 'in_progress',
        dueDate: DateTime.now().plus({ days: 8 }),
        user: bob,
      },
      {
        title: 'Document API versioning plan',
        description: 'Prepare documentation for upcoming API changes.',
        priority: 'medium',
        status: 'pending',
        dueDate: DateTime.now().plus({ days: 14 }),
        user: bob,
      },
      {
        title: 'Plan team offsite agenda',
        description: 'Collect agenda items and logistics for offsite.',
        priority: 'low',
        status: 'pending',
        dueDate: DateTime.now().plus({ days: 20 }),
        user: bob,
      },
      {
        title: 'Close open support tickets',
        description: 'Resolve outstanding customer support tickets.',
        priority: 'high',
        status: 'completed',
        dueDate: DateTime.now().minus({ days: 1 }),
        user: bob,
      },
    ] as const

    for (const sample of samples) {
      await Todo.updateOrCreate(
        { title: sample.title, userId: sample.user.id },
        {
          description: sample.description,
          priority: sample.priority,
          status: sample.status,
          dueDate: sample.dueDate,
          userId: sample.user.id,
        }
      )
    }

    // Ensure admin account exists even if not used above
    await admin.refresh()
  }
}
