'use strict'

const Todo = use('App/Models/Todo')
const Database = use('Database')

function toNumber (value) {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    return Number(value)
  }

  return 0
}

async function countByStatus (status, userId) {
  const query = Todo.query().where('status', status)
  if (userId) {
    query.where('assigned_user_id', userId)
  }
  const result = await query.count('* as total')
  return toNumber(result[0].total)
}

class DashboardController {
  async overview ({ auth }) {
    const user = await auth.getUser()

    if (user.role === 'admin') {
      const [totalTasksRow, activeUsersRow] = await Promise.all([
        Database.from('todos').count('* as total'),
        Database.from('users').where('is_active', true).count('* as total')
      ])

      const [completedTasks, inProgressTasks, pendingTasks] = await Promise.all([
        countByStatus('completed'),
        countByStatus('in_progress'),
        countByStatus('pending')
      ])

      return {
        scope: 'admin',
        totalTasks: toNumber(totalTasksRow[0].total),
        completedTasks,
        inProgressTasks,
        pendingTasks,
        activeUsers: toNumber(activeUsersRow[0].total)
      }
    }

    const [totalTasksRow, completedTasks, inProgressTasks, pendingTasks] = await Promise.all([
      Database.from('todos').where('assigned_user_id', user.id).count('* as total'),
      countByStatus('completed', user.id),
      countByStatus('in_progress', user.id),
      countByStatus('pending', user.id)
    ])

    return {
      scope: user.role,
      totalTasks: toNumber(totalTasksRow[0].total),
      completedTasks,
      inProgressTasks,
      pendingTasks
    }
  }
}

module.exports = DashboardController
