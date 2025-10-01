'use strict'

const User = use('App/Models/User')
const Todo = use('App/Models/Todo')

class InitialSeeder {
  async run () {
    const existing = await User.query().where('email', 'admin@enterprise.local').first()

    if (existing) {
      return
    }

    const admin = await User.create({
      full_name: 'System Administrator',
      email: 'admin@enterprise.local',
      password: 'Admin123!',
      role: 'admin',
      is_active: true
    })

    const teamLead = await User.create({
      full_name: 'Taylor TeamLead',
      email: 'teamlead@enterprise.local',
      password: 'TeamLead123!',
      role: 'team_lead',
      is_active: true
    })

    const user = await User.create({
      full_name: 'Uma User',
      email: 'user@enterprise.local',
      password: 'User123!',
      role: 'user',
      is_active: true
    })

    await Todo.createMany([
      {
        title: 'Prepare quarterly report',
        description: 'Gather financial and operational metrics for the quarterly business review.',
        priority: 'high',
        status: 'in_progress',
        due_date: new Date(),
        assigned_user_id: teamLead.id,
        created_by: admin.id
      },
      {
        title: 'Update onboarding checklist',
        description: 'Review onboarding tasks and ensure all steps are current.',
        priority: 'medium',
        status: 'pending',
        due_date: null,
        assigned_user_id: user.id,
        created_by: teamLead.id
      },
      {
        title: 'Automate backup process',
        description: 'Create scripts and documentation for nightly backups.',
        priority: 'high',
        status: 'pending',
        due_date: null,
        assigned_user_id: admin.id,
        created_by: admin.id
      }
    ])
  }
}

module.exports = InitialSeeder
