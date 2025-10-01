'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Users', [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Normal User',
        email: 'user@example.com',
        password: await bcrypt.hash('user123', 10),
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    const [users] = await queryInterface.sequelize.query(
      "SELECT id, email FROM \"Users\" WHERE email IN ('admin@example.com','user@example.com')"
    );

    const adminUser = users.find((user) => user.email === 'admin@example.com');
    const normalUser = users.find((user) => user.email === 'user@example.com');

    await queryInterface.bulkInsert('Todos', [
      {
        title: 'Admin Todo 1',
        description: 'Review quarterly reports',
        dueDate: new Date(),
        priority: 'high',
        status: 'in-progress',
        userId: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'Admin Todo 2',
        description: 'Plan team meeting',
        dueDate: new Date(),
        priority: 'medium',
        status: 'pending',
        userId: adminUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'User Todo 1',
        description: 'Complete documentation',
        dueDate: new Date(),
        priority: 'medium',
        status: 'pending',
        userId: normalUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        title: 'User Todo 2',
        description: 'Update project board',
        dueDate: new Date(),
        priority: 'low',
        status: 'completed',
        userId: normalUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Todos', null, {});
    await queryInterface.bulkDelete('Users', null, {});
  }
};
