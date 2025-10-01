import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class NotificationCreateValidator {
  public schema = schema.create({
    userId: schema.number([rules.exists({ table: 'users', column: 'id' })]),
    appointmentId: schema.number.optional([rules.exists({ table: 'appointments', column: 'id' })]),
    channel: schema.enum(['email', 'sms', 'in-app'] as const),
    title: schema.string({ trim: true }),
    message: schema.string({ trim: true }),
    scheduledFor: schema.date.optional({ format: 'yyyy-LL-dd HH:mm' }),
  })
}
