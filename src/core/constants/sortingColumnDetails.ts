import type { ReactNode } from "react";

export function getSortByParam(
  sortInfo: { column: string; direction: 'asc' | 'desc' } | null,
  departmentMasterColumns: { key: string; label: ReactNode }[]
): string | undefined {
  if (!sortInfo) return undefined;

  const column = departmentMasterColumns.find(col => col.key === sortInfo.column);

  if (!column) return undefined;

  return `${column.label} ${sortInfo.direction.toUpperCase()}`;
}
