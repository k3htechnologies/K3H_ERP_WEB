import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';

import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Button } from '@/ui/components/forms';
import type { ContractMasterData } from '@/features/contractMaster/models/ContractMasterModel';

interface ContractMasterTableProps {
    data: ContractMasterData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onView: (row: ContractMasterData) => void;
    onEdit: (row: ContractMasterData) => void;
    onDelete: (row: ContractMasterData) => void;
    canAction: boolean;
    loading: boolean;
}

export const ContractMasterTable: React.FC<ContractMasterTableProps> = ({
    data,
    columns,
    pagination,
    sortInfo,
    onSort,
    onView,
    onDelete,
    canAction,
    loading
}) => {
    const tableColumns = useMemo<TableColumn[]>(() => {
        return columns.map(col => {
            if (col.key === 'Actions') {
                return {
                    ...col,
                    render: (_value, row: ContractMasterData) => (

                        <div className="flex items-center justify-center gap-2">
                            <Button
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    if (!canAction) return;
                                    onDelete(row)
                                }}
                                color='transparent'
                                isborderRadius
                                disabled={!canAction}
                                size='sm'
                                style={{
                                    color: canAction ? 'red' : '#9CA3AF',
                                    padding: '4px 8px',
                                    cursor: canAction ? 'pointer' : 'not-allowed',
                                    opacity: canAction ? 1 : 0.5
                                }}
                                title="Delete Contract"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                    )
                };
            }
            if (col.key === 'ContractName') {
                return {
                    ...col,
                    render: (value, row: ContractMasterData) => (
                        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
                            <TooltipText
                                text={value || '-'}
                                maxWidth="250px"
                                tooltipThreshold={30}
                                onClick={() => onView(row)}
                            />
                        </div>
                    )
                };
            }
            return col;
        });
    }, [columns, canAction, onView, onDelete]);

    return (
        <DataTable
            data={data}
            columns={tableColumns}
            pagination={pagination}
            emptyMessage="No Contracts Data Found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={onSort}
            loading={loading}
        />
    );
};
