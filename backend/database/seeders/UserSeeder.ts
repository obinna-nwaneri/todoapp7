import type { SeederContract } from '@adonisjs/lucid/types'
import User from '../../app/Models/User.js'
import Todo from '../../app/Models/Todo.js'

export default class UserSeeder implements SeederContract {
  public async run() {
    const admin = await User.updateOrCreate(
      { email: 'admin@enterprise.todo' },
      {
        fullName: 'Enterprise Admin',
        role: 'admin',
      }
    )

    const jane = await User.updateOrCreate(
      { email: 'jane.doe@enterprise.todo' },
      {
        fullName: 'Jane Doe',
        role: 'member',
      }
    )

    const john = await User.updateOrCreate(
      { email: 'john.smith@enterprise.todo' },
      {
        fullName: 'John Smith',
        role: 'member',
      }
    )

    await Todo.updateOrCreateMany(
      ['title'],
      [
        {
          title: 'Review compliance policies',
          description: 'Ensure quarterly compliance audit tasks are assigned.',
          status: 'in_progress',
          userId: admin.id,
        },
        {
          title: 'Prepare sprint demo',
          description: 'Compile slides and talking points for executive demo.',
          status: 'pending',
          userId: jane.id,
        },
        {
          title: 'Migrate reporting database',
          description: 'Coordinate with infrastructure to migrate reporting database to new cluster.',
          status: 'pending',
          userId: john.id,
        },
        {
          title: 'Close Jira epic TOD-42',
          description: 'Verify all subtasks are complete and close the epic.',
          status: 'completed',
          userId: jane.id,
        },
      ]
    )
  }
}
