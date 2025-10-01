import { Router } from 'express';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { listAuditQuery } from './validators.js';

export const auditRouter = Router();

auditRouter.use(requireAuth(), requireRole('ADMIN'));

auditRouter.get('/', async (req, res, next) => {
  try {
    const query = listAuditQuery.parse(req.query);
    const skip = (query.page - 1) * query.pageSize;
    const createdAt = query.dateFrom || query.dateTo ? {} : undefined;
    if (createdAt) {
      if (query.dateFrom) {
        (createdAt as any).gte = query.dateFrom;
      }
      if (query.dateTo) {
        (createdAt as any).lte = query.dateTo;
      }
    }
    const where: any = {
      actorId: query.actorId,
      entityType: query.entityType,
      action: query.action,
      createdAt,
    };
    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      }),
      prisma.auditLog.count({ where }),
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

export default auditRouter;
