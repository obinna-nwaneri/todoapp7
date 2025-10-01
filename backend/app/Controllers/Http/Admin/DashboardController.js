'use strict'

const Database = use('Database')

class DashboardController {
  async overview () {
    const [{ total: totalUsers }] = await Database.from('users').count('* as total')
    const [{ total: totalTasks }] = await Database.from('tasks').count('* as total')

    const tasksByStatus = await Database.from('tasks')
      .select('status')
      .count('* as count')
      .groupBy('status')

    const tasksPerUser = await Database.from('users')
      .leftJoin('tasks', 'users.id', 'tasks.user_id')
      .select('users.id', 'users.email')
      .count('tasks.id as task_count')
      .groupBy('users.id')
      .orderBy('users.email', 'asc')

    return {
      totalUsers: Number(totalUsers) || 0,
      totalTasks: Number(totalTasks) || 0,
      tasksByStatus: tasksByStatus.map((row) => ({ status: row.status, count: Number(row.count) })),
      tasksPerUser: tasksPerUser.map((row) => ({
        userId: row.id,
        email: row.email,
        count: Number(row.task_count)
      }))
    }
  }
}

module.exports = DashboardController
