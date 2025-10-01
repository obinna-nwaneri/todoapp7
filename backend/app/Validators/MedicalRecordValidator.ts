import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class MedicalRecordValidator {
  public schema = schema.create({
    patientId: schema.number([rules.exists({ table: 'users', column: 'id', where: { role: 'patient' } })]),
    doctorId: schema.number.optional([rules.exists({ table: 'users', column: 'id', where: { role: 'doctor' } })]),
    appointmentId: schema.number.optional([rules.exists({ table: 'appointments', column: 'id' })]),
    summary: schema.string({ trim: true }),
    prescriptions: schema.string.optional({ trim: true }),
    recommendations: schema.string.optional({ trim: true }),
  })
}
