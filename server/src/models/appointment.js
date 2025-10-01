const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
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
  });

  return Appointment;
};
