import { useMemo, useState, useCallback, useEffect } from "react"
import { DataTableEditable, type EditableColumnGroup, type EditableTableColumn } from "@/ui/components/DataTable/DataTableEditable"
import { computeAmountInstallation, computeGrandTotal } from "@/features/materialRequisition/utils/finalizeVendorUtils"
import { Input } from "@/ui/components/forms/Input"
import { allowPercentage, filterNumbersWithDecimal } from "@/core/utils/fileValidation"
import { formatCurrency } from "@/core/utils/comman"
import useToast from "@/core/hooks/useToast";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions"


type Row =
    {
        id: string
        MaterialName: string
        MaterialQuantity: number
        MaterialPerUnit: number
        CGST: number | string
        SGST: number | string
        UGST: number | string
        IGST: number | string
        TGST?: number | string
        Amount: number
        Installation: number
        MaterialRequisitionDetailId?: number
        IsFinalized: boolean;
        ApprovalStatus: string | null;
        IsFinalizedByOtherVendor: boolean;
    }

interface Props {
    data: Row[]
    isEditable?: boolean
    isAnotherVendorEditing?: boolean;
    columns?: EditableTableColumn[]
    onChange?: (rows: Row[]) => void
    vendorId?: number
    termId?: number
    onSave?: (rows: Row[]) => void
    onEditModeChange?: (isEditing: boolean) => void
    MaterialRequisitionStatus?: string
    MaterialRequisitionApprovalStatus?: string
    VendorGSTNumber?: string
    CompanyGSTNumber?: string
    IsPendingMaterialRequisitionDetail?: boolean
    addToast?: ReturnType<typeof useToast>["addToast"]
    onCancel?: () => void;
}

const normalizeRows = (items: Row[]): Row[] => items.map(row => Number(row.MaterialRequisitionDetailId) === 0 ? { ...row, MaterialName: row.MaterialName ?? "" } : row);

export const QuotationTable: React.FC<Props> = ({
    data,
    onChange,
    onSave,
    onEditModeChange,
    MaterialRequisitionStatus,
    MaterialRequisitionApprovalStatus,
    VendorGSTNumber,
    CompanyGSTNumber,
    IsPendingMaterialRequisitionDetail,
    addToast,
    onCancel,
    isAnotherVendorEditing
}) => {
    const [rows, setRows] = useState<Row[]>(() => normalizeRows(data))
    const [stagedRows, setStagedRows] = useState<Row[]>(() => normalizeRows(data))
    const [isEditing, setIsEditing] = useState(false)
    const { canAction } = useMenuPermissions('Get Quotation');

    const isEditDisabled =
        !canAction ||
        !IsPendingMaterialRequisitionDetail ||
        ["CLOSED", "COMPLETED"].includes(MaterialRequisitionStatus?.trim().toUpperCase() ?? "") ||
        MaterialRequisitionApprovalStatus?.trim().toUpperCase() !== "APPROVED";

    useEffect(() => {
        if (!isEditing) {
            const normalizedData = normalizeRows(data)
            setRows(normalizedData)
            setStagedRows(normalizedData)
        }
    }, [data, isEditing]);

    const computedRows = useMemo(
        () =>
            (isEditing ? stagedRows : rows).map(r => ({
                ...r,
                id: r.id ?? `row-${r.MaterialName}-${r.MaterialQuantity}`,
                Amount: Number((r as any).MaterialRequisitionDetailId) === 0 ? Number(r.Amount ?? 0) : computeAmountInstallation(r),
            })),
        [rows, stagedRows, isEditing]
    )

    const handleChange = useCallback((newRows: Row[]) => {

        const updatedRows = normalizeRows(newRows).map(row => {

            const amount = Number(row.MaterialRequisitionDetailId) === 0 ? Number(row.Amount || 0) : computeAmountInstallation(row);

            if (amount <= 0) {
                return {
                    ...row,
                    CGST: 0,
                    SGST: 0,
                    UGST: 0,
                    TGST: 0,
                };
            }

            return row;
        });

        setStagedRows(updatedRows);

    }, [onChange]);

    const handleSave = () => {

        const invalidInstallationRow = stagedRows.find(row => Number(row.MaterialRequisitionDetailId) !== 0 && Number(row.Installation || 0) > 0 && Number(row.MaterialPerUnit || 0) <= 0);

        if (invalidInstallationRow) {
            addToast?.({ type: "error", title: "Unit Price must be greater than 0 when Installation Amount is entered" });
            return;
        }
        const invalidPercentageRow = stagedRows.find(row => {
            const cgst = Number(row.CGST || 0);
            const sgst = Number(row.SGST || 0);
            const igst = Number(row.TGST || 0);

            return (cgst >= 100 || sgst >= 100 || igst >= 100);
        });

        if (invalidPercentageRow) {
            addToast?.({ type: "error", title: "GST percentage must be less than 100%." });
            return;
        }

        if (isSameState) {
            const invalidRow = stagedRows.find(row => {
                const cgst = Number(row.CGST || 0);
                const sgst = Number(row.SGST || 0);

                return cgst !== sgst;
            });

            if (invalidRow) {
                addToast?.({ type: "error", title: "CGST and SGST percentage must be the same." });
                return;
            }
        }

        setRows(stagedRows);
        onChange?.(stagedRows);

        onSave?.(
            stagedRows.map(r => ({
                ...r,
                Amount: Number((r as any).MaterialRequisitionDetailId) === 0 ? Number(r.Amount ?? 0) : computeAmountInstallation(r),
            }))
        );

        setIsEditing(false);
        onEditModeChange?.(false);
    };


    const handleCancel = () => {
        setStagedRows(normalizeRows(rows));
        setIsEditing(false)
        onEditModeChange?.(false)
        onCancel?.();
    }

    const GROUPS: EditableColumnGroup[] = [
        { label: "ITEM INFORMATION", keys: ["MaterialOrService", "MaterialQuantity"], background: "#0F2744" },
        { label: "PRICING", keys: ["MaterialPerUnit", "Installation", "Amount",], background: "#1A3560" },
        { label: "TAX BREAKDOWN (%)", keys: ["CGST", "SGST", "UGST", "TGST"], background: "#1E3A5F", color: "#FDE68A" },
        { label: "SUMMARY", keys: ["Total"], background: "#0F2744" }
    ]


    const hasAmount = (row: Row) => {

        const amount = Number(row.MaterialRequisitionDetailId) === 0 ? Number(row.Amount || 0) : computeAmountInstallation(row);

        return amount > 0;
    };

    const getGSTType = () => {

        const vendorStateCode = VendorGSTNumber?.trim().substring(0, 2);
        const companyStateCode = CompanyGSTNumber?.trim().substring(0, 2);

        if (!vendorStateCode || !companyStateCode) {
            return {
                isSameState: false,
                isDifferentState: false,
            };
        }

        const isSameState = vendorStateCode === companyStateCode;

        return {
            isSameState,
            isDifferentState: !isSameState,
        };
    };

    const { isSameState, isDifferentState } = getGSTType();
    const hasFinalizedRow = rows.some(row => row.IsFinalizedByOtherVendor === true);

    const columns: EditableTableColumn[] = useMemo(() => [
        {
            key: "MaterialOrService",
            label: "MATERIAL (M) / SERVICE (S)",
            type: "readonly",
            editable: false,
            width: 200,
            align: "left",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            cellClassName: "font-medium text-gray-900",
            render: (_value, row) => {
                const isService = Number(row?.MaterialRequisitionDetailId) === 0;

                return (
                    <div className="flex items-start gap-2">

                        <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${isService
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                                }`}
                            title={isService ? "Service" : "Material"}
                        >
                            {isService ? "S" : "M"}
                        </span>

                        <div className="flex min-w-0 flex-col">
                            {isService ? (
                                <span className="text-gray-900">
                                    {row?.MaterialName || ""}
                                </span>
                            ) : row.MaterialRequisitionType?.trim().toUpperCase() === "IN - DIRECT" ? (
                                <>
                                    <span className="text-gray-900">
                                        {row?.MaterialName || ""}
                                    </span>

                                    <span className="text-gray-500 text-xs whitespace-normal break-words">
                                        {row?.SubMaterialName || ""}
                                    </span>
                                </>
                            ) : (
                                <span className="text-gray-900">
                                    {row?.Level4Name || ""}
                                </span>
                            )}
                        </div>

                    </div>
                );
            }

        },
        {
            key: "MaterialQuantity",
            label: "QUANTITY",
            type: "number",
            editable: isEditing,
            width: 100,
            align: "right",
            headerClassName: "bg-[#1E3A5F] text-white tracking-[1px]",
            render: (_value, row) => (
                <div className="w-full flex justify-end items-start p-0 m-0">

                    {Number(row?.MaterialRequisitionDetailId) !== 0 && (
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1 leading-none">
                            {row?.MaterialQuantity || "-"}{" "}
                            {row?.MaterialRequisitionType?.trim().toUpperCase() === "DIRECT"
                                ? row?.Level4SubMaterialUomCode
                                : row?.UomCode}
                        </span>
                    )}

                </div>
            )
        },
        {
            key: "MaterialPerUnit",
            label: "PRICE / UNIT (₹)",
            type: "number",
            editable: isEditing,
            width: 120,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#253E60] text-white tracking-[0.8px]",
            render: (_value, row) => {

                if (Number(row?.MaterialRequisitionDetailId) === 0) return

                <span className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-500 text-xs font-semibold shadow-sm">
                    —
                </span>

                return (
                    <div className="flex justify-end w-full">
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1">
                            {row?.MaterialPerUnit || '-'}
                        </span>
                    </div>
                )
            },
            renderEditor: (_value, onChange, row) => {

                if (row.IsFinalizedByOtherVendor || Number(row.MaterialRequisitionDetailId) === 0) {
                    return <div className="flex justify-end w-full">
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1">
                            {row?.MaterialPerUnit || '-'}
                        </span>
                    </div>;
                }

                return (
                    <Input
                        type="text"
                        value={row?.MaterialPerUnit ?? 0}
                        onChange={(e) => onChange(filterNumbersWithDecimal(e.target.value))}

                    />

                )
            }
        },
        {
            key: "Installation",
            label: "INSTALL / UNIT (₹)",
            type: "number",
            editable: isEditing,
            width: 120,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#253E60] text-white tracking-[1px]",
            render: (_value, row) => {

                if (Number(row?.MaterialRequisitionDetailId) === 0) return

                <span className="inline-flex items-center justify-center min-w-[70px] px-3 py-1.5 rounded-md bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 text-gray-500 text-xs font-semibold shadow-sm">
                    —
                </span>

                return (
                    <div className="flex justify-end w-full">
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1">
                            {row?.Installation || 0}
                        </span>
                    </div>
                )
            },
            renderEditor: (_value, onChange, row) => {

                if (row.IsFinalizedByOtherVendor || Number(row.MaterialRequisitionDetailId) === 0) {
                    return <div className="flex justify-end w-full">
                        <span className="bg-gray-200 text-gray-700 text-xs font-medium rounded px-2 py-1">
                            {row?.Installation || '-'}
                        </span>
                    </div>;
                }

                return (
                    <Input
                        type="text"
                        value={row?.Installation ?? 0}
                        onChange={(e) => onChange(filterNumbersWithDecimal(e.target.value))}

                    />

                )
            }

        },
        {
            key: "Amount",
            label: "AMOUNT (₹)",
            type: "number",
            editable: isEditing,
            width: 120,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#253E60] text-white tracking-[1px]",


            renderEditor: (_value, onChange, row) => {

                if (Number(row.MaterialRequisitionDetailId) === 0 && !hasFinalizedRow) {
                    return (
                        <Input
                            type="text"
                            value={row?.Amount ?? 0}
                            onChange={(e) => onChange(filterNumbersWithDecimal(e.target.value))}

                        />
                    )
                }

                return (
                    <span className="w-full block text-right pr-1 font-bold text-black-300">
                        {formatCurrency(computeAmountInstallation(row))}
                    </span>
                )
            },
            render: (_value, row) => (
                <span className="w-full block text-right pr-1">
                    ₹{(Number(row.MaterialRequisitionDetailId) === 0 ? (row.Amount ?? 0) : computeAmountInstallation(row)).toLocaleString()}
                </span>
            )
        },

        {
            key: "CGST",
            label: "CGST (%)",
            type: "number",
            editable: isEditing && isSameState,
            width: 80,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            renderEditor: (_value, onChange, row) => {

                if ((Number(row.MaterialRequisitionDetailId) === 0 && hasFinalizedRow) || !isSameState || !hasAmount(row) || row.IsFinalizedByOtherVendor) {
                    return (
                        <span className="text-gray-400 text-right block">
                            {row.CGST || "-"}
                        </span>
                    );
                }

                return (
                    <Input
                        type="text"
                        value={row?.CGST ?? ""}
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);

                            if (val !== null) {
                                onChange(val === "" ? 0 : filterNumbersWithDecimal(val));
                            }
                        }}
                        className="text-right"
                    />
                );
            },

            cellClassName: (value) => value !== 0 ? "text-yellow-600 font-semibold bg-yellow-50" : "text-gray-400 font-semibold bg-gray-100"
        },

        {
            key: "SGST",
            label: "SGST (%)",
            editable: isEditing && isSameState,
            type: "number",
            width: 80,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            renderEditor: (_value, onChange, row) => {

                if ((Number(row.MaterialRequisitionDetailId) === 0 && hasFinalizedRow) || !isSameState || !hasAmount(row) || row.IsFinalizedByOtherVendor) {
                    return (
                        <span className="text-gray-300 text-right block">
                            {row.SGST || "-"}
                        </span>
                    );
                }
                return (
                    <Input
                        type="text"
                        value={row?.SGST ?? ""}
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);

                            if (val !== null) {
                                onChange(val === "" ? 0 : filterNumbersWithDecimal(val));
                            }
                        }}
                        className="text-right"
                    />
                );
            },
            cellClassName: (value) => value !== 0 ? "text-yellow-600 font-semibold bg-yellow-50" : "text-gray-400 font-semibold bg-gray-100"
        },

        {
            key: "TGST",
            label: "IGST (%)",
            editable: isEditing && isDifferentState,
            type: "number",
            width: 80,
            align: "right",
            headerClassName: "bg-[#2A3F5F] text-yellow-200 tracking-[1.1px]",
            suffix: "%",
            renderEditor: (_value, onChange, row) => {

                if ((Number(row.MaterialRequisitionDetailId) === 0 && hasFinalizedRow) || !isSameState || !hasAmount(row) || row.IsFinalizedByOtherVendor) {
                    return (
                        <span className="text-gray-300 text-right block">
                            {row.TGST ?? "-"}
                        </span>
                    );
                }
                return (
                    <Input
                        type="text"
                        value={row?.TGST ?? ""}
                        onChange={(e) => {
                            const val = allowPercentage(e.target.value);

                            if (val !== null) {
                                onChange(val === "" ? 0 : filterNumbersWithDecimal(val));
                            }
                        }}


                        className="text-right"
                    />
                );
            },
            cellClassName: (value) => value !== 0 ? "text-yellow-600 font-semibold bg-yellow-50" : "text-gray-400 font-semibold bg-gray-100"
        },
        {
            key: "Total",
            label: "TOTAL (₹)",
            type: "computed",
            compute: computeGrandTotal,
            editable: false,
            width: 50,
            align: "right",
            prefix: "₹",
            headerClassName: "bg-[#1E3A5F] text-green-200 tracking-[1px]",
            cellClassName: "text-green-600 font-semibold"
        }
    ], [isEditing, isSameState, isDifferentState])

    return (
        <div className="space-y-4 rounded-xl">
            <div className="flex items-center justify-between">

                <div className="flex flex-col gap-1">

                    <div className="text-md font-medium text-gray-900">
                        Quotation
                    </div>

                    {(isEditing || isAnotherVendorEditing) && (
                        <span className="text-xs font-medium text-blue-600">
                            <strong>Note:</strong> Only one vendor quotation can be edited
                            at a time. Please save or cancel before editing another.
                        </span>
                    )}

                </div>

                {!isEditDisabled && !isAnotherVendorEditing && (!isEditing ? (

                    <button
                        onClick={() => {
                            setIsEditing(true)
                            onEditModeChange?.(true)
                        }}
                        className="px-4 py-2 text-md bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                        Edit
                    </button>
                ) : (
                    <div className="flex gap-2">

                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-md bg-gray-200 hover:bg-gray-300 rounded-lg">
                            Cancel
                        </button>

                        <button
                            onClick={handleSave}
                            className="px-4 py-2 text-md bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                            Save
                        </button>

                    </div>
                )
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