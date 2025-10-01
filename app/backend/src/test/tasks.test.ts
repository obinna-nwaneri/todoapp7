import request from 'supertest';
import bcrypt from 'bcrypt';
import { createApp } from '../app.js';
import { prisma } from '../db/prisma.js';

let app: Awaited<ReturnType<typeof createApp>>;
let adminCookie: string[];
let projectId: string;

async function loginAdmin() {
  const password = 'Admin123!';
  const admin = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      passwordHash: await bcrypt.hash(password, 10),
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password })
    .expect(200);

  adminCookie = response.headers['set-cookie'];
  return admin;
}

describe('Tasks API', () => {
  beforeAll(async () => {
    app = await createApp();
    await prisma.auditLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
    const admin = await loginAdmin();
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        description: 'Project for tasks',
        ownerId: admin.id,
      },
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();
  });

  it('creates a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', adminCookie)
      .send({
        projectId,
        title: 'New Task',
        description: 'Task description',
        priority: 'HIGH',
      })
      .expect(201);

    expect(res.body.title).toBe('New Task');
  });

  it('lists tasks with pagination', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&pageSize=10')
      .set('Cookie', adminCookie)
      .expect(200);

    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.page).toBe(1);
  });

  it('updates a task', async () => {
    const created = await prisma.task.create({
      data: {
        projectId,
        title: 'Update me',
        description: 'Before update',
        priority: 'LOW',
        status: 'PENDING',
        createdById: (await prisma.user.findFirstOrThrow({ where: { email: 'admin@test.com' } })).id,
      },
    });

    const res = await request(app)
      .patch(`/api/tasks/${created.id}`)
      .set('Cookie', adminCookie)
      .send({ status: 'COMPLETED' })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
  });
});
