import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import Notification from 'App/Models/Notification'
import NotificationCreateValidator from 'App/Validators/NotificationCreateValidator'
import NotificationUpdateValidator from 'App/Validators/NotificationUpdateValidator'
import TokenAuth from 'App/Services/TokenAuth'

export default class NotificationsController {
  public async index ({ request }: HttpContextContract) {
    const userId = request.input('userId')
    const unread = request.input('unread')

    const query = Notification.query().orderBy('created_at', 'desc')

    if (userId) {
      query.where('user_id', userId)
    }

    if (unread === 'true') {
      query.where('is_read', false)
    }

    return { data: await query }
  }

  public async store (ctx: HttpContextContract) {
    const { request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['admin'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const payload = await request.validate(NotificationCreateValidator)

    const notification = await Notification.create({
      userId: payload.userId,
      appointmentId: payload.appointmentId ?? null,
      channel: payload.channel,
      title: payload.title,
      message: payload.message,
      scheduledFor: payload.scheduledFor ?? null,
    })

    return response.created({ message: 'Notification created', data: notification })
  }

  public async update (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx)
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const notification = await Notification.find(params.id)
    if (!notification) {
      return response.notFound({ message: 'Notification not found' })
    }

    if (notification.userId !== session.user.id && session.user.role !== 'admin') {
      return response.forbidden({ message: 'You can only update your own notifications' })
    }

    const payload = await request.validate(NotificationUpdateValidator)
    notification.merge({ isRead: payload.isRead ?? notification.isRead })
    await notification.save()

    return { message: 'Notification updated', data: notification }
  }
}
