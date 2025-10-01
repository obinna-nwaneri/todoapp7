import { z } from 'zod';

export const projectBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  ownerId: z.string().uuid().optional(),
});

export const updateProjectSchema = projectBodySchema.partial();

export const listProjectsQuery = z.object({
  q: z.string().optional(),
  ownerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});
