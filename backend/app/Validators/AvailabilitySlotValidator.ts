import { schema } from '@ioc:Adonis/Core/Validator'

export const availabilitySlotSchema = schema.create({
  dayOfWeek: schema.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const),
  startTime: schema.string(),
  endTime: schema.string(),
  isAvailable: schema.boolean.optional(),
})

export default class AvailabilitySlotValidator {
  public schema = availabilitySlotSchema
}
