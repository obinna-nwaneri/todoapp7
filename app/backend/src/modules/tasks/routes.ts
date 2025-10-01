import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { AppError } from '../../utils/errors.js';
import { createTaskSchema, listTasksQuery, updateTaskSchema } from './validators.js';
import { logAudit } from '../../utils/audit.js';
import { AuditAction, AuditEntityType } from '@prisma/client';

export const tasksRouter = Router();

tasksRouter.use(requireAuth());

tasksRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const query = listTasksQuery.parse(req.query);
    const skip = (query.page - 1) * query.pageSize;
    const orderBy = query.sort
      ? query.sort.split(',').map((s) => {
          const [field, direction] = s.split(':');
          return { [field]: (direction ?? 'asc').toLowerCase() } as any;
        })
      : [{ updatedAt: 'desc' as const }];
    const where: any = {
      projectId: query.projectId,
      assignedToId: query.assignedToId,
      status: query.status,
      priority: query.priority,
      title: query.q ? { contains: query.q, mode: 'insensitive' } : undefined,
      dueDate: query.dueBefore || query.dueAfter ? {} : undefined,
    };
    if (query.dueBefore) {
      where.dueDate = { ...(where.dueDate ?? {}), lte: query.dueBefore };
    }
    if (query.dueAfter) {
      where.dueDate = { ...(where.dueDate ?? {}), gte: query.dueAfter };
    }
    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy,
        include: {
          assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
          project: { select: { id: true, name: true } },
        },
      }),
      prisma.task.count({ where }),
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

tasksRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = createTaskSchema.parse(req.body);
    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status ?? 'PENDING',
        dueDate: data.dueDate,
        assignedToId: data.assignedToId ?? null,
        createdById: req.user!.id,
      },
    });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.TASK,
      entityId: task.id,
      action: AuditAction.CREATE,
      meta: {
        projectId: data.projectId,
        priority: data.priority,
        status: data.status ?? 'PENDING',
      },
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

tasksRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTo: { select: { id: true, email: true, firstName: true, lastName: true } },
        project: { select: { id: true, name: true } },
      },
    });
    if (!task) {
      throw new AppError(404, 'Task not found', 'TASK_NOT_FOUND');
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
});

tasksRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const data = updateTaskSchema.parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data,
    });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.TASK,
      entityId: task.id,
      action: AuditAction.UPDATE,
      meta: {
        projectId: data.projectId,
        priority: data.priority,
        status: data.status ?? undefined,
      },
    });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

tasksRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.TASK,
      entityId: req.params.id,
      action: AuditAction.DELETE,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default tasksRouter;
