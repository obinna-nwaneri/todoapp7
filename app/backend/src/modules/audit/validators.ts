import { z } from 'zod';

export const listAuditQuery = z.object({
  actorId: z.string().uuid().optional(),
  entityType: z.enum(['USER', 'PROJECT', 'TASK']).optional(),
  action: z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});
