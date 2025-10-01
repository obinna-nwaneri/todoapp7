import { DateTime } from 'luxon'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

import Todo from '#models/todo'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const admin = await User.updateOrCreate(
      { email: 'admin@enterprise.todo' },
      {
        fullName: 'Enterprise Admin',
        password: 'Admin@123',
        isAdmin: true,
      }
    )

    const manager = await User.updateOrCreate(
      { email: 'olivia@enterprise.todo' },
      {
        fullName: 'Olivia Martinez',
        password: 'Password123',
        isAdmin: false,
      }
    )

    const engineer = await User.updateOrCreate(
      { email: 'dylan@enterprise.todo' },
      {
        fullName: 'Dylan Harper',
        password: 'Password123',
        isAdmin: false,
      }
    )

    await Todo.updateOrCreate(
      { title: 'Prepare quarterly OKRs' },
      {
        description: 'Consolidate department objectives and compile draft OKRs for Q2.',
        status: 'in_progress',
        priority: 'critical',
        dueDate: DateTime.now().plus({ days: 10 }),
        createdById: admin.id,
        assignedToId: manager.id,
      }
    )

    await Todo.updateOrCreate(
      { title: 'Audit infrastructure costs' },
      {
        description: 'Review current infrastructure footprint and identify opportunities to reduce spend.',
        status: 'pending',
        priority: 'high',
        dueDate: DateTime.now().plus({ days: 21 }),
        createdById: manager.id,
        assignedToId: engineer.id,
      }
    )

    await Todo.updateOrCreate(
      { title: 'Migrate analytics pipeline' },
      {
        description: 'Move scheduled analytics workloads to the new data warehouse cluster.',
        status: 'blocked',
        priority: 'medium',
        dueDate: DateTime.now().plus({ days: 30 }),
        createdById: manager.id,
        assignedToId: engineer.id,
      }
    )

    await Todo.updateOrCreate(
      { title: 'Publish enterprise onboarding guide' },
      {
        description: 'Finalize the onboarding handbook for enterprise clients and publish it on the portal.',
        status: 'completed',
        priority: 'medium',
        dueDate: DateTime.now().minus({ days: 3 }),
        completedAt: DateTime.now().minus({ days: 1 }),
        createdById: admin.id,
        assignedToId: manager.id,
      }
    )
  }
}
