import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../api/client';
import { PaginatedResponse, Todo, TodoPriority, TodoStatus } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Button } from '../../components/ui/button';
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../hooks/useAuth';

const statusOptions: TodoStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const priorityOptions: TodoPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

const fetchTodos = async (params: Record<string, unknown>) => {
  const { data } = await api.get<PaginatedResponse<Todo>>('/todos', { params });
  return data;
};

export const TodosPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    q: '',
    status: '',
    priority: '',
  });
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<TodoStatus>('COMPLETED');

  const query = useQuery(['todos', page, filters], () =>
    fetchTodos({
      page,
      limit: 10,
      q: filters.q || undefined,
      status: filters.status || undefined,
      priority: filters.priority || undefined,
    }),
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    const currentIds = query.data?.data.map((todo) => todo.id) ?? [];
    setSelected((prev) => {
      const next = prev.filter((id) => currentIds.includes(id));
      if (next.length === prev.length) {
        return prev;
      }
      return next;
    });
  }, [query.data]);

  const bulkStatusMutation = useMutation(
    (payload: { ids: string[]; status: TodoStatus }) =>
      api.patch('/todos/bulk/status', payload),
    {
      onSuccess: () => {
        setSelected([]);
        queryClient.invalidateQueries(['todos']);
      },
    },
  );

  const bulkDeleteMutation = useMutation(
    (ids: string[]) => api.delete('/todos/bulk', { data: { ids } }),
    {
      onSuccess: () => {
        setSelected([]);
        queryClient.invalidateQueries(['todos']);
      },
    },
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const allSelected = useMemo(() => {
    const currentIds = query.data?.data.map((todo) => todo.id) ?? [];
    return currentIds.length > 0 && currentIds.every((id) => selected.includes(id));
  }, [query.data, selected]);

  const toggleAll = () => {
    if (allSelected) {
      const currentIds = query.data?.data.map((todo) => todo.id) ?? [];
      setSelected((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = query.data?.data.map((todo) => todo.id) ?? [];
      setSelected((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleBulkStatus = () => {
    if (selected.length === 0) return;
    bulkStatusMutation.mutate({ ids: selected, status: bulkStatus });
  };

  const handleBulkDelete = () => {
    if (selected.length === 0) return;
    bulkDeleteMutation.mutate(selected);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Search</label>
              <Input
                placeholder="Search todos"
                value={filters.q}
                onChange={(event) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, q: event.target.value }));
                }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Status</label>
              <Select
                value={filters.status}
                onChange={(event) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, status: event.target.value }));
                }}
              >
                <option value="">All</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Priority</label>
              <Select
                value={filters.priority}
                onChange={(event) => {
                  setPage(1);
                  setFilters((prev) => ({ ...prev, priority: event.target.value }));
                }}
              >
                <option value="">All</option>
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              Select page
              <span className="text-xs text-slate-400">{selected.length} selected</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={bulkStatus}
                onChange={(event) => setBulkStatus(event.target.value as TodoStatus)}
                className="w-40"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    Mark as {status.replace('_', ' ')}
                  </option>
                ))}
              </Select>
              <Button onClick={handleBulkStatus} disabled={selected.length === 0 || bulkStatusMutation.isLoading}>
                Update Status
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={selected.length === 0 || bulkDeleteMutation.isLoading}
              >
                Delete
              </Button>
            </div>
          </div>
          <Table>
            <THead>
              <TR>
                <TH className="w-12">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </TH>
                <TH>Title</TH>
                <TH>Status</TH>
                <TH>Priority</TH>
                <TH>Due Date</TH>
                <TH>Project</TH>
                <TH>Assignee</TH>
              </TR>
            </THead>
            <TBody>
              {query.data?.data.map((todo) => (
                <TR key={todo.id}>
                  <TD>
                    <input
                      type="checkbox"
                      checked={selected.includes(todo.id)}
                      onChange={() => toggleSelect(todo.id)}
                    />
                  </TD>
                  <TD>
                    <Link className="font-medium text-blue-600 hover:underline" to={`/app/todos/${todo.id}`}>
                      {todo.title}
                    </Link>
                    <div className="text-xs text-slate-500">Created {format(new Date(todo.createdAt), 'PP')}</div>
                  </TD>
                  <TD>
                    <Badge variant={todo.status === 'COMPLETED' ? 'success' : todo.status === 'IN_PROGRESS' ? 'warning' : 'default'}>
                      {todo.status.replace('_', ' ')}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge
                      variant={
                        todo.priority === 'HIGH'
                          ? 'danger'
                          : todo.priority === 'MEDIUM'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {todo.priority}
                    </Badge>
                  </TD>
                  <TD>{todo.dueDate ? format(new Date(todo.dueDate), 'PP') : '—'}</TD>
                  <TD>{todo.project?.name ?? 'Unassigned'}</TD>
                  <TD>{todo.assignee?.firstName ?? user?.firstName}</TD>
                </TR>
              ))}
              {query.data?.data.length === 0 && (
                <TR>
                  <TD colSpan={7} className="py-8 text-center text-sm text-slate-500">
                    No todos match your filters.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Page {page} of {Math.max(1, Math.ceil((query.data?.total ?? 0) / 10))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.ceil((query.data?.total ?? 0) / 10)}
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
