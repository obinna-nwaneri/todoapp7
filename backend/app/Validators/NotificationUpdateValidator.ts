import { schema } from '@ioc:Adonis/Core/Validator'

export default class NotificationUpdateValidator {
  public schema = schema.create({
    isRead: schema.boolean.optional(),
  })
}
