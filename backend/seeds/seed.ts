import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { User } from '../src/users/user.entity';
import { Todo } from '../src/todos/todo.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT || 5432),
  username: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DB_NAME || 'postgres',
  entities: [User, Todo],
  synchronize: true,
});

async function seed() {
  await dataSource.initialize();
  const userRepository = dataSource.getRepository(User);
  const todoRepository = dataSource.getRepository(Todo);

  const adminEmail = 'admin@example.com';
  const regularEmail = 'user@example.com';

  let admin = await userRepository.findOne({ where: { email: adminEmail } });
  if (!admin) {
    admin = userRepository.create({
      email: adminEmail,
      name: 'Admin User',
      isAdmin: true,
      password: await bcrypt.hash('admin123', 10),
    });
    await userRepository.save(admin);
  }

  let regular = await userRepository.findOne({ where: { email: regularEmail } });
  if (!regular) {
    regular = userRepository.create({
      email: regularEmail,
      name: 'Regular User',
      isAdmin: false,
      password: await bcrypt.hash('user123', 10),
    });
    await userRepository.save(regular);
  }

  const todos = await todoRepository.find();
  if (todos.length === 0) {
    await todoRepository.save([
      todoRepository.create({
        title: 'Review project requirements',
        description: 'Review the documentation for the enterprise todo app.',
        user: admin,
        userId: admin.id,
      }),
      todoRepository.create({
        title: 'Configure Admin Panel',
        description: 'Ensure AdminJS is properly configured.',
        user: admin,
        userId: admin.id,
      }),
      todoRepository.create({
        title: 'Plan weekly tasks',
        description: 'Outline todos for the upcoming week.',
        user: regular,
        userId: regular.id,
      }),
      todoRepository.create({
        title: 'Buy groceries',
        description: 'Milk, bread, fruits, and vegetables.',
        user: regular,
        userId: regular.id,
      }),
    ]);
  }

  console.log('Database seeded successfully');
  await dataSource.destroy();
}

seed().catch((error) => {
  console.error('Seeding failed', error);
  dataSource.destroy();
});
