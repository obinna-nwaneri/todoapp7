import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { DateTime } from 'luxon'
import crypto from 'crypto'

import User from 'App/Models/User'
import DoctorProfile from 'App/Models/DoctorProfile'
import SessionToken from 'App/Models/SessionToken'
import PatientRegistrationValidator from 'App/Validators/PatientRegistrationValidator'
import DoctorRegistrationValidator from 'App/Validators/DoctorRegistrationValidator'
import LoginValidator from 'App/Validators/LoginValidator'
import { validator } from '@ioc:Adonis/Core/Validator'
import { availabilitySlotSchema } from 'App/Validators/AvailabilitySlotValidator'
import AvailabilitySlot from 'App/Models/AvailabilitySlot'
import Hash from '@ioc:Adonis/Core/Hash'

function extractToken (request: HttpContextContract['request']) {
  const header = request.header('authorization') || ''
  const [, token] = header.split(' ')
  return token
}

async function ensureToken (token: string | undefined) {
  if (!token) {
    return null
  }

  return SessionToken.query()
    .where('token', token)
    .where('expires_at', '>', DateTime.utc().toSQL())
    .preload('user', (query) => query.preload('doctorProfile'))
    .first()
}

async function issueToken (user: User, device?: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = DateTime.utc().plus({ days: 7 })
  const session = await SessionToken.create({
    userId: user.id,
    token,
    device: device || null,
    expiresAt,
  })

  return session
}

export default class AuthController {
  public async registerPatient ({ request, response }: HttpContextContract) {
    const payload = await request.validate(PatientRegistrationValidator)

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone ?? null,
      gender: payload.gender ?? null,
      dateOfBirth: payload.dateOfBirth ?? null,
      role: 'patient',
    })

    const session = await issueToken(user)

    return response.created({
      message: 'Patient registered successfully',
      data: {
        user,
        token: session.token,
      },
    })
  }

  public async registerDoctor ({ request, response }: HttpContextContract) {
    const payload = await request.validate(DoctorRegistrationValidator)
    const availabilityPayload = request.input('availability', []) as any[]

    const user = await User.create({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      phone: payload.phone ?? null,
      role: 'doctor',
    })

    const doctorProfile = await DoctorProfile.create({
      userId: user.id,
      specialty: payload.specialty,
      location: payload.location ?? null,
      yearsExperience: payload.yearsExperience ?? 0,
      consultationFee: payload.consultationFee ?? 0,
      bio: payload.bio ?? null,
      consultationModes: payload.consultationModes ?? ['physical', 'virtual'],
      services: payload.services ?? null,
    })

    if (availabilityPayload.length) {
      for (const slot of availabilityPayload) {
        const validated = await validator.validate({ schema: availabilitySlotSchema, data: slot })
        await AvailabilitySlot.create({
          doctorProfileId: doctorProfile.id,
          dayOfWeek: validated.dayOfWeek,
          startTime: validated.startTime,
          endTime: validated.endTime,
          isAvailable: validated.isAvailable ?? true,
        })
      }
    }

    const session = await issueToken(user)

    return response.created({
      message: 'Doctor registered successfully',
      data: {
        user: await user.load('doctorProfile', (query) => query.preload('availabilitySlots')),
        token: session.token,
      },
    })
  }

  public async login ({ request, response }: HttpContextContract) {
    const payload = await request.validate(LoginValidator)
    const user = await User.query().where('email', payload.email).first()

    if (!user || !(await Hash.verify(user.password, payload.password))) {
      return response.unauthorized({ message: 'Invalid email or password' })
    }

    user.lastLoginAt = DateTime.utc()
    await user.save()

    const session = await issueToken(user)

    return {
      message: 'Login successful',
      data: {
        user: await user
          .load('doctorProfile', (query) => query.preload('availabilitySlots'))
          .catch(() => user),
        token: session.token,
      },
    }
  }

  public async logout ({ request, response }: HttpContextContract) {
    const token = extractToken(request)
    if (!token) {
      return response.badRequest({ message: 'Missing token' })
    }

    await SessionToken.query().where('token', token).delete()
    return { message: 'Logged out successfully' }
  }

  public async me ({ request, response }: HttpContextContract) {
    const token = extractToken(request)
    const session = await ensureToken(token)

    if (!session) {
      return response.unauthorized({ message: 'Invalid or expired token' })
    }

    return {
      data: {
        user: session.user,
        token: session.token,
        expiresAt: session.expiresAt,
      },
    }
  }
}
