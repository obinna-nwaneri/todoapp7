import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek } from 'date-fns';
import api from '../../api/client';
import { PaginatedResponse, Todo } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip } from 'recharts';

const fetchTodos = async (params: Record<string, unknown>) => {
  const { data } = await api.get<PaginatedResponse<Todo>>('/todos', { params });
  return data;
};

export const DashboardPage = () => {
  const baseParams = { limit: 1 };

  const allTodosQuery = useQuery(['todos', 'all'], () => fetchTodos(baseParams));
  const openTodosQuery = useQuery(['todos', 'open'], () => fetchTodos({ ...baseParams, status: 'PENDING' }));
  const overduePendingQuery = useQuery(['todos', 'overduePending'], () =>
    fetchTodos({
      ...baseParams,
      status: 'PENDING',
      dueBefore: new Date().toISOString(),
    }),
  );
  const overdueInProgressQuery = useQuery(['todos', 'overdueInProgress'], () =>
    fetchTodos({
      ...baseParams,
      status: 'IN_PROGRESS',
      dueBefore: new Date().toISOString(),
    }),
  );
  const completedThisWeekQuery = useQuery(['todos', 'completedThisWeek'], () =>
    fetchTodos({
      limit: 100,
      status: 'COMPLETED',
      dueAfter: startOfWeek(new Date()).toISOString(),
    }),
  );
  const completionTrendQuery = useQuery(['todos', 'completionTrend'], () =>
    fetchTodos({ limit: 100, status: 'COMPLETED', order: 'ASC' }),
  );

  const overdueCount = (overduePendingQuery.data?.total ?? 0) + (overdueInProgressQuery.data?.total ?? 0);

  const trendData = useMemo(() => {
    const raw = completionTrendQuery.data?.data ?? [];
    const grouped = raw.reduce<Record<string, number>>((acc, todo) => {
      if (!todo.dueDate) return acc;
      const date = format(new Date(todo.dueDate), 'EEE');
      acc[date] = (acc[date] ?? 0) + 1;
      return acc;
    }, {});
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, value: grouped[day] ?? 0 }));
  }, [completionTrendQuery.data]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Todos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-slate-900">
            {allTodosQuery.data?.total ?? '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Open Todos</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-slate-900">
            {openTodosQuery.data?.total ?? '--'}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent className="flex items-baseline gap-2 text-3xl font-semibold text-red-600">
            {overduePendingQuery.isLoading && overdueInProgressQuery.isLoading ? '--' : overdueCount}
            <Badge variant="danger">Attention</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Completed this week</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-emerald-600">
            {completedThisWeekQuery.data?.total ?? '--'}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Completion Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={trendData}>
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip cursor={{ fill: '#e2e8f0' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
