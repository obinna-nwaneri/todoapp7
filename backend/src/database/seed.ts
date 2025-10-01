import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import { UsersService } from '../users/users.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { TodosService } from '../todos/todos.service.js';
import { UserRole } from '../users/user.entity.js';
import { TodoPriority, TodoStatus } from '../todos/todo.entity.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const usersService = app.get(UsersService);
  const projectsService = app.get(ProjectsService);
  const todosService = app.get(TodosService);

  const admin = await usersService.create({
    email: 'admin@demo.com',
    password: 'Admin123!',
    firstName: 'System',
    lastName: 'Admin',
    role: UserRole.ADMIN,
    isActive: true,
  });

  const user = await usersService.create(
    {
      email: 'user@demo.com',
      password: 'User123!',
      firstName: 'Demo',
      lastName: 'User',
      role: UserRole.USER,
      isActive: true,
    },
    admin.id,
  );

  const project = await projectsService.create(
    {
      name: 'Company Rollout',
      description: 'Launch the new enterprise initiative across departments.',
      ownerId: admin.id,
    },
    admin,
  );

  const todosPayload = [
    {
      title: 'Prepare kickoff deck',
      description: 'Compile the initial presentation for stakeholders.',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.HIGH,
    },
    {
      title: 'Collect requirements',
      description: 'Interview department heads for rollout requirements.',
      status: TodoStatus.PENDING,
      priority: TodoPriority.MEDIUM,
    },
    {
      title: 'Draft communication plan',
      description: 'Outline messaging cadence for employees.',
      status: TodoStatus.PENDING,
      priority: TodoPriority.MEDIUM,
    },
    {
      title: 'Setup project workspace',
      description: 'Configure collaboration tools and permissions.',
      status: TodoStatus.COMPLETED,
      priority: TodoPriority.LOW,
    },
    {
      title: 'Define success metrics',
      description: 'Agree on KPIs with leadership.',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.HIGH,
    },
    {
      title: 'Schedule training sessions',
      description: 'Organize onboarding for regional champions.',
      status: TodoStatus.PENDING,
      priority: TodoPriority.MEDIUM,
    },
    {
      title: 'Draft FAQ document',
      description: 'Answer anticipated questions from staff.',
      status: TodoStatus.PENDING,
      priority: TodoPriority.LOW,
    },
    {
      title: 'Integrate feedback loop',
      description: 'Establish survey for rollout feedback.',
      status: TodoStatus.IN_PROGRESS,
      priority: TodoPriority.MEDIUM,
    },
    {
      title: 'Risk assessment review',
      description: 'Evaluate potential blockers with risk committee.',
      status: TodoStatus.PENDING,
      priority: TodoPriority.HIGH,
    },
    {
      title: 'Weekly status report',
      description: 'Summarize progress for leadership update.',
      status: TodoStatus.PENDING,
      priority: TodoPriority.MEDIUM,
    },
  ];

  for (const [index, payload] of todosPayload.entries()) {
    await todosService.create(
      {
        ...payload,
        projectId: project.id,
        assigneeId: index % 2 === 0 ? admin.id : user.id,
      },
      index % 2 === 0 ? admin : user,
    );
  }

  await app.close();
  console.log('Seed complete');
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
