import { Cross } from "lucide-react"
import React, { useMemo, useState, useEffect, useCallback } from "react"

export type EditableColumnType =
  | "text"
  | "number"
  | "select"
  | "checkbox"
  | "computed"
  | "readonly"

export interface EditableColumnGroup {
  label: string
  keys: string[]
  color?: string,
  background?: string
}

export interface EditableTableColumn {
  key: string
  label: string
  type?: EditableColumnType
  render?: (value: any, row: any, index: number) => React.ReactNode

  className?: string
  headerClassName?: string
  cellClassName?: string | ((value: any, row: any, col: EditableTableColumn) => string)
  editable?: boolean
  sortable?: boolean
  align?: "left" | "center" | "right"
  width?: string | number
  options?: { label: string; value: any; color?: string }[]
  unitKey?: string
  compute?: (row: any) => any
  prefix?: string
  suffix?: string
}

interface Props {
  data: any[]
  columns?: EditableTableColumn[]
  columnGroups?: EditableColumnGroup[]

  className?: string
  tableClassName?: string
  headerClassName?: string
  rowClassName?: string | ((row: any, index: number) => string)
  cellClassName?: string | ((value: any, row: any, col: EditableTableColumn) => string)
  showAddRow?: boolean
  showDelete?: boolean
  showTotals?: boolean
  onChange?: (rows: any[]) => void

  colors?: {
    headerBg?: string
    groupBg?: string
    totalsBg?: string
    accent?: string
  }
}

export const DataTableEditable: React.FC<Props> = ({
  data,
  columns,
  columnGroups,

  className,
  tableClassName,
  headerClassName,
  rowClassName,
  cellClassName,

  showAddRow = false,
  showDelete = false,
  showTotals = false,
  onChange,
  colors
}) => {

  const [rows, setRows] = useState<any[]>(data || [])

  useEffect(() => {
    setRows(data || [])
  }, [data])

  const theme = useMemo(() => ({
    header: colors?.headerBg || "#0f1f3d",
    group: colors?.groupBg || "#111827",
    totals: colors?.totalsBg || "#059669",
    accent: colors?.accent
  }), [colors])

  const derivedColumns = useMemo((): EditableTableColumn[] => {
    if (columns?.length) return columns
    if (!rows.length) return []

    const firstRow = rows[0]

    return Object.keys(firstRow).map(key => ({
      key,
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      type: typeof firstRow[key] === "number" ? "number" : "text",
      editable: true,
      align: typeof firstRow[key] === "number" ? "right" : "left"
    }))
  }, [columns, rows])

  const groupHeader = useMemo(() => {
    if (!columnGroups?.length) return null

    const spans: any[] = []

    derivedColumns.forEach(col => {
      const grp = columnGroups.find(g => g.keys.includes(col.key))
      const label = grp?.label || ""

      const last = spans[spans.length - 1]

      if (last && last.label === label) {
        last.count++
      } else {
        spans.push({
          label,
          color: grp?.color,
          background: grp?.background,
          count: 1
        })
      }
    })

    return spans
  }, [derivedColumns, columnGroups])
  const updateCell = useCallback((rowIndex: number, key: string, value: any) => {
    const updated = [...rows]
    updated[rowIndex] = { ...updated[rowIndex], [key]: value }
    setRows(updated)
    onChange?.(updated)
  }, [rows, onChange])

  const addRow = useCallback(() => {
    const newRow: any = { id: `row-${Date.now()}` }

    derivedColumns.forEach(c => {
      newRow[c.key] = c.type === "number" ? 0 : ""
    })

    const updated = [...rows, newRow]
    setRows(updated)
    onChange?.(updated)

  }, [derivedColumns, rows, onChange])

  const deleteRow = useCallback((index: number) => {
    const updated = rows.filter((_, i) => i !== index)
    setRows(updated)
    onChange?.(updated)
  }, [rows, onChange])

  const totals = useMemo(() => {
    const t: any = {}

    derivedColumns.forEach(c => {
      if (c.type === "number" || c.type === "computed") {
        t[c.key] = rows.reduce((s, r) => {
          const v = c.compute ? c.compute(r) : r[c.key]
          return s + Number(v || 0)
        }, 0)
      }
    })

    if (derivedColumns.length > 0) {
      t[derivedColumns[0].key] = "Totals"
    }

    return t
  }, [rows, derivedColumns])

  const renderCell = useCallback(
    (row: any, rowIndex: number, col: EditableTableColumn) => {

      const value = col.compute ? col.compute(row) : row[col.key]
      const safeValue = value ?? ""
      const isEditable = col.editable !== false

      if (col.render) {
        return col.render(value, row, rowIndex)
      }

      if (col.type === "computed") {
        return (
          <div
            className={`
              w-full flex items-center
              ${col.align === "right" ? "justify-end text-right" : ""}
              ${col.align === "center" ? "justify-center text-center" : ""}
              ${col.align === "left" ? "justify-start text-left" : ""}
            `}
          >
            {col.prefix && <span>{col.prefix}</span>}
            <span className="font-semibold">
              {Number(safeValue).toLocaleString()}
            </span>
            {col.suffix && <span>{col.suffix}</span>}
          </div>
        )
      }

      if (col.type === "readonly") {
        return (
          <span className={col.className}>
            {safeValue}
          </span>
        )
      }

      if (col.type === "checkbox") {
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={e => updateCell(rowIndex, col.key, e.target.checked)}
            className={col.className}
          />
        )
      }

      const inputType = col.type === "number" ? "number" : "text"

      return (
        <div className="relative w-full">

          <input
            type={inputType}
            value={safeValue}
            disabled={!isEditable}
            onChange={e => {
              const val =
                inputType === "number"
                  ? Number(e.target.value) || 0
                  : e.target.value

              updateCell(rowIndex, col.key, val)
            }}
            className={`
        w-full px-2 py-1.5 text-sm rounded border border-transparent
        bg-transparent focus:ring-2 focus:ring-blue-500
        focus:border-blue-500 outline-none
        ${col.align === "right" ? "text-right pr-4" : ""}
      `}
          />

          {col.suffix && (
            <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs text-inherit">
              {col.suffix}
            </span>
          )}

        </div>
      )

    },
    [updateCell, theme.accent]
  )

  return (
    <div className={`overflow-hidden bg-white ${className || ""}`}>

      {showAddRow && (
        <div className="px-4 py-3 border-b">
          <button
            onClick={addRow}
            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg"
          >
            Add Row
          </button>
        </div>
      )}

      <div className="overflow-x-auto  thin-scroll">
        <table className={`w-full min-w-[600px] ${tableClassName || ""}`}>

          <thead>

            {groupHeader && (
              <tr>
                {groupHeader.map((g, i) => (
                  <th
                    key={i}
                    colSpan={g.count}
                    className="py-3 px-4 text-sm font-semibold tracking-[1.1px]"
                    style={{
                      backgroundColor: g.background || theme.group,
                      color: g.color || "#fff"
                    }}
                  >
                    {g.label}
                  </th>
                ))}
                {showDelete && <th />}
              </tr>
            )}
            <tr className={headerClassName}>
              {derivedColumns.map(col => (
                <th
                  key={col.key}
                  className={`
                    py-3 px-4 text-sm font-semibold
                    ${col.headerClassName || ""}
                  `}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    textAlign: col.align || "left",
                  }}
                >
                  {col.label}
                </th>
              ))}
              {showDelete && <th />}
            </tr>

          </thead>

          <tbody className="divide-y divide-gray-200">
            {rows.map((row, rowIndex) => {

              const computedRowClass =
                typeof rowClassName === "function"
                  ? rowClassName(row, rowIndex)
                  : rowClassName || ""

              return (
                <tr
                  key={`${row.id ?? "row"}-${rowIndex}`}
                  className={`divide-x divide-gray-200 ${computedRowClass}`}
                >

                  {derivedColumns.map(col => (
                    <td
                      key={col.key}
                      className={`
                          py-2 px-3 border-r border-gray-200
                          ${cellClassName || ""}
                          ${typeof col.cellClassName === "function"
                          ? col.cellClassName(row[col.key], row, col)
                          : col.cellClassName || ""}
                      `}
                    >
                      {renderCell(row, rowIndex, col)}
                    </td>
                  ))}

                  {showDelete && (
                    <td className="text-center">
                      <button
                        onClick={() => deleteRow(rowIndex)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Cross h-4 w-4 />
                      </button>
                    </td>
                  )}

                </tr>
              )
            })}
          </tbody>

          {showTotals && rows.length > 0 && (
            <tfoot>
              <tr
                style={{
                  backgroundColor: theme.totals,
                  color: "white"
                }}
              >
                {derivedColumns.map((c, i) => (
                  <td
                    key={c.key}
                    className="py-3 px-3 font-bold"
                    style={{ textAlign: i === 0 ? "left" : "right" }}
                  >
                    {totals[c.key]?.toLocaleString?.() ||
                      totals[c.key] ||
                      "-"}
                  </td>
                ))}
                {showDelete && <td />}
              </tr>
            </tfoot>
          )}

        </table>
      </div>
    </div>
  )
}

export default DataTableEditable