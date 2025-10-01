import { AuditAction, AuditEntityType } from '@prisma/client';
import { prisma } from '../db/prisma.js';

export async function logAudit(params: {
  actorId: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  meta?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      meta: params.meta ?? {},
    },
  });
}
