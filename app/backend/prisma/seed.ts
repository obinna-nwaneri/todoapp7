import { PrismaClient, Role, TaskPriority, TaskStatus, AuditAction, AuditEntityType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  const users = await prisma.$transaction(async (tx) => {
    const admin = await tx.user.create({
      data: {
        email: 'admin@acme.com',
        passwordHash: await bcrypt.hash('Admin@123', 10),
        firstName: 'System',
        lastName: 'Admin',
        role: Role.ADMIN,
      },
    });

    const jane = await tx.user.create({
      data: {
        email: 'jane@acme.com',
        passwordHash: await bcrypt.hash('User@123', 10),
        firstName: 'Jane',
        lastName: 'Doe',
        role: Role.USER,
      },
    });

    const john = await tx.user.create({
      data: {
        email: 'john@acme.com',
        passwordHash: await bcrypt.hash('User@123', 10),
        firstName: 'John',
        lastName: 'Doe',
        role: Role.USER,
      },
    });

    return { admin, jane, john };
  });

  const project1 = await prisma.project.create({
    data: {
      name: 'Admin Project Alpha',
      description: 'Primary admin owned project',
      ownerId: users.admin.id,
    },
  });
  const project2 = await prisma.project.create({
    data: {
      name: 'Admin Project Beta',
      description: 'Secondary admin owned project',
      ownerId: users.admin.id,
    },
  });
  const project3 = await prisma.project.create({
    data: {
      name: 'Jane Project',
      description: 'Jane owned project',
      ownerId: users.jane.id,
    },
  });

  const tasksData = [
    { projectId: project1.id, title: 'Design architecture', description: 'Create system diagrams', priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, assignedToId: users.jane.id },
    { projectId: project1.id, title: 'Setup CI', description: 'Configure CI/CD pipelines', priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, assignedToId: users.john.id },
    { projectId: project1.id, title: 'Security review', description: 'Conduct security audit', priority: TaskPriority.HIGH, status: TaskStatus.PENDING },
    { projectId: project2.id, title: 'Write documentation', description: 'Document API endpoints', priority: TaskPriority.MEDIUM, status: TaskStatus.IN_PROGRESS, assignedToId: users.jane.id },
    { projectId: project2.id, title: 'Performance tests', description: 'Load testing', priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, assignedToId: users.john.id },
    { projectId: project2.id, title: 'Release v1', description: 'Prepare release notes', priority: TaskPriority.LOW, status: TaskStatus.PENDING },
    { projectId: project3.id, title: 'Client meeting', description: 'Weekly sync', priority: TaskPriority.MEDIUM, status: TaskStatus.COMPLETED },
    { projectId: project3.id, title: 'Bug triage', description: 'Review backlog', priority: TaskPriority.HIGH, status: TaskStatus.IN_PROGRESS, assignedToId: users.jane.id },
    { projectId: project3.id, title: 'QA pass', description: 'Finalize QA', priority: TaskPriority.MEDIUM, status: TaskStatus.PENDING, assignedToId: users.john.id },
    { projectId: project3.id, title: 'Deploy staging', description: 'Deploy to staging env', priority: TaskPriority.HIGH, status: TaskStatus.PENDING },
  ];

  for (const data of tasksData) {
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        assignedToId: data.assignedToId ?? null,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdById: users.admin.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: users.admin.id,
        entityType: AuditEntityType.TASK,
        entityId: task.id,
        action: AuditAction.CREATE,
        meta: { seeded: true },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
