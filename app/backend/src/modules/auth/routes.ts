import { Router, type Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../db/prisma.js';
import { AppError } from '../../utils/errors.js';
import { env } from '../../config/env.js';
import { registerSchema, loginSchema } from './validators.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { logAudit } from '../../utils/audit.js';
import { AuditAction, AuditEntityType } from '@prisma/client';

const SALT_ROUNDS = 10;

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({
      where: { email: parsed.email },
    });
    if (existing) {
      throw new AppError(400, 'Email already registered', 'EMAIL_EXISTS');
    }
    const passwordHash = await bcrypt.hash(parsed.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        passwordHash,
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        role: 'USER',
      },
    });
    const token = createJwt(user.id, user.role);
    setAuthCookie(res, token);
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const parsed = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user || !(await bcrypt.compare(parsed.password, user.passwordHash))) {
      throw new AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    if (!user.isActive) {
      throw new AppError(403, 'User is deactivated', 'USER_INACTIVE');
    }
    const token = createJwt(user.id, user.role);
    setAuthCookie(res, token);
    await logAudit({
      actorId: user.id,
      entityType: AuditEntityType.USER,
      entityId: user.id,
      action: AuditAction.LOGIN,
    });
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
  });
  res.status(204).send();
});

authRouter.get('/me', requireAuth(), async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
});

function createJwt(userId: string, role: 'ADMIN' | 'USER') {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: '7d' });
}

function setAuthCookie(res: Response, token: string) {
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
