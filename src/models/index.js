const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
});

const Doctor = sequelize.define(
  'Doctor',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: 'doctors',
    underscored: true,
  }
);

const Patient = sequelize.define(
  'Patient',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    tableName: 'patients',
    underscored: true,
  }
);

const Appointment = sequelize.define(
  'Appointment',
  {
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
      allowNull: false,
      defaultValue: 'Scheduled',
    },
  },
  {
    tableName: 'appointments',
    underscored: true,
  }
);

Doctor.hasMany(Appointment, {
  foreignKey: { name: 'doctorId', field: 'doctor_id', allowNull: false },
  as: 'appointments',
});
Appointment.belongsTo(Doctor, {
  foreignKey: { name: 'doctorId', field: 'doctor_id', allowNull: false },
  as: 'doctor',
});

Patient.hasMany(Appointment, {
  foreignKey: { name: 'patientId', field: 'patient_id', allowNull: false },
  as: 'appointments',
});
Appointment.belongsTo(Patient, {
  foreignKey: { name: 'patientId', field: 'patient_id', allowNull: false },
  as: 'patient',
});

module.exports = {
  sequelize,
  Doctor,
  Patient,
  Appointment,
};
