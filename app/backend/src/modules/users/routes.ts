import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth.js';
import { AppError } from '../../utils/errors.js';
import { createUserSchema, listUsersQuery, updateUserSchema } from './validators.js';
import { logAudit } from '../../utils/audit.js';
import { AuditAction, AuditEntityType } from '@prisma/client';

const SALT_ROUNDS = 10;

export const usersRouter = Router();

usersRouter.use(requireAuth(), requireRole('ADMIN'));

usersRouter.get('/', async (req, res, next) => {
  try {
    const query = listUsersQuery.parse(req.query);
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      role: query.role,
      isActive: query.isActive,
      OR: query.q
        ? [
            { firstName: { contains: query.q, mode: 'insensitive' as const } },
            { lastName: { contains: query.q, mode: 'insensitive' as const } },
            { email: { contains: query.q, mode: 'insensitive' as const } },
          ]
        : undefined,
    };
    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json({
      data,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize) || 1,
    });
  } catch (error) {
    next(error);
  }
});

usersRouter.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        isActive: data.isActive ?? true,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.USER,
      entityId: user.id,
      action: AuditAction.CREATE,
    });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.USER,
      entityId: user.id,
      action: AuditAction.UPDATE,
      meta: data,
    });
    res.json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.USER,
      entityId: req.params.id,
      action: AuditAction.DELETE,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default usersRouter;
