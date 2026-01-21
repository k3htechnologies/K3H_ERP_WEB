import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Trash2, LockIcon } from 'lucide-react';
import { Button } from '@/ui/components/forms';
import { useNavigate } from 'react-router-dom';
import type { DesignationMasterData } from '@/features/designationMaster/models/DesignationMasterModel';

interface DesignationMasterTableProps {
  data: DesignationMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: DesignationMasterData) => void;
  onEdit: (row: DesignationMasterData) => void;
  onDelete: (row: DesignationMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const DesignationMasterTable: React.FC<DesignationMasterTableProps> = ({
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
  const navigate = useNavigate();

  const tableColumns = useMemo<TableColumn[]>(() => {

    return columns.map(col => {
      
      if (col.key === 'Actions') {
        return {

          ...col,

          render: (_value, row: DesignationMasterData) => (

            canAction && !row.NumberOfEmployee ? (

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
                  title="Delete Designation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ) : null
          )
        };
      }
      if (col.key === 'DesignationName') {
        return {

          ...col,

          render: (value, row: DesignationMasterData) => {

            const showKey = canAction && row.NumberOfEmployee
            return (
              <div className="flex items-center justify-end ml-2 gap-1">
                <TooltipText
                  text={value || '-'}
                  maxWidth="350px"
                  tooltipThreshold={45}
                  onClick={() => onView(row)}
                />
                <div className="w-[34px] flex justify-center">
                  {showKey ? (
                    <Button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        navigate(`/designationMaster/employeeModuleAccess/${row.DesignationMasterId}`, {
                          state: {
                            designationName: row.DesignationName
                          },
                        })
                      }}
                      color="transparent"
                      isborderRadius
                      size="sm"
                      style={{ color: 'black' }}
                      title="Module Access"
                    >
                      <LockIcon className="h-4 w-4" strokeWidth={row.IsSetAccessModule ? 2.5 : 0.5} />
                    </Button>
                  ) : (
                    <div className="opacity-0 h-[32px] w-[34px]" />
                  )}
                </div>
              </div>
            )
          }
        };
      }
      return col;
    });
  }, [columns, canAction, onView, onDelete, navigate]);

  return (
    <DataTable
      data={data}
      columns={tableColumns}
      pagination={pagination}
      emptyMessage="No Designation Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};
