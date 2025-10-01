const { Sequelize } = require('sequelize');
const DoctorModel = require('./doctor');
const PatientModel = require('./patient');
const AppointmentModel = require('./appointment');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.SQLITE_STORAGE || 'database.sqlite',
  logging: false,
});

const Doctor = DoctorModel(sequelize);
const Patient = PatientModel(sequelize);
const Appointment = AppointmentModel(sequelize);

Doctor.hasMany(Appointment, { foreignKey: 'doctorId' });
Patient.hasMany(Appointment, { foreignKey: 'patientId' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctorId' });
Appointment.belongsTo(Patient, { foreignKey: 'patientId' });

module.exports = {
  sequelize,
  Doctor,
  Patient,
  Appointment,
};
