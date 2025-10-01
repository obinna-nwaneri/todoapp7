import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { AppError } from '../../utils/errors.js';
import { listProjectsQuery, projectBodySchema, updateProjectSchema } from './validators.js';
import { logAudit } from '../../utils/audit.js';
import { AuditAction, AuditEntityType } from '@prisma/client';

export const projectsRouter = Router();

projectsRouter.use(requireAuth());

projectsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const query = listProjectsQuery.parse(req.query);
    const skip = (query.page - 1) * query.pageSize;
    const where = {
      ownerId: query.ownerId,
      OR: query.q
        ? [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { description: { contains: query.q, mode: 'insensitive' as const } },
          ]
        : undefined,
    };

    const [data, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { updatedAt: 'desc' },
        include: { owner: { select: { id: true, email: true, firstName: true, lastName: true } } },
      }),
      prisma.project.count({ where }),
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

projectsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const data = projectBodySchema.parse(req.body);
    let ownerId = data.ownerId ?? req.user!.id;
    if (req.user!.role !== 'ADMIN') {
      ownerId = req.user!.id;
    }
    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId,
      },
    });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.PROJECT,
      entityId: project.id,
      action: AuditAction.CREATE,
      meta: { name: project.name, ownerId: project.ownerId },
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, email: true, firstName: true, lastName: true } },
        tasks: true,
      },
    });
    if (!project) {
      throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

projectsRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }
    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id) {
      throw new AppError(403, 'Forbidden', 'FORBIDDEN');
    }
    const data = updateProjectSchema.parse(req.body);
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ownerId: req.user!.role === 'ADMIN' ? data.ownerId ?? project.ownerId : project.ownerId,
      },
    });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.PROJECT,
      entityId: updated.id,
      action: AuditAction.UPDATE,
      meta: data,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

projectsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) {
      throw new AppError(404, 'Project not found', 'PROJECT_NOT_FOUND');
    }
    if (req.user!.role !== 'ADMIN' && project.ownerId !== req.user!.id) {
      throw new AppError(403, 'Forbidden', 'FORBIDDEN');
    }
    await prisma.task.deleteMany({ where: { projectId: project.id } });
    await prisma.project.delete({ where: { id: project.id } });
    await logAudit({
      actorId: req.user!.id,
      entityType: AuditEntityType.PROJECT,
      entityId: project.id,
      action: AuditAction.DELETE,
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default projectsRouter;
