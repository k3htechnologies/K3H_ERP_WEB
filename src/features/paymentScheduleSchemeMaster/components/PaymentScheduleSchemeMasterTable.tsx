import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import type { PaymentScheduleSchemeMasterData } from '@/features/paymentScheduleSchemeMaster/models/PaymentScheduleSchemeMasterModel';
import TooltipText from '@/ui/components/Tooltip/TooltipText';

interface PaymentScheduleSchemeMasterTableProps {
    data: PaymentScheduleSchemeMasterData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onView: (row: PaymentScheduleSchemeMasterData) => void;
    onEdit: (row: PaymentScheduleSchemeMasterData) => void;
    onDelete: (row: PaymentScheduleSchemeMasterData) => void;
    canAction: boolean;
    loading: boolean;
}

export const PaymentScheduleSchemeMasterTable: React.FC<PaymentScheduleSchemeMasterTableProps> = ({
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

                };
            }
            if (col.key === 'PaymentScheduleScheme') {

                return {

                    ...col,

                    render: (value, row) => (
                        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
                            <TooltipText
                                text={value || '-'}
                                maxWidth="300px"
                                tooltipThreshold={40}
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
            emptyMessage="No Payment Schedule Scheme Data Found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={onSort}
            loading={loading}
        />
    );
};
