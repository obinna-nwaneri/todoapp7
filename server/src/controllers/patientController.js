const bcrypt = require('bcryptjs');
const { Patient } = require('../models');

const listPatients = async (_req, res) => {
  try {
    const patients = await Patient.findAll({ attributes: { exclude: ['password'] } });
    res.json(patients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch patients' });
  }
};

const createPatient = async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const patient = await Patient.create({ name, email, phone, password: hashed });
    const { password: _, ...rest } = patient.toJSON();
    res.status(201).json(rest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create patient' });
  }
};

const updatePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    await patient.update(updates);
    const { password, ...rest } = patient.toJSON();
    res.json(rest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update patient' });
  }
};

const deletePatient = async (req, res) => {
  const { id } = req.params;
  try {
    const patient = await Patient.findByPk(id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    await patient.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete patient' });
  }
};

module.exports = {
  listPatients,
  createPatient,
  updatePatient,
  deletePatient,
};
