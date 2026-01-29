import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { CompOffData } from '@/features/compOff/models/compOff';

interface CompOffTableProps {
    data: CompOffData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onDelete: (row: CompOffData) => void;
    canAction: boolean;
    loading: boolean;
}

export const CompOffTable: React.FC<CompOffTableProps> = ({
    data,
    columns,
    pagination,
    sortInfo,
    onSort,
    onDelete,
    canAction = false,
    loading
}) => {
    const tableColumns = useMemo<TableColumn[]>(() => {
        // Ensure onDelete is defined
        const handleDelete = onDelete || (() => {});
        const hasCanAction = Boolean(canAction);

        const mappedColumns = columns.map(col => {
            if (col.key === 'Actions') {
                return {
                    ...col,
                    render: (_value: any, row: CompOffData) => {
                        if (!hasCanAction) {
                            return <div className="flex items-center justify-center gap-2"></div>;
                        }
                        return (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDelete(row);
                                    }}
                                    color='transparent'
                                    isborderRadius
                                    size='sm'
                                    style={{
                                        color: 'red',
                                        padding: '4px 8px'
                                    }}
                                    title="Delete Comp Off"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    }
                };
            }
            return col;
        });

        // Ensure Actions column exists, add it if missing
        const hasActions = mappedColumns.some(col => col.key === 'Actions');
        if (!hasActions) {
            const actionsColumn: TableColumn = {
                key: 'Actions',
                label: 'Actions',
                width: '12',
                fixed: 'right',
                align: 'center',
                render: (_value: any, row: CompOffData) => {
                    if (!hasCanAction) {
                        return <div className="flex items-center justify-center gap-2"></div>;
                    }
                    return (
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDelete(row);
                                }}
                                color='transparent'
                                isborderRadius
                                size='sm'
                                style={{
                                    color: 'red',
                                    padding: '4px 8px'
                                }}
                                title="Delete Comp Off"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    );
                }
            };
            return [...mappedColumns, actionsColumn];
        }

        return mappedColumns;
    }, [columns, canAction, onDelete]);

    return (
        <DataTable
            data={data}
            columns={tableColumns}
            pagination={pagination}
            emptyMessage="No Comp Off found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={onSort}
            loading={loading}
        />
    );
};





