import type { Key, ReactNode } from "react";

export interface SimpleDataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  align?: "left" | "center" | "right";
  headerClassName?: string;
  cellClassName?: string;
}

interface SimpleDataTableProps<T> {
  data: T[];
  columns: SimpleDataTableColumn<T>[];
  getRowKey: (row: T, index: number) => Key;
  emptyMessage?: ReactNode;
  onRowClick?: (row: T, index: number) => void;
  tableClassName?: string;
  headerClassName?: string;
  headerRowClassName?: string;
  rowClassName?: string;
  emptyCellClassName?: string;
}

const alignmentClass = (
  alignment: SimpleDataTableColumn<unknown>["align"],
) => {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
};

export default function SimpleDataTable<T>({
  data,
  columns,
  getRowKey,
  emptyMessage = "No data available.",
  onRowClick,
  tableClassName = "",
  headerClassName = "sticky top-0 z-10",
  headerRowClassName = "bg-[#EEF3FF] text-[11px] font-semibold text-slate-600",
  rowClassName = "border-b border-slate-100 text-sm text-slate-600 transition hover:bg-slate-50/70",
  emptyCellClassName = "px-5 py-10 text-center text-sm text-slate-400",
}: SimpleDataTableProps<T>) {
  return (
    <table
      className={`w-full border-separate border-spacing-0 text-left ${tableClassName}`}
    >
      <thead className={headerClassName}>
        <tr className={headerRowClassName}>
          {columns.map((column) => (
            <th
              key={column.key}
              className={`px-5 py-3 align-middle ${alignmentClass(column.align)} ${column.headerClassName ?? ""}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className={emptyCellClassName}>
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIndex) => (
            <tr
              key={getRowKey(row, rowIndex)}
              onClick={
                onRowClick ? () => onRowClick(row, rowIndex) : undefined
              }
              className={`${onRowClick ? "cursor-pointer " : ""}${rowClassName}`}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`border-b border-slate-100 px-5 py-4 ${alignmentClass(column.align)} ${column.cellClassName ?? ""}`}
                >
                  {column.render(row, rowIndex)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
