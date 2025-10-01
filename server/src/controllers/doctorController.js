const bcrypt = require('bcryptjs');
const { Doctor } = require('../models');

const listDoctors = async (_req, res) => {
  try {
    const doctors = await Doctor.findAll({ attributes: { exclude: ['password'] } });
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch doctors' });
  }
};

const createDoctor = async (req, res) => {
  const { name, specialization, email, phone, password } = req.body;
  if (!name || !specialization || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const doctor = await Doctor.create({ name, specialization, email, phone, password: hashed });
    const { password: _, ...rest } = doctor.toJSON();
    res.status(201).json(rest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create doctor' });
  }
};

const updateDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    await doctor.update(updates);
    const { password, ...rest } = doctor.toJSON();
    res.json(rest);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update doctor' });
  }
};

const deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    await doctor.destroy();
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete doctor' });
  }
};

module.exports = {
  listDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
