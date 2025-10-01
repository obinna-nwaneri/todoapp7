import { schema, rules } from '@ioc:Adonis/Core/Validator'

export default class PatientRegistrationValidator {
  public schema = schema.create({
    name: schema.string({ trim: true }),
    email: schema.string({ trim: true }, [rules.email(), rules.unique({ table: 'users', column: 'email' })]),
    password: schema.string({}, [rules.minLength(6)]),
    phone: schema.string.optional({ trim: true }),
    gender: schema.string.optional({ trim: true }),
    dateOfBirth: schema.date.optional({ format: 'yyyy-LL-dd' }),
  })
}
