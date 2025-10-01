import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '../api/audit';

export default function AuditLogsPage() {
  const [action, setAction] = useState('');
  const auditQuery = useQuery({
    queryKey: ['audit-logs', action],
    queryFn: () => fetchAuditLogs({ action: action || undefined }),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">Audit Logs</h1>
      <div className="rounded bg-white p-4 shadow">
        <div className="mb-4">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2"
          >
            <option value="">All actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
          </select>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Action</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Entity</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditQuery.data?.data.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-2 text-sm font-medium text-gray-800">{log.action}</td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {log.entityType} - {log.entityId}
                </td>
                <td className="px-4 py-2 text-sm text-gray-600">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!auditQuery.data?.data.length && (
              <tr>
                <td colSpan={3} className="px-4 py-4 text-center text-sm text-gray-500">
                  No audit logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
