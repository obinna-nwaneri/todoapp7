import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'

import DoctorProfile from 'App/Models/DoctorProfile'
import AvailabilitySlot from 'App/Models/AvailabilitySlot'
import Appointment from 'App/Models/Appointment'
import { validator } from '@ioc:Adonis/Core/Validator'
import { availabilitySlotSchema } from 'App/Validators/AvailabilitySlotValidator'
import TokenAuth from 'App/Services/TokenAuth'

export default class DoctorsController {
  public async index ({ request }: HttpContextContract) {
    const specialty = request.input('specialty')
    const location = request.input('location')
    const search = request.input('search')
    const consultationType = request.input('type')

    const query = DoctorProfile.query()
      .preload('user')
      .preload('availabilitySlots')

    if (specialty) {
      query.whereILike('specialty', `%${specialty}%`)
    }

    if (location) {
      query.whereILike('location', `%${location}%`)
    }

    if (search) {
      query.where((builder) => {
        builder.whereILike('bio', `%${search}%`).orWhereHas('user', (userQuery) => {
          userQuery.whereILike('name', `%${search}%`)
        })
      })
    }

    const doctors = await query

    if (consultationType) {
      return {
        data: doctors.filter((doctor) => doctor.consultationModes.includes(consultationType)),
      }
    }

    return { data: doctors }
  }

  public async show ({ params, response }: HttpContextContract) {
    const doctor = await DoctorProfile.query()
      .where('id', params.id)
      .preload('user')
      .preload('availabilitySlots')
      .preload('appointments', (query) => {
        query.preload('patient').orderBy('scheduled_at', 'desc').limit(10)
      })
      .first()

    if (!doctor) {
      return response.notFound({ message: 'Doctor not found' })
    }

    return { data: doctor }
  }

  public async updateProfile (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['doctor'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    if (session.user.doctorProfile?.id !== Number(params.id)) {
      return response.forbidden({ message: 'You can only update your own profile' })
    }

    const doctorProfile = session.user.doctorProfile
    doctorProfile.merge({
      specialty: request.input('specialty', doctorProfile.specialty),
      location: request.input('location', doctorProfile.location),
      yearsExperience: request.input('yearsExperience', doctorProfile.yearsExperience),
      consultationFee: request.input('consultationFee', doctorProfile.consultationFee),
      bio: request.input('bio', doctorProfile.bio),
      consultationModes: request.input('consultationModes', doctorProfile.consultationModes),
      services: request.input('services', doctorProfile.services),
    })

    await doctorProfile.save()

    return { message: 'Profile updated', data: doctorProfile }
  }

  public async syncAvailability (ctx: HttpContextContract) {
    const { params, request, response } = ctx
    const session = await TokenAuth.authenticate(ctx, ['doctor'])
    if (!session) {
      return response.unauthorized({ message: 'Unauthorized' })
    }

    const doctorProfile = await DoctorProfile.find(params.id)
    if (!doctorProfile || doctorProfile.userId !== session.user.id) {
      return response.forbidden({ message: 'You can only update your own availability' })
    }

    const slots = request.input('slots', []) as any[]
    const validatedSlots: Array<Partial<AvailabilitySlot>> = []

    for (const slot of slots) {
      const validated = await validator.validate({ schema: availabilitySlotSchema, data: slot })
      validatedSlots.push({
        doctorProfileId: doctorProfile.id,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        isAvailable: validated.isAvailable ?? true,
      })
    }

    await AvailabilitySlot.query().where('doctor_profile_id', doctorProfile.id).delete()
    await AvailabilitySlot.createMany(validatedSlots)

    return {
      message: 'Availability updated',
      data: await doctorProfile.load('availabilitySlots'),
    }
  }

  public async appointments ({ params, request }: HttpContextContract) {
    const status = request.input('status')
    const startDate = request.input('startDate')
    const endDate = request.input('endDate')

    const query = Appointment.query()
      .where('doctor_id', params.id)
      .preload('patient')
      .orderBy('scheduled_at', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (startDate) {
      query.where('scheduled_at', '>=', DateTime.fromISO(startDate).toSQL())
    }

    if (endDate) {
      query.where('scheduled_at', '<=', DateTime.fromISO(endDate).toSQL())
    }

    const appointments = await query

    return { data: appointments }
  }
}
