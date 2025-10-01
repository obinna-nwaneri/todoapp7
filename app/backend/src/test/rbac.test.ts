import request from 'supertest';
import bcrypt from 'bcrypt';
import { createApp } from '../app.js';
import { prisma } from '../db/prisma.js';

let app: Awaited<ReturnType<typeof createApp>>;
let userCookie: string[];

describe('RBAC enforcement', () => {
  beforeAll(async () => {
    app = await createApp();
    await prisma.user.deleteMany();
    const password = 'User123!';
    await prisma.user.create({
      data: {
        email: 'user@test.com',
        passwordHash: await bcrypt.hash(password, 10),
        firstName: 'Normal',
        lastName: 'User',
        role: 'USER',
      },
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password })
      .expect(200);

    userCookie = response.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  it('prevents non-admin from listing users', async () => {
    const res = await request(app)
      .get('/api/users')
      .set('Cookie', userCookie)
      .expect(403);

    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
