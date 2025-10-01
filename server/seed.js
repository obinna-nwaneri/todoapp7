require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Doctor, Patient, Appointment } = require('./src/models');

const seed = async () => {
  try {
    await sequelize.sync({ force: true });

    const doctorPasswords = await Promise.all([
      bcrypt.hash('password123', 10),
      bcrypt.hash('password123', 10),
      bcrypt.hash('password123', 10),
    ]);

    const patientPasswords = await Promise.all([
      bcrypt.hash('password123', 10),
      bcrypt.hash('password123', 10),
      bcrypt.hash('password123', 10),
    ]);

    const doctors = await Doctor.bulkCreate([
      {
        name: 'Dr. John Smith',
        specialization: 'Cardiologist',
        email: 'john@example.com',
        phone: '555-0001',
        password: doctorPasswords[0],
      },
      {
        name: 'Dr. Mary Jones',
        specialization: 'Dermatologist',
        email: 'mary@example.com',
        phone: '555-0002',
        password: doctorPasswords[1],
      },
      {
        name: 'Dr. Alan White',
        specialization: 'Pediatrician',
        email: 'alan@example.com',
        phone: '555-0003',
        password: doctorPasswords[2],
      },
    ]);

    const patients = await Patient.bulkCreate([
      {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '555-1001',
        password: patientPasswords[0],
      },
      {
        name: 'Michael Brown',
        email: 'michael@example.com',
        phone: '555-1002',
        password: patientPasswords[1],
      },
      {
        name: 'Sarah Lee',
        email: 'sarah@example.com',
        phone: '555-1003',
        password: patientPasswords[2],
      },
    ]);

    await Appointment.bulkCreate([
      {
        doctorId: doctors[0].id,
        patientId: patients[0].id,
        date: '2025-10-02',
        time: '10:00',
        status: 'Scheduled',
      },
      {
        doctorId: doctors[1].id,
        patientId: patients[1].id,
        date: '2025-10-03',
        time: '11:30',
        status: 'Scheduled',
      },
      {
        doctorId: doctors[2].id,
        patientId: patients[2].id,
        date: '2025-10-04',
        time: '09:00',
        status: 'Completed',
      },
      {
        doctorId: doctors[0].id,
        patientId: patients[1].id,
        date: '2025-10-05',
        time: '14:00',
        status: 'Cancelled',
      },
      {
        doctorId: doctors[1].id,
        patientId: patients[2].id,
        date: '2025-10-06',
        time: '16:00',
        status: 'Scheduled',
      },
    ]);

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed database', error);
    process.exit(1);
  }
};

seed();
