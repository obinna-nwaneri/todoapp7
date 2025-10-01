import type { HttpContext } from '@adonisjs/core/http'
import Todo from '#app/Models/Todo'
import User from '#app/Models/User'

export default class DashboardController {
  public async index({ auth }: HttpContext) {
    const user = auth.user!
    if (user.role === 'admin') {
      const [totalUsers, activeTasks, completedTasks, overdueTasks] = await Promise.all([
        User.query().count('* as total'),
        Todo.query().where('status', 'in_progress').count('* as total'),
        Todo.query().where('status', 'completed').count('* as total'),
        Todo.query().where('status', 'pending').whereRaw('due_date < now()').count('* as total'),
      ])

      return {
        overview: {
          users: Number(totalUsers[0].$extras.total || 0),
          inProgress: Number(activeTasks[0].$extras.total || 0),
          completed: Number(completedTasks[0].$extras.total || 0),
          overdue: Number(overdueTasks[0].$extras.total || 0),
        },
      }
    }

    const myTasks = await Todo.query()
      .where('userId', user.id)
      .select('status')
    const stats = myTasks.reduce(
      (acc, todo) => {
        acc[todo.status] = (acc[todo.status] || 0) + 1
        return acc
      },
      { pending: 0, in_progress: 0, completed: 0 } as Record<string, number>
    )

    return {
      overview: stats,
    }
  }
}
