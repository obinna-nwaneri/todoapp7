import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class AppointmentCreateValidator {
  public schema = schema.create({
    doctorId: schema.number([rules.exists({ table: 'users', column: 'id', where: { role: 'doctor' } })]),
    patientId: schema.number([rules.exists({ table: 'users', column: 'id', where: { role: 'patient' } })]),
    scheduledAt: schema.date({ format: 'yyyy-LL-dd HH:mm' }),
    type: schema.enum(['physical', 'virtual'] as const),
    reason: schema.string.optional({ trim: true }),
    notes: schema.string.optional({ trim: true }),
  })
}
