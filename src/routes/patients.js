const express = require('express');
const { Patient } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const patients = await Patient.findAll({ order: [['name', 'ASC']] });
    res.json(patients);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
