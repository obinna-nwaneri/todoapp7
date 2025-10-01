import api from './client';
import type { Paginated } from './projects';

export interface AuditLog {
  id: string;
  actorId: string;
  entityType: 'USER' | 'PROJECT' | 'TASK';
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
  createdAt: string;
  meta: Record<string, unknown> | null;
}

export async function fetchAuditLogs(params: Record<string, unknown> = {}) {
  const response = await api.get<Paginated<AuditLog>>('/audit-logs', { params });
  return response.data;
}
