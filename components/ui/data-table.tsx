"use client";

import { ReactNode } from "react";

interface DataTableProps<T> {
  columns: { key: keyof T | string; header: string; render?: (row: T) => ReactNode }[];
  data: T[];
  page: number;
  pageSize: number;
  count: number;
  onPageChange?: (page: number) => void;
}

export function DataTable<T extends Record<string, any>>({ columns, data, page, pageSize, count, onPageChange }: DataTableProps<T>) {
  const totalPages = Math.max(Math.ceil(count / pageSize), 1);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-2 text-left text-sm font-semibold text-slate-600">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-2 text-sm text-slate-700">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-slate-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page {page} of {totalPages} (Total: {count})
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => canPrev && onPageChange?.(page - 1)}
            className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && onPageChange?.(page + 1)}
            className="rounded border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
