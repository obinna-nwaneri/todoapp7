import { schema } from '@ioc:Adonis/Core/Validator'

export default class AppointmentRescheduleValidator {
  public schema = schema.create({
    scheduledAt: schema.date({ format: 'yyyy-LL-dd HH:mm' }),
    reason: schema.string.optional({ trim: true }),
  })
}
