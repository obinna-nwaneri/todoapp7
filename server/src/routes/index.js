const express = require('express');
const authController = require('../controllers/authController');
const doctorController = require('../controllers/doctorController');
const patientController = require('../controllers/patientController');
const appointmentController = require('../controllers/appointmentController');
const { Appointment } = require('../models');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Auth
router.post('/login', authController.login);

// Doctors
router.get('/doctors', doctorController.listDoctors);
router.post('/doctors', authenticate, authorizeRoles('admin'), doctorController.createDoctor);
router.put('/doctors/:id', authenticate, authorizeRoles('admin'), doctorController.updateDoctor);
router.delete('/doctors/:id', authenticate, authorizeRoles('admin'), doctorController.deleteDoctor);

// Patients
router.get('/patients', authenticate, authorizeRoles('admin'), patientController.listPatients);
router.post('/patients', patientController.createPatient);
router.put('/patients/:id', authenticate, authorizeRoles('admin'), patientController.updatePatient);
router.delete('/patients/:id', authenticate, authorizeRoles('admin'), patientController.deletePatient);

// Appointments
router.get(
  '/appointments',
  authenticate,
  authorizeRoles('admin', 'doctor', 'patient'),
  (req, res, next) => {
    const query = { ...req.query };
    if (req.user.role === 'doctor') {
      query.doctorId = req.user.id;
    }
    if (req.user.role === 'patient') {
      query.patientId = req.user.id;
    }
    req.query = query;
    return appointmentController.listAppointments(req, res, next);
  }
);

router.post(
  '/appointments',
  authenticate,
  authorizeRoles('patient'),
  (req, res, next) => {
    req.body.patientId = req.user.id;
    return appointmentController.createAppointment(req, res, next);
  }
);

router.put(
  '/appointments/:id',
  authenticate,
  authorizeRoles('admin', 'doctor'),
  async (req, res, next) => {
    if (req.user.role === 'doctor') {
      const appointment = await Appointment.findByPk(req.params.id);
      if (!appointment || appointment.doctorId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    return appointmentController.updateAppointment(req, res, next);
  }
);

router.delete(
  '/appointments/:id',
  authenticate,
  authorizeRoles('admin', 'doctor', 'patient'),
  async (req, res, next) => {
    if (req.user.role === 'doctor') {
      const appointment = await Appointment.findByPk(req.params.id);
      if (!appointment || appointment.doctorId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    if (req.user.role === 'patient') {
      const appointment = await Appointment.findByPk(req.params.id);
      if (!appointment || appointment.patientId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    return appointmentController.deleteAppointment(req, res, next);
  }
);

module.exports = router;
