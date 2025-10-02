"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTable } from "./data-table";

interface PaginatedTableProps<T> {
  columns: { key: keyof T | string; header: string; render?: (row: T) => ReactNode }[];
  data: T[];
  page: number;
  pageSize: number;
  count: number;
}

export function PaginatedTable<T extends Record<string, any>>({ columns, data, page, pageSize, count }: PaginatedTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handlePageChange(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    router.push(`?${params.toString()}`);
  }

  return <DataTable columns={columns} data={data} page={page} pageSize={pageSize} count={count} onPageChange={handlePageChange} />;
}
