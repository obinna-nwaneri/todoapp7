const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({ message: 'Doctor Appointment API' });
});

module.exports = app;
