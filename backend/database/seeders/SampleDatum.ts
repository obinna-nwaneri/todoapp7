import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { DateTime } from 'luxon'

import User from 'App/Models/User'
import DoctorProfile from 'App/Models/DoctorProfile'
import AvailabilitySlot from 'App/Models/AvailabilitySlot'
import Appointment from 'App/Models/Appointment'
import MedicalRecord from 'App/Models/MedicalRecord'

export default class SampleDataSeeder extends BaseSeeder {
  public async run () {
    const admin = await User.updateOrCreate(
      { email: 'admin@healthplus.test' },
      {
        name: 'System Admin',
        password: 'Admin@123',
        role: 'admin',
      }
    )

    const doctor = await User.updateOrCreate(
      { email: 'dr.smith@healthplus.test' },
      {
        name: 'Dr. Emily Smith',
        password: 'Doctor@123',
        phone: '+1-555-1010',
        role: 'doctor',
        isActive: true,
      }
    )

    const doctorProfile = await DoctorProfile.updateOrCreate(
      { userId: doctor.id },
      {
        specialty: 'Cardiology',
        location: 'Downtown Clinic',
        yearsExperience: 12,
        consultationFee: 120,
        bio: 'Board-certified cardiologist focusing on preventive care and telehealth.',
        consultationModes: ['physical', 'virtual'],
        services: ['ECG', 'Heart health consultation', 'Follow-up visit'],
      }
    )

    await AvailabilitySlot.updateOrCreateMany(
      ['doctorProfileId', 'dayOfWeek', 'startTime'],
      [
        {
          doctorProfileId: doctorProfile.id,
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '12:00',
          isAvailable: true,
        },
        {
          doctorProfileId: doctorProfile.id,
          dayOfWeek: 'wednesday',
          startTime: '13:00',
          endTime: '17:00',
          isAvailable: true,
        },
      ]
    )

    const patient = await User.updateOrCreate(
      { email: 'john.doe@healthplus.test' },
      {
        name: 'John Doe',
        password: 'Patient@123',
        phone: '+1-555-2020',
        role: 'patient',
        isActive: true,
      }
    )

    const appointment = await Appointment.updateOrCreate(
      {
        doctorId: doctor.id,
        patientId: patient.id,
        scheduledAt: DateTime.now().plus({ days: 2 }).startOf('hour'),
      },
      {
        type: 'virtual',
        status: 'confirmed',
        fee: 120,
        reason: 'Follow-up consultation',
      }
    )

    await MedicalRecord.updateOrCreate(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        appointmentId: appointment.id,
      },
      {
        summary: 'Routine follow-up visit. Patient reports improved stamina and reduced palpitations.',
        prescriptions: 'Continue beta blockers (50mg daily)',
        recommendations: 'Schedule stress test next month and maintain exercise routine.',
      }
    )

    console.info('Seeded admin, doctor, patient, and sample appointment')
    console.info('Admin login: admin@healthplus.test / Admin@123')
    console.info('Doctor login: dr.smith@healthplus.test / Doctor@123')
    console.info('Patient login: john.doe@healthplus.test / Patient@123')
  }
}
