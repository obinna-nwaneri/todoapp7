import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSPrisma from '@adminjs/prisma';
import { prisma } from '../../db/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { Router } from 'express';
import { AuditAction, AuditEntityType } from '@prisma/client';
import { logAudit } from '../../utils/audit.js';
import { AppError } from '../../utils/errors.js';

AdminJS.registerAdapter({ Resource: AdminJSPrisma.Resource, Database: AdminJSPrisma.Database });

export async function buildAdminRouter() {
  const admin = new AdminJS({
    branding: {
      companyName: 'Docapp3 Admin',
    },
    rootPath: '/admin',
    resources: [
      { resource: { model: prisma.user, client: prisma } },
      { resource: { model: prisma.project, client: prisma } },
      { resource: { model: prisma.task, client: prisma } },
      { resource: { model: prisma.auditLog, client: prisma } },
    ],
  });

  const adminRouter = AdminJSExpress.buildRouter(admin);
  const guarded = Router();
  guarded.use(requireAuth());
  guarded.use((req: any, _res, next) => {
    if (req.user?.role !== 'ADMIN') {
      return next(new AppError(403, 'Forbidden', 'FORBIDDEN'));
    }
    next();
  });
  guarded.use((req, res, next) => {
    (adminRouter as any)(req, res, next);
  });

  admin.addAction({
    name: 'DeactivateUser',
    actionType: 'record',
    guard: 'Are you sure?',
    handler: async (_request, _response, context) => {
      const record = context.record;
      if (!record) {
        throw new Error('Record not found');
      }
      await prisma.user.update({
        where: { id: record.params.id },
        data: { isActive: false },
      });
      await logAudit({
        actorId: context.currentAdmin?.id as string,
        entityType: AuditEntityType.USER,
        entityId: record.params.id,
        action: AuditAction.UPDATE,
        meta: { adminAction: 'DeactivateUser' },
      });
      return {
        record: {
          ...record.toJSON(),
          params: { ...record.params, isActive: false },
        },
        notice: {
          message: 'User deactivated',
          type: 'success',
        },
      };
    },
  });

  admin.addAction({
    name: 'BulkCompleteTasks',
    actionType: 'bulk',
    handler: async (_request, _response, context) => {
      const ids = context.records?.map((r) => r.params.id) ?? [];
      await prisma.task.updateMany({
        where: { id: { in: ids } },
        data: { status: 'COMPLETED' },
      });
      await logAudit({
        actorId: context.currentAdmin?.id as string,
        entityType: AuditEntityType.TASK,
        entityId: ids.join(','),
        action: AuditAction.UPDATE,
        meta: { adminAction: 'BulkCompleteTasks' },
      });
      return {
        notice: {
          message: 'Tasks marked as completed',
          type: 'success',
        },
      };
    },
  });

  return { admin, router: guarded };
}
