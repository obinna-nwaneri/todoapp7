import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/client';
import { PaginatedResponse, User, UserRole } from '../../api/types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { Table, TBody, TD, TH, THead, TR } from '../../components/ui/table';

const fetchUsers = async (params: Record<string, unknown>) => {
  const { data } = await api.get<PaginatedResponse<User>>('/users', { params });
  return data;
};

export const UsersAdminPage = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ q: '', role: '', isActive: '' });
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: 'Password123!',
    firstName: '',
    lastName: '',
    role: 'USER' as UserRole,
    isActive: 'true',
  });

  const usersListQuery = useQuery(['adminUsers', page, filters], () =>
    fetchUsers({
      page,
      limit: 10,
      q: filters.q || undefined,
      role: filters.role || undefined,
      isActive: filters.isActive || undefined,
    }),
  );

  const createMutation = useMutation(
    () =>
      api.post('/users', {
        ...form,
        isActive: form.isActive === 'true',
      }),
    {
      onSuccess: () => {
        setCreating(false);
        setForm({ email: '', password: 'Password123!', firstName: '', lastName: '', role: 'USER', isActive: 'true' });
        queryClient.invalidateQueries(['adminUsers']);
      },
    },
  );

  const toggleActiveMutation = useMutation(
    ({ id, isActive }: { id: string; isActive: boolean }) => api.patch(`/users/${id}`, { isActive }),
    {
      onSuccess: () => queryClient.invalidateQueries(['adminUsers']),
    },
  );

  const updateRoleMutation = useMutation(
    ({ id, role }: { id: string; role: UserRole }) => api.patch(`/users/${id}`, { role }),
    {
      onSuccess: () => queryClient.invalidateQueries(['adminUsers']),
    },
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search by name or email"
              value={filters.q}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, q: event.target.value }));
              }}
            />
            <Select
              value={filters.role}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, role: event.target.value }));
              }}
            >
              <option value="">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </Select>
            <Select
              value={filters.isActive}
              onChange={(event) => {
                setPage(1);
                setFilters((prev) => ({ ...prev, isActive: event.target.value }));
              }}
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </Select>
            <Button onClick={() => setCreating((prev) => !prev)}>{creating ? 'Close' : 'Add User'}</Button>
          </div>
          {creating && (
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="Email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
              <Input
                placeholder="First name"
                value={form.firstName}
                onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
              />
              <Input
                placeholder="Last name"
                value={form.lastName}
                onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
              />
              <Input
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <Select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </Select>
              <Select value={form.isActive} onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.value }))}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </Select>
              <Button className="md:col-span-3" onClick={() => createMutation.mutate()} disabled={createMutation.isLoading}>
                {createMutation.isLoading ? 'Creating...' : 'Create user'}
              </Button>
            </div>
          )}
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Name</TH>
                <TH>Role</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {usersListQuery.data?.data.map((user) => (
                <TR key={user.id}>
                  <TD>{user.email}</TD>
                  <TD>
                    {user.firstName} {user.lastName}
                  </TD>
                  <TD>
                    <Select
                      value={user.role}
                      onChange={(event) =>
                        updateRoleMutation.mutate({ id: user.id, role: event.target.value as UserRole })
                      }
                    >
                      <option value="ADMIN">Admin</option>
                      <option value="USER">User</option>
                    </Select>
                  </TD>
                  <TD>
                    <Button
                      variant={user.isActive ? 'outline' : 'destructive'}
                      onClick={() => toggleActiveMutation.mutate({ id: user.id, isActive: !user.isActive })}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                  </TD>
                  <TD className="text-xs text-slate-400">Created {new Date(user.createdAt).toLocaleDateString()}</TD>
                </TR>
              ))}
              {usersListQuery.data?.data.length === 0 && (
                <TR>
                  <TD colSpan={5} className="py-8 text-center text-sm text-slate-500">
                    No users found.
                  </TD>
                </TR>
              )}
            </TBody>
          </Table>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              Page {page} of {Math.max(1, Math.ceil((usersListQuery.data?.total ?? 0) / 10))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={page >= Math.ceil((usersListQuery.data?.total ?? 0) / 10)}
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
