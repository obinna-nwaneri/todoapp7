const express = require('express');
const { Doctor } = require('../models');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({ order: [['name', 'ASC']] });
    res.json(doctors);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
