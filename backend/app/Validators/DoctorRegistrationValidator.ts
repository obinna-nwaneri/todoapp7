import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class DoctorRegistrationValidator {
  public schema = schema.create({
    name: schema.string({ trim: true }),
    email: schema.string({ trim: true }, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
    password: schema.string({}, [rules.minLength(6)]),
    phone: schema.string.optional({ trim: true }),
    specialty: schema.string({ trim: true }),
    location: schema.string.optional({ trim: true }),
    yearsExperience: schema.number.optional(),
    consultationFee: schema.number.optional(),
    bio: schema.string.optional({ trim: true }),
    consultationModes: schema.array.optional().members(schema.enum(['physical', 'virtual'] as const)),
    services: schema.array.optional().members(schema.string({ trim: true })),
  })
}
