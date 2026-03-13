import React from "react";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { useViewportHeight } from "@/core/utils/useViewportHeight";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { PaginationInfo, SortInfo, TableColumn } from "./DataTable";

interface DataTableDraggableProps {
    data: any[];
    columns: TableColumn[];
    pagination?: PaginationInfo;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
    fixedHeight?: boolean;
    maxHeight?: string;
    recordsPerPage?: number;
    sortInfo?: SortInfo;
    onSort?: (sortInfo: SortInfo) => void;

    enableRowReorder?: boolean;
    onRowReorder?: (data: any[]) => void;
}

export const DataTableDraggable: React.FC<DataTableDraggableProps> = ({
    data,
    columns,
    pagination,
    loading = false,
    emptyMessage = "No data available",
    className = "",
    fixedHeight = false,
    maxHeight = useViewportHeight(255, 350, 900),
    sortInfo,
    onSort,
    enableRowReorder = false,
    onRowReorder
}) => {

    const [selectedRowIndex, setSelectedRowIndex] = React.useState<number | null>(null);
    const [dragIndex, setDragIndex] = React.useState<number | null>(null);

    const handleSort = (columnKey: string) => {
        const column = columns.find(col => col.key === columnKey);
        if (!onSort || !column?.sortable) return;

        const newDirection =
            sortInfo?.column === columnKey && sortInfo?.direction === "asc"
                ? "desc"
                : "asc";

        onSort({ column: columnKey, direction: newDirection });
    };

    // Keyboard reorder
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!enableRowReorder) return;
        if (selectedRowIndex === null) return;

        const newData = [...data];

        if (e.key === "ArrowUp" && selectedRowIndex > 0) {
            [newData[selectedRowIndex - 1], newData[selectedRowIndex]] =
                [newData[selectedRowIndex], newData[selectedRowIndex - 1]];

            onRowReorder?.(newData);
            setSelectedRowIndex(selectedRowIndex - 1);
        }

        if (e.key === "ArrowDown" && selectedRowIndex < data.length - 1) {
            [newData[selectedRowIndex + 1], newData[selectedRowIndex]] =
                [newData[selectedRowIndex], newData[selectedRowIndex + 1]];

            onRowReorder?.(newData);
            setSelectedRowIndex(selectedRowIndex + 1);
        }
    };

    // Drag start
    const handleDragStart = (index: number) => {
        if (!enableRowReorder) return;
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (dropIndex: number) => {

        if (dragIndex === null || dragIndex === dropIndex) return;

        const newData = [...data];
        const draggedItem = newData[dragIndex];

        newData.splice(dragIndex, 1);
        newData.splice(dropIndex, 0, draggedItem);

        onRowReorder?.(newData);
        setDragIndex(null);
    };

    const renderPagination = () => {
        if (!pagination) return null;

        const { currentPage, totalPages, totalRecords, pageSize, onPageChange } =
            pagination;

        const startRecord =
            totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
        const endRecord = Math.min(currentPage * pageSize, totalRecords);

        return (
            <div className="flex justify-between px-4 py-2">
                <div className="text-sm">
                    Showing {startRecord} to {endRecord} of {totalRecords}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className={`bg-white rounded border-b border-gray-200 ${className}`}>

            <div
                className={`overflow-auto`}
                style={{ maxHeight: fixedHeight ? maxHeight : undefined }}
            >
                <table className="min-w-full border-collapse border border-gray-300" tabIndex={0} onKeyDown={handleKeyDown}>
                    <thead className="bg-blue-50 sticky top-0">
                        <tr>

                            {enableRowReorder && (
                                <th className="w-8 border border-gray-200"></th>
                            )}

                            {columns.map(column => (
                                <th
                                    key={column.key}
                                    className={`px-4 py-2 text-gray-800 tracking-wider whitespace-nowrap
                                            ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}
                                            ${column.width ? `w-${column.width}` : ''}
                                            ${column.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
                                            ${column.fixed === 'left'
                                            ? 'sticky left-0 z-35 shadow-[2px_0_4px_rgba(0,0,0,0.1)]'
                                            : column.fixed === 'right'
                                                ? 'sticky right-0 z-35 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]'
                                                : ''
                                        }
        `}
                                    style={{
                                        ...(column.width ? { width: column.width } : {}),
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        lineHeight: '1.4',
                                        letterSpacing: '0%',
                                        backgroundColor: '#E4F0FF',
                                        borderBottom: '1px solid #D1D5DB',
                                        borderRight: '1px solid #D1D5DB',
                                    }}
                                    onClick={() => column.sortable && handleSort(column.key)} >
                                    <div className={`flex items-center space-x-1 ${column.align === 'center'
                                        ? 'justify-center'
                                        : column.align === 'right'
                                            ? 'justify-end'
                                            : 'justify-start'
                                        }`}>
                                        <span className="truncate">{column.label}</span>
                                        {column.sortable && <ArrowUpDown size={12} />}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {!loading && data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + (enableRowReorder ? 1 : 0)}>
                                    <NoDataView message={emptyMessage} />
                                </td>
                            </tr>
                        )}

                        {data.map((row, index) => (
                            <tr
                                key={index}
                                draggable={enableRowReorder}
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                onClick={() =>
                                    enableRowReorder && setSelectedRowIndex(index)
                                }
                                className={`border-b border-gray-200 h-10 hover:bg-gray-50
                ${selectedRowIndex === index ? "bg-blue-100" : ""}
                ${enableRowReorder ? "cursor-move" : ""}`}
                            >

                                {enableRowReorder && (
                                    <td className="px-2 border border-gray-200 text-center cursor-grab">
                                        ⋮⋮
                                    </td>
                                )}

                                {columns.map(col => (
                                    <td key={col.key} className="px-3 py-2 border border-gray-200">
                                        {col.render
                                            ? col.render(row[col.key], row, index)
                                            : row[col.key]}
                                    </td>
                                ))}

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && renderPagination()}
        </div>
    );
};