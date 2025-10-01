import request from 'supertest';
import { createApp } from '../app.js';
import { prisma } from '../db/prisma.js';

let app: Awaited<ReturnType<typeof createApp>>;

describe('Auth routes', () => {
  beforeAll(async () => {
    app = await createApp();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
  });

  it('registers a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(200);

    expect(res.body.email).toBe('test@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('rejects duplicate email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'dup@example.com',
        password: 'Password123',
        firstName: 'Dup',
        lastName: 'User',
      });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'dup@example.com',
        password: 'Password123',
        firstName: 'Dup',
        lastName: 'User',
      })
      .expect(400);

    expect(res.body.error.code).toBe('EMAIL_EXISTS');
  });

  it('logs in existing user', async () => {
    const password = 'LoginPass123';
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        password,
        firstName: 'Login',
        lastName: 'User',
      });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password })
      .expect(200);

    expect(res.body.email).toBe('login@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });
});
