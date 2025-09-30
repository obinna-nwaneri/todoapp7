const express = require('express');
const { Op } = require('sequelize');
const { Appointment, Doctor, Patient } = require('../models');

const router = express.Router();
const ALLOWED_STATUSES = ['Scheduled', 'Completed', 'Cancelled'];

const appointmentIncludes = [
  {
    model: Doctor,
    as: 'doctor',
    attributes: ['id', 'name', 'specialization', 'email', 'phone'],
  },
  {
    model: Patient,
    as: 'patient',
    attributes: ['id', 'name', 'email', 'phone'],
  },
];

router.get('/', async (req, res, next) => {
  try {
    const appointments = await Appointment.findAll({
      include: appointmentIncludes,
      order: [
        ['date', 'ASC'],
        ['time', 'ASC'],
      ],
    });
    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { doctorId, patientId, date, time, status } = req.body;

    if (!doctorId || !patientId || !date || !time) {
      return res.status(400).json({ message: 'doctorId, patientId, date, and time are required.' });
    }

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid appointment status.' });
    }

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found.' });
    }

    const conflict = await Appointment.findOne({
      where: {
        doctorId,
        date,
        time,
        status: { [Op.not]: 'Cancelled' },
      },
    });

    if (conflict) {
      return res.status(409).json({ message: 'Doctor already has an appointment scheduled at that time.' });
    }

    const appointment = await Appointment.create({
      doctorId,
      patientId,
      date,
      time,
      status: status || 'Scheduled',
    });

    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    });

    res.status(201).json(createdAppointment);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { doctorId, patientId, date, time, status } = req.body;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const updatedDoctorId = doctorId ?? appointment.doctorId;
    const updatedPatientId = patientId ?? appointment.patientId;
    const updatedDate = date ?? appointment.date;
    const updatedTime = time ?? appointment.time;
    const updatedStatus = status ?? appointment.status;

    if (!ALLOWED_STATUSES.includes(updatedStatus)) {
      return res.status(400).json({ message: 'Invalid appointment status.' });
    }

    if (doctorId !== undefined) {
      const doctor = await Doctor.findByPk(updatedDoctorId);
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor not found.' });
      }
    }

    if (patientId !== undefined) {
      const patient = await Patient.findByPk(updatedPatientId);
      if (!patient) {
        return res.status(404).json({ message: 'Patient not found.' });
      }
    }

    const conflict = await Appointment.findOne({
      where: {
        id: { [Op.ne]: appointment.id },
        doctorId: updatedDoctorId,
        date: updatedDate,
        time: updatedTime,
        status: { [Op.not]: 'Cancelled' },
      },
    });

    if (conflict) {
      return res.status(409).json({ message: 'Doctor already has an appointment scheduled at that time.' });
    }

    appointment.doctorId = updatedDoctorId;
    appointment.patientId = updatedPatientId;
    appointment.date = updatedDate;
    appointment.time = updatedTime;
    appointment.status = updatedStatus;

    await appointment.save();

    const updatedAppointment = await Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    });

    res.json(updatedAppointment);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    const cancelledAppointment = await Appointment.findByPk(appointment.id, {
      include: appointmentIncludes,
    });

    res.json({ message: 'Appointment cancelled successfully.', appointment: cancelledAppointment });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
