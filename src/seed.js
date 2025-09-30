const { sequelize, Doctor, Patient, Appointment } = require('./models');

async function seed() {
  try {
    await sequelize.sync({ force: true });

    const doctors = await Doctor.bulkCreate(
      [
        {
          name: 'Dr. John Smith',
          specialization: 'Cardiologist',
          email: 'john@example.com',
          phone: '555-0001',
        },
        {
          name: 'Dr. Mary Jones',
          specialization: 'Dermatologist',
          email: 'mary@example.com',
          phone: '555-0002',
        },
        {
          name: 'Dr. Alan White',
          specialization: 'Pediatrician',
          email: 'alan@example.com',
          phone: '555-0003',
        },
      ],
      { returning: true }
    );

    const patients = await Patient.bulkCreate(
      [
        {
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '555-1001',
        },
        {
          name: 'Michael Brown',
          email: 'michael@example.com',
          phone: '555-1002',
        },
        {
          name: 'Sarah Lee',
          email: 'sarah@example.com',
          phone: '555-1003',
        },
      ],
      { returning: true }
    );

    const [drSmith, drJones, drWhite] = doctors;
    const [janeDoe, michaelBrown, sarahLee] = patients;

    await Appointment.bulkCreate([
      {
        doctorId: drSmith.id,
        patientId: janeDoe.id,
        date: '2025-10-01',
        time: '10:00',
        status: 'Scheduled',
      },
      {
        doctorId: drJones.id,
        patientId: michaelBrown.id,
        date: '2025-10-02',
        time: '11:30',
        status: 'Scheduled',
      },
      {
        doctorId: drWhite.id,
        patientId: sarahLee.id,
        date: '2025-10-03',
        time: '09:00',
        status: 'Completed',
      },
      {
        doctorId: drSmith.id,
        patientId: michaelBrown.id,
        date: '2025-10-04',
        time: '13:00',
        status: 'Completed',
      },
      {
        doctorId: drJones.id,
        patientId: janeDoe.id,
        date: '2025-10-05',
        time: '15:15',
        status: 'Scheduled',
      },
    ]);

    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Failed to seed database:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
