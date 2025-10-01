import { schema } from '@ioc:Adonis/Core/Validator'

export default class AppointmentStatusValidator {
  public schema = schema.create({
    status: schema.enum(['pending', 'confirmed', 'cancelled', 'completed'] as const),
    notes: schema.string.optional({ trim: true }),
  })
}
