const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Doctor, Patient } = require('../models');
const { secret } = require('../middleware/auth');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const generateToken = (payload) =>
  jwt.sign(payload, secret, { expiresIn: '12h' });

const login = async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required' });
  }

  try {
    if (role === 'admin') {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = generateToken({ role: 'admin', email });
        return res.json({ token, role: 'admin', user: { email } });
      }
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    if (role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { email } });
      if (!doctor) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, doctor.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken({ role: 'doctor', id: doctor.id });
      return res.json({
        token,
        role: 'doctor',
        user: {
          id: doctor.id,
          name: doctor.name,
          email: doctor.email,
          specialization: doctor.specialization,
        },
      });
    }

    if (role === 'patient') {
      const patient = await Patient.findOne({ where: { email } });
      if (!patient) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, patient.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const token = generateToken({ role: 'patient', id: patient.id });
      return res.json({
        token,
        role: 'patient',
        user: {
          id: patient.id,
          name: patient.name,
          email: patient.email,
        },
      });
    }

    return res.status(400).json({ message: 'Unsupported role' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  login,
};
