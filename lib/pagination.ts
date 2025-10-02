export function getPaginationParams(searchParams: URLSearchParams, defaults?: { page?: number; pageSize?: number }) {
  const page = Number(searchParams.get("page") ?? defaults?.page ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? defaults?.pageSize ?? 10);
  return {
    page: Math.max(page, 1),
    pageSize: Math.max(Math.min(pageSize, 100), 1)
  };
}

export function buildPaginatedResponse<T>(data: T[], count: number, page: number, pageSize: number) {
  return {
    results: data,
    count,
    page,
    pageSize
  };
}
