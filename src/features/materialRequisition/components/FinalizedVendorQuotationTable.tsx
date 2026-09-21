import { useMemo, useState, useCallback, useEffect } from "react"
import { DataTableEditable, type EditableColumnGroup, type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable"
import TooltipText from "@/ui/components/Tooltip/TooltipText"
import { computeAmount, computeGrandTotal } from "@/features/materialRequisition/utils/finalizeVendorUtils"

type Row =
    {
        id: string
        MaterialName: string
        MaterialQuantity: number
        MaterialPerUnit: number
        CGST: number
        SGST: number
        UGST: number
        IGST: number
        Amount: number
        Logistics?: string
    }

interface Props {
    data: Row[]
    isEditable?: boolean
    columns?: EditableTableColumn[]
    onChange?: (rows: Row[]) => void
    vendorId?: number
    termId?: number
    onSave?: (rows: Row[]) => void
}

export const FinalizedVendorQuotationTable: React.FC<Props> = ({
    data,
    onChange,
    onSave
}) => {
    const [rows, setRows] = useState<Row[]>(data)
    const [stagedRows, setStagedRows] = useState<Row[]>(data)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        setRows(data)
        setStagedRows(data)
    }, [data])

    const computedRows = useMemo(
        () =>
            (isEditing ? stagedRows : rows).map(r => ({
                ...r,
                id: r.id ?? `row-${r.MaterialName}-${r.MaterialQuantity}`,
                Amount: r.Logistics ? (r.Amount ?? 0) : computeAmount(r),  // ← key fix
            })),
        [rows, stagedRows, isEditing]
    )

    const handleChange = useCallback((newRows: Row[]) => {
        setStagedRows(newRows)
    }, [])

    const handleSave = () => {
        setRows(stagedRows)
        onChange?.(stagedRows)
        onSave?.(
            stagedRows.map(r => ({
                ...r,
                Amount: r.Logistics ? (r.Amount ?? 0) : computeAmount(r),
            }))
        )
        setIsEditing(false)
    }

    const handleCancel = () => {
        setStagedRows(rows)
        setIsEditing(false)
    }

    const GROUPS: EditableColumnGroup[] = [
        { label: "ITEM INFORMATION", keys: ["MaterialOrService", "MaterialQuantity"], background: "#0F2744" },
        { label: "PRICING", keys: ["MaterialPerUnit", "Amount"], background: "#1A3560" },
        { label: "TAX BREAKDOWN (%)", keys: ["CGST", "SGST", "UGST", "IGST"], background: "#1E3A5F", color: "#FDE68A" },
        { label: "SUMMARY", keys: ["Total"], background: "#0F2744" }
    ]

    const columns: EditableTableColumn[] = useMemo(() => [
        {
            key: "MaterialOrService",
            label: "MATERIAL / SERVICE",
            type: "readonly",
            editable: false,
            width: 200,
            align: "left",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            cellClassName: "font-medium text-gray-900",
            render: (_value, row) => {
                const isService = !!row?.Logistics
                return (
                    <div className="flex flex-col">
                        <span className="text-gray-900">
                            {row?.MaterialName || row?.Logistics || ""}
                        </span>
                        <span className="text-gray-400 text-xs font-light">
                            <TooltipText text={row?.SubMaterialName || ""} />
                        </span>
                        <span
                            className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full font-semibold w-fit
                                ${isService
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                        >
                            {isService ? "SERVICE" : "MATERIAL"}
                        </span>
                    </div>
                )
            }
        },
        {
            key: "MaterialQuantity",
            label: "QUANTITY",
            type: "number",
            editable: isEditing,
            width: 100,
            align: "center",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            render: (_value, row) => (
                <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1 inline-flex items-center gap-1">
                    {row?.MaterialQuantity || '-'} {row?.UomCode}
                </span>
            )
        },
        {
            key: "MaterialPerUnit",
            label: "UNIT PRICE (₹)",
            type: "number",
            editable: isEditing,
            width: 100,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#253E60] text-white tracking-[0.8px]",
            render: (_value, row) => {

                if (row?.Logistics) return
                <span className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-500 text-xs font-semibold shadow-sm">
                    —
                </span>
                return (
                    <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1 inline-flex items-center gap-1">
                        {row?.MaterialPerUnit || '-'}
                    </span>
                )
            },
            renderEditor: (_value, onChange, row) => {
                if (row?.Logistics) return <span className=" text-gray-300">-</span>
                return (
                    <input
                        type="number"
                        defaultValue={row?.MaterialPerUnit ?? 0}
                        onChange={e => onChange(Number(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-sm rounded border border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none text-right"
                    />
                )
            }
        },
        {
            key: "Amount",
            label: "AMOUNT(₹)",
            type: "number",
            editable: isEditing,
            width: 120,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#253E60] text-white tracking-[1px]",
            renderEditor: (_value, onChange, row) => {
                if (row.Logistics) {
                    return (
                        <input
                            type="number"
                            defaultValue={row.Amount ?? 0}
                            onChange={e => onChange(Number(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 text-sm 
                            focus:ring-2 focus:ring-blue-500 outline-none text-right"
                        />
                    )
                }
                return (
                    <span className="w-full block text-right pr-1 font-bold text-black-300">
                        ₹{computeAmount(row).toLocaleString()}
                    </span>
                )
            },
            render: (_value, row) => (
                <span className="w-full block text-right pr-1">
                    ₹{(row.Logistics ? (row.Amount ?? 0) : computeAmount(row)).toLocaleString()}
                </span>
            )
        },

        {
            key: "CGST",
            label: "CGST(%)",
            type: "number",
            editable: isEditing,
            width: 90,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            cellClassName: (value) =>
                value !== 0
                    ? "text-yellow-600 font-semibold bg-yellow-50"
                    : "text-gray-400 font-semibold bg-gray-100"
        },
        {
            key: "SGST",
            label: "SGST(%)",
            editable: isEditing,
            type: "number",
            width: 90,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            cellClassName: (value) =>
                value !== 0
                    ? "text-yellow-600 font-semibold bg-yellow-50"
                    : "text-gray-400 font-semibold bg-gray-100"
        },
        {
            key: "UGST",
            label: "UGST(%)",
            editable: isEditing,
            type: "number",
            width: 90,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            cellClassName: (value) =>
                value !== 0
                    ? "text-yellow-600 font-semibold bg-yellow-50"
                    : "text-gray-400 font-semibold bg-gray-100"
        },
        {
            key: "TGST",
            label: "IGST(%)",
            editable: isEditing,
            type: "number",
            width: 90,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            cellClassName: (value) =>
                value !== 0
                    ? "text-yellow-600 font-semibold bg-yellow-50"
                    : "text-gray-400 font-semibold bg-gray-100"
        },
        {
            key: "Total",
            label: "TOTAL",
            type: "computed",
            compute: computeGrandTotal,
            editable: false,
            width: 120,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#1E3A5F] text-green-200 tracking-[1px]",
            cellClassName: "text-green-600 font-semibold"
        }
    ], [isEditing])

    return (
        <div className="space-y-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center justify-between p-4">
                <div className="text-lg font-semibold text-gray-900">
                    Quotation
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                        >
                            Save
                        </button>
                    </div>
                )}
            </div>

            <DataTableEditable
                data={computedRows}
                rowClassName="odd:bg-gray-50 even:bg-white"
                columns={columns}
                columnGroups={GROUPS}
                showAddRow={false}
                showDelete={false}
                showTotals={true}
                onChange={handleChange}
                colors={{
                    headerBg: "#0f1f3d",
                    groupBg: "#111827",
                    totalsBg: "#0F2744",
                }}
            />
        </div>
    )
}