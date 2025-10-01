import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'

import Appointment from 'App/Models/Appointment'
import MedicalRecord from 'App/Models/MedicalRecord'
import TokenAuth from 'App/Services/TokenAuth'

export default class PatientsController {
  public async appointments (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['patient'])
    if (!session || session.user.id !== Number(params.id)) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const status = request.input('status')
    const query = Appointment.query()
      .where('patient_id', params.id)
      .preload('doctor')
      .orderBy('scheduled_at', 'desc')

    if (status) {
      query.where('status', status)
    }

    const appointments = await query
    return { data: appointments }
  }

  public async history (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['patient'])
    if (!session || session.user.id !== Number(params.id)) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const startDate = request.input('startDate')
    const endDate = request.input('endDate')

    const query = Appointment.query()
      .where('patient_id', params.id)
      .where('status', 'completed')
      .preload('doctor')
      .orderBy('scheduled_at', 'desc')

    if (startDate) {
      query.where('scheduled_at', '>=', DateTime.fromISO(startDate).toSQL())
    }

    if (endDate) {
      query.where('scheduled_at', '<=', DateTime.fromISO(endDate).toSQL())
    }

    return { data: await query }
  }

  public async records (ctx: HttpContextContract) {
    const { params, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['patient'])
    if (!session || session.user.id !== Number(params.id)) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const records = await MedicalRecord.query()
      .where('patient_id', params.id)
      .preload('doctor')
      .preload('appointment')
      .orderBy('created_at', 'desc')

    return { data: records }
  }
}
