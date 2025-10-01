import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'

import Appointment from 'App/Models/Appointment'
import Notification from 'App/Models/Notification'
import AppointmentCreateValidator from 'App/Validators/AppointmentCreateValidator'
import AppointmentStatusValidator from 'App/Validators/AppointmentStatusValidator'
import AppointmentRescheduleValidator from 'App/Validators/AppointmentRescheduleValidator'
import TokenAuth from 'App/Services/TokenAuth'

async function ensureAvailability (doctorId: number, scheduledAt: DateTime) {
  const overlapping = await Appointment.query()
    .where('doctor_id', doctorId)
    .whereNot('status', 'cancelled')
    .andWhere((builder) => {
      const start = scheduledAt.minus({ minutes: 29 }).toISO()
      const end = scheduledAt.plus({ minutes: 29 }).toISO()
      if (start && end) {
        builder.where('scheduled_at', '>=', start).where('scheduled_at', '<=', end)
      }
    })
    .first()

  return !overlapping
}

export default class AppointmentsController {
  public async index ({ request }: HttpContextContract) {
    const status = request.input('status')
    const doctorId = request.input('doctorId')
    const patientId = request.input('patientId')

    const query = Appointment.query()
      .preload('doctor')
      .preload('patient')
      .orderBy('scheduled_at', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (doctorId) {
      query.where('doctor_id', doctorId)
    }

    if (patientId) {
      query.where('patient_id', patientId)
    }

    return { data: await query }
  }

  public async store (ctx: HttpContextContract) {
    const { request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['patient', 'admin'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const payload = await request.validate(AppointmentCreateValidator)
    const scheduledAt = payload.scheduledAt.toUTC()

    if (session.user.role === 'patient' && payload.patientId !== session.user.id) {
      return response.forbidden({ message: 'Patients can only book for themselves' })
    }

    const isAvailable = await ensureAvailability(payload.doctorId, scheduledAt)
    if (!isAvailable) {
      return response.conflict({ message: 'Doctor already has an appointment for the selected slot' })
    }

    const appointment = await Appointment.create({
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      scheduledAt,
      type: payload.type,
      reason: payload.reason ?? null,
      notes: payload.notes ?? null,
      status: 'pending',
    })

    await Notification.create({
      userId: payload.doctorId,
      appointmentId: appointment.id,
      channel: 'in-app',
      title: 'New appointment request',
      message: `You have a new ${payload.type} appointment request from patient #${payload.patientId}`,
    })

    return response.created({
      message: 'Appointment booked successfully',
      data: await appointment.load('doctor').load('patient'),
    })
  }

  public async updateStatus (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['doctor', 'admin'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const appointment = await Appointment.find(params.id)
    if (!appointment) {
      return response.notFound({ message: 'Appointment not found' })
    }

    if (session.user.role === 'doctor' && appointment.doctorId !== session.user.id) {
      return response.forbidden({ message: 'You can only modify your appointments' })
    }

    const payload = await request.validate(AppointmentStatusValidator)
    appointment.status = payload.status
    appointment.notes = payload.notes ?? appointment.notes

    if (payload.status === 'completed') {
      appointment.completedAt = DateTime.utc()
    }

    await appointment.save()

    await Notification.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      channel: 'in-app',
      title: 'Appointment status updated',
      message: `Your appointment status is now ${payload.status}`,
    })

    return { message: 'Status updated', data: appointment }
  }

  public async reschedule (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['doctor', 'admin', 'patient'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const appointment = await Appointment.find(params.id)
    if (!appointment) {
      return response.notFound({ message: 'Appointment not found' })
    }

    if (session.user.role === 'doctor' && appointment.doctorId !== session.user.id) {
      return response.forbidden({ message: 'You can only modify your appointments' })
    }

    if (session.user.role === 'patient' && appointment.patientId !== session.user.id) {
      return response.forbidden({ message: 'You can only modify your appointments' })
    }

    const payload = await request.validate(AppointmentRescheduleValidator)
    const scheduledAt = payload.scheduledAt.toUTC()

    const isAvailable = await ensureAvailability(appointment.doctorId, scheduledAt)
    if (!isAvailable) {
      return response.conflict({ message: 'Doctor already has an appointment for the selected slot' })
    }

    appointment.scheduledAt = scheduledAt
    appointment.status = 'pending'
    appointment.notes = payload.reason ?? appointment.notes
    await appointment.save()

    await Notification.create({
      userId: appointment.doctorId,
      appointmentId: appointment.id,
      channel: 'in-app',
      title: 'Appointment rescheduled',
      message: `Appointment #${appointment.id} has been rescheduled`,
    })

    return { message: 'Appointment rescheduled', data: appointment }
  }

  public async destroy (ctx: HttpContextContract) {
    const { params, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['doctor', 'admin', 'patient'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const appointment = await Appointment.find(params.id)
    if (!appointment) {
      return response.notFound({ message: 'Appointment not found' })
    }

    if (session.user.role === 'doctor' && appointment.doctorId !== session.user.id) {
      return response.forbidden({ message: 'You can only modify your appointments' })
    }

    if (session.user.role === 'patient' && appointment.patientId !== session.user.id) {
      return response.forbidden({ message: 'You can only modify your appointments' })
    }

    appointment.status = 'cancelled'
    await appointment.save()

    await Notification.create({
      userId: appointment.patientId,
      appointmentId: appointment.id,
      channel: 'in-app',
      title: 'Appointment cancelled',
      message: `Appointment #${appointment.id} has been cancelled`,
    })

    return { message: 'Appointment cancelled' }
  }
}
