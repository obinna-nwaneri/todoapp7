const express = require('express');
const doctorsRouter = require('./routes/doctors');
const patientsRouter = require('./routes/patients');
const appointmentsRouter = require('./routes/appointments');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Doctor appointment scheduling API' });
});

app.use('/api/doctors', doctorsRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/appointments', appointmentsRouter);

app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found.' });
});

app.use((err, req, res, next) => {
  console.error(err);

  if (['SequelizeValidationError', 'SequelizeUniqueConstraintError'].includes(err.name)) {
    const errors = err.errors?.map((error) => error.message) ?? [err.message];
    return res.status(400).json({ message: 'Validation error', errors });
  }

  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
