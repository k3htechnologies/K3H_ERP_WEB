import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import type { DarAllocationData } from '@/features/darAllocation/models/DarAllocationModel';
import { Button } from '@/ui/components/forms';
import { Trash2 } from 'lucide-react';

interface DarAllocationTableProps {
    data: DarAllocationData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onView: (row: DarAllocationData) => void;
    onDelete: (row: DarAllocationData) => void;
    loading: boolean;
    canAction: boolean;
}

export const DarAllocationTable: React.FC<DarAllocationTableProps> =
    ({
        data,
        columns,
        pagination,
        sortInfo,
        onSort,
        onView,
        onDelete,
        loading,
        canAction,

    }) => {
        const tableColumns = useMemo<TableColumn[]>(() => {
            return columns.map(col => {

                if (col.key === 'EmployeeName') {
                    return {
                        ...col,
                        render: (value, row: DarAllocationData) => (
                            <span className="text-[#135BEC] font-medium cursor-pointer hover:underline" onClick={() => onView(row)} >
                                {value || '-'}
                            </span>
                        )
                    };
                }

                if (col.key === 'VillageName') {
                    return {
                        ...col,
                        render: (value: string) => (
                            <div className="whitespace-normal break-words">
                                {value || '-'}
                            </div>
                        )
                    };
                }



                if (col.key === 'NumberOfChannelPartner') {
                    return {
                        ...col,
                        render: (value: number) => value ?? '0'
                    };
                }


                if (col.key === 'Actions') {

                    return {

                        ...col,

                        render: (_value, row: DarAllocationData) => (
                            canAction ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            onDelete(row)
                                        }}
                                        color='transparent'
                                        isborderRadius
                                        size='sm'
                                        style={{
                                            color: 'red',
                                            padding: '4px 8px'
                                        }}
                                        title="Delete DAR Allocation"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : null
                        )
                    };
                }
                return col;
            })

        }, [columns, onView, onDelete, canAction])

        return (
            <DataTable
                data={data}
                columns={tableColumns}
                pagination={pagination}
                emptyMessage="No DAR Allocation Data Found"
                fixedHeight
                recordsPerPage={20}
                className="flex-1"
                sortInfo={sortInfo}
                onSort={onSort}
                loading={loading}
            />
        )
    }