import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2 } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import type { ClassificationParameterData } from '@/features/classificationParameter/models/ClassificationParameterModel';


interface ClassificationParamterTableProps {
    data: ClassificationParameterData[];
    columns: TableColumn[];
    pagination: PaginationInfo;
    sortInfo?: SortInfo;
    onSort: (sort: SortInfo) => void;
    onView: (row: ClassificationParameterData) => void;
    onEdit: (row: ClassificationParameterData) => void;
    onDelete: (row: ClassificationParameterData) => void;
    canAction: boolean;
    loading: boolean;

}


export const ClassificationParameterTable: React.FC<ClassificationParamterTableProps> = ({
    data,
    columns,
    pagination,
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

                    render: (_value, row: ClassificationParameterData) => (
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
                                    title="Delete Classification Parameter"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : null
                    )
                };
            }

            if (col.key === 'MinBudget') {

                return {

                    ...col,

                    render: (value, row) => (
                        <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
                            <TooltipText
                                text={value === 0 ? '<1' : (value || '-')}
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
            emptyMessage="No Classification Parameter Data Found"
            fixedHeight={true}
            recordsPerPage={20}
            className="flex-1"
            loading={loading}
        />
    );

}