import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import { DateTime } from 'luxon'

import User from 'App/Models/User'
import Appointment from 'App/Models/Appointment'
import TokenAuth from 'App/Services/TokenAuth'

export default class AdminController {
  public async dashboard (ctx: HttpContextContract) {
    const session = await TokenAuth.authenticate(ctx, ['admin'])
    if (!session) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }

    const [patients, doctors, appointments, revenue] = await Promise.all([
      User.query().where('role', 'patient').count('* as total').first(),
      User.query().where('role', 'doctor').count('* as total').first(),
      Appointment.query().count('* as total').first(),
      Appointment.query().where('status', 'completed').sum('fee as total').first(),
    ])

    const today = DateTime.now().startOf('day')
    const todaysBookings = await Appointment.query()
      .whereBetween('scheduled_at', [today.toSQL(), today.plus({ days: 1 }).toSQL()])
      .count('* as total')
      .first()

    const pendingApprovals = await User.query().where('role', 'doctor').where('is_active', false).count('* as total').first()

    return {
      data: {
        patients: Number(patients?.$extras.total || 0),
        doctors: Number(doctors?.$extras.total || 0),
        appointments: Number(appointments?.$extras.total || 0),
        revenue: Number(revenue?.$extras.total || 0),
        today: Number(todaysBookings?.$extras.total || 0),
        pendingApprovals: Number(pendingApprovals?.$extras.total || 0),
      },
    }
  }

  public async users (ctx: HttpContextContract) {
    const session = await TokenAuth.authenticate(ctx, ['admin'])
    if (!session) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }

    const role = ctx.request.input('role')
    const query = User.query().preload('doctorProfile')

    if (role) {
      query.where('role', role)
    }

    return { data: await query }
  }

  public async updateUserStatus (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['admin'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const user = await User.find(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    user.isActive = request.input('isActive', user.isActive)
    await user.save()

    return { message: 'User updated', data: user }
  }

  public async reports (ctx: HttpContextContract) {
    const session = await TokenAuth.authenticate(ctx, ['admin'])
    if (!session) {
      return ctx.response.unauthorized({ message: 'Unauthorized' })
    }

    const range = ctx.request.input('range', 'month')
    let groupFormat = '%Y-%m'

    if (range === 'day') {
      groupFormat = '%Y-%m-%d'
    } else if (range === 'week') {
      groupFormat = '%Y-%W'
    }

    const appointmentTrends = await Database.from('appointments')
      .select(Database.raw(`strftime('${groupFormat}', scheduled_at) as period`))
      .count('* as total')
      .groupBy('period')
      .orderBy('period')

    const doctorPerformance = await Database.from('appointments')
      .select('doctor_id as doctorId')
      .count('* as totalAppointments')
      .sum({ completed: Database.raw("CASE WHEN status = 'completed' THEN 1 ELSE 0 END") })
      .sum({ cancelled: Database.raw("CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END") })
      .groupBy('doctor_id')
      .orderBy('totalAppointments', 'desc')
      .limit(10)

    const patientStats = await Database.from('appointments')
      .select('patient_id as patientId')
      .count('* as totalVisits')
      .groupBy('patient_id')
      .orderBy('totalVisits', 'desc')
      .limit(10)

    return {
      data: {
        appointmentTrends,
        doctorPerformance,
        patientStats,
      },
    }
  }
}
