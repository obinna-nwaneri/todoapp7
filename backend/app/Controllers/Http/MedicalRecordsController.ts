import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import MedicalRecord from 'App/Models/MedicalRecord'
import MedicalRecordValidator from 'App/Validators/MedicalRecordValidator'
import TokenAuth from 'App/Services/TokenAuth'

export default class MedicalRecordsController {
  public async index ({ request }: HttpContextContract) {
    const patientId = request.input('patientId')
    const doctorId = request.input('doctorId')

    const query = MedicalRecord.query()
      .preload('patient')
      .preload('doctor')
      .preload('appointment')
      .orderBy('created_at', 'desc')

    if (patientId) {
      query.where('patient_id', patientId)
    }

    if (doctorId) {
      query.where('doctor_id', doctorId)
    }

    return { data: await query }
  }

  public async store (ctx: HttpContextContract) {
    const { request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['doctor', 'admin'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const payload = await request.validate(MedicalRecordValidator)

    if (session.user.role === 'doctor' && payload.doctorId && payload.doctorId !== session.user.id) {
      return response.forbidden({ message: 'You can only create records for yourself' })
    }

    const record = await MedicalRecord.create({
      patientId: payload.patientId,
      doctorId: payload.doctorId ?? session.user.id,
      appointmentId: payload.appointmentId ?? null,
      summary: payload.summary,
      prescriptions: payload.prescriptions ?? null,
      recommendations: payload.recommendations ?? null,
    })

    return response.created({ message: 'Record saved', data: record })
  }
}
