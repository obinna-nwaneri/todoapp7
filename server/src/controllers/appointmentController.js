const { Op } = require('sequelize');
const { Appointment, Doctor, Patient } = require('../models');

const listAppointments = async (req, res) => {
  const { doctorId, patientId, status } = req.query;
  const where = {};
  if (doctorId) where.doctorId = doctorId;
  if (patientId) where.patientId = patientId;
  if (status) where.status = status;

  try {
    const appointments = await Appointment.findAll({
      where,
      include: [
        { model: Doctor, attributes: { exclude: ['password'] } },
        { model: Patient, attributes: { exclude: ['password'] } },
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
    });
    return res.json(appointments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

const createAppointment = async (req, res) => {
  const { doctorId, patientId, date, time } = req.body;
  if (!doctorId || !patientId || !date || !time) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const doctor = await Doctor.findByPk(doctorId);
    const patient = await Patient.findByPk(patientId);
    if (!doctor || !patient) {
      return res.status(400).json({ message: 'Invalid doctor or patient' });
    }

    const conflict = await Appointment.findOne({
      where: {
        doctorId,
        date,
        time,
        status: { [Op.ne]: 'Cancelled' },
      },
    });

    if (conflict) {
      return res.status(409).json({ message: 'Doctor already has an appointment at that time' });
    }

    const appointment = await Appointment.create({ doctorId, patientId, date, time });
    const populated = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Doctor, attributes: { exclude: ['password'] } },
        { model: Patient, attributes: { exclude: ['password'] } },
      ],
    });

    return res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create appointment' });
  }
};

const updateAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const updates = {};
    if (req.user?.role === 'doctor') {
      if (req.body.status) {
        updates.status = req.body.status;
      }
    } else if (req.user?.role === 'admin') {
      if (req.body.date) updates.date = req.body.date;
      if (req.body.time) updates.time = req.body.time;
      if (req.body.status) updates.status = req.body.status;
      if (req.body.doctorId) updates.doctorId = req.body.doctorId;
      if (req.body.patientId) updates.patientId = req.body.patientId;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    if (updates.status) {
      const allowedStatuses = ['Scheduled', 'Completed', 'Cancelled'];
      if (!allowedStatuses.includes(updates.status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
    }

    await appointment.update(updates);
    const populated = await Appointment.findByPk(id, {
      include: [
        { model: Doctor, attributes: { exclude: ['password'] } },
        { model: Patient, attributes: { exclude: ['password'] } },
      ],
    });
    return res.json(populated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update appointment' });
  }
};

const deleteAppointment = async (req, res) => {
  const { id } = req.params;
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    await appointment.update({ status: 'Cancelled' });
    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to cancel appointment' });
  }
};

module.exports = {
  listAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
