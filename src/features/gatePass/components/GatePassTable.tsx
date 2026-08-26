import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { GatePassData } from '@/features/gatePass/models/GatePassModel';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import FieldInfoTooltip from '@/ui/components/forms/FieldInfoTooltip';
import { getStatusColor } from '../utils/Status';

interface GetPassTableProps {
    data: GatePassData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onView: (row: GatePassData) => void;
    onEdit: (row: GatePassData) => void;
    onDelete: (row: GatePassData) => void;
    canAction: boolean;
    loading: boolean;
    lastUpdatedRow?: string | number | null;
}

export const GatePassTable: React.FC<GetPassTableProps> = ({
    data,
    columns,
    pagination,
    sortInfo,
    onSort,
    onView,
    onDelete,
    canAction,
    loading,
    lastUpdatedRow
}) => {

    const tableColumns = useMemo<TableColumn[]>(() => {
        return columns.map(col => {

            if (col.key === 'Actions') {
                return {
                    ...col,
                    render: (_value, row: GatePassData) => {

                        const isDisabled = !canAction || !row.IsDelete;

                        return canAction ? (
                            <div className="flex items-center justify-center gap-2">
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (isDisabled) return;
                                        onDelete(row);
                                    }}
                                    color="transparent"
                                    isborderRadius
                                    disabled={isDisabled}
                                    size="sm"
                                    style={{
                                        color: isDisabled ? "#9CA3AF" : "red",
                                        padding: "4px 8px",
                                        cursor: isDisabled ? "not-allowed" : "pointer",
                                        opacity: isDisabled ? 0.5 : 1,
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : null;
                    },
                };
            }

            if (col.key === 'FullName') {

                return {

                    ...col,

                    render: (value, row) => (
                        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
                            <TooltipText
                                text={value ? `${value}${Number(row.NoOfParticipants) > 0 ? ` +${row.NoOfParticipants}` : ''}` : '-'}
                                maxWidth="300px"
                                tooltipThreshold={40}
                                onClick={() => onView(row)}
                            />
                        </div>
                    )

                };
            }
            if (col.key === 'PassDateTime' && col.label === 'Appointment Date') {
                return {
                    ...col,
                    render: (_value: any, row: GatePassData) => (
                        <span>{formatDate_dd_MonthName_yy_hh_mm(row.PassDateTime)}</span>
                    ),
                };
            }
            if (col.key === 'Address') {
                return {
                    ...col,
                    render: (value) => (
                        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
                            <TooltipText
                                text={value || '-'}
                                maxWidth="300px"
                                tooltipThreshold={40}
                            />
                        </div>
                    )
                };
            }

            if (col.key === 'Remark') {
                return {
                    ...col,
                    render: (value: any) => (
                        <FieldInfoTooltip value={value} />
                    ),
                };
            }


            if (col.key === 'MobileNumber') {
                return {
                    ...col,
                    render: (value: any) => (
                        <span>
                            {value ? `+91 ${value}` : '-'}
                        </span>
                    ),
                };
            }
            if (col.key === 'Purpose') {
                return {
                    ...col,
                    render: (value) => {
                        const { bg, text } = getStatusColor(value);

                        return (
                            <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                                style={{
                                    backgroundColor: bg,
                                    color: text
                                }}
                            >
                                {value || "-"}
                            </span>
                        );
                    }
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
            rowKey="ExternalId"
            emptyMessage="No Gate Pass Data Found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            sortInfo={sortInfo}
            onSort={onSort}
            loading={loading}
            lastUpdatedRow={lastUpdatedRow}
        />
    );
};

