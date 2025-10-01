'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface) {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);
    const now = new Date();

    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        isAdmin: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: 'Normal User',
        email: 'user@example.com',
        password: userPassword,
        isAdmin: false,
        createdAt: now,
        updatedAt: now,
      },
    ]);

    const [adminUser] = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE email = :email LIMIT 1',
      { replacements: { email: 'admin@example.com' }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const [normalUser] = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" WHERE email = :email LIMIT 1',
      { replacements: { email: 'user@example.com' }, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    await queryInterface.bulkInsert('Todos', [
      {
        title: 'Prepare quarterly report',
        description: 'Compile financial data and prepare presentation for leadership.',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'high',
        status: 'in-progress',
        userId: adminUser.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Review security policies',
        description: 'Audit current policies and suggest updates for compliance.',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'pending',
        userId: adminUser.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Update CRM records',
        description: 'Ensure all client interactions are logged for the week.',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        status: 'pending',
        userId: normalUser.id,
        createdAt: now,
        updatedAt: now,
      },
      {
        title: 'Schedule team meeting',
        description: 'Coordinate with team to schedule sprint planning.',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        priority: 'low',
        status: 'pending',
        userId: normalUser.id,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Todos', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  },
};
