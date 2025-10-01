import { schema } from '@ioc:Adonis/Core/Validator'

export default class LoginValidator {
  public schema = schema.create({
    email: schema.string({ trim: true }),
    password: schema.string(),
  })
}
