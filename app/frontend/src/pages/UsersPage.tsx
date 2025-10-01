import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/users';

export default function UsersPage() {
  const [q, setQ] = useState('');
  const usersQuery = useQuery({
    queryKey: ['users', q],
    queryFn: () => fetchUsers({ q }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
      <div className="rounded bg-white p-4 shadow">
        <div className="mb-4 flex items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users"
            className="rounded border border-gray-300 px-3 py-2"
          />
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usersQuery.data?.data.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{user.role}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{user.isActive ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
            {!usersQuery.data?.data.length && (
              <tr>
                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
