import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/client';
import { ActivityLog, PaginatedResponse } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';

const fetchActivity = async (params: Record<string, unknown>) => {
  const { data } = await api.get<PaginatedResponse<ActivityLog>>('/activity', { params });
  return data;
};

export const ActivityAdminPage = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ actorId: '', entity: '', action: '' });

  const query = useQuery(['activity', page, filters], () =>
    fetchActivity({
      page,
      limit: 15,
      entity: filters.entity || undefined,
      action: filters.action || undefined,
      actorId: filters.actorId || undefined,
    }),
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Actor ID"
              value={filters.actorId}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, actorId: event.target.value }));
              }}
            />
            <Select
              value={filters.entity}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, entity: event.target.value }));
              }}
            >
              <option value="">All entities</option>
              <option value="User">User</option>
              <option value="Project">Project</option>
              <option value="Todo">Todo</option>
            </Select>
            <Select
              value={filters.action}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, action: event.target.value }));
              }}
            >
              <option value="">All actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </Select>
          </div>
          <Table>
            <THead>
              <TR>
                <TH>Timestamp</TH>
                <TH>Actor</TH>
                <TH>Entity</TH>
                <TH>Action</TH>
                <TH>Meta</TH>
              </TR>
            </THead>
            <TBody>
              {query.data?.data.map((log) => (
                <TR key={log.id}>
                  <TD>{format(new Date(log.createdAt), 'PPpp')}</TD>
                  <TD>{log.actorId ?? 'System'}</TD>
                  <TD>{log.entity}</TD>
                  <TD>{log.action}</TD>
                  <TD className="text-xs text-slate-500">{JSON.stringify(log.meta)}</TD>
                </TR>
              ))}
              {query.data?.data.length === 0 && (
                <TR>
                  <TD colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    No activity recorded.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Page {page} of {Math.max(1, Math.ceil((query.data?.total ?? 0) / 15))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.ceil((query.data?.total ?? 0) / 15)}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
