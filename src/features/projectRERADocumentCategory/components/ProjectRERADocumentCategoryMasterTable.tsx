import React, { useMemo } from 'react';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import type { ProjectRERADocumentCategoryMasterData } from '@/features/projectRERADocumentCategory/models/ProjectRERADocumentCategoryMasterModel';

interface ProjectRERADocumentCategoryMasterTableProps {
  data: ProjectRERADocumentCategoryMasterData[];
  columns: TableColumn[];
  pagination: PaginationInfo;
  sortInfo?: SortInfo;
  onSort: (sort: SortInfo) => void;
  onView: (row: ProjectRERADocumentCategoryMasterData) => void;
  canAction: boolean;
  loading: boolean;
}

export const ProjectRERADocumentCategoryMasterTable: React.FC<ProjectRERADocumentCategoryMasterTableProps> = ({
  data,
  columns,
  pagination,
  sortInfo,
  onSort,
  onView,
  loading
}) => {
  const tableColumns = useMemo<TableColumn[]>(() => {
    return columns.map(col => {
      if (col.key === 'ProjectRERADocumentCategoryName') {
        return {
          ...col,
          render: (value, row) => (
            <div className="flex items-center justify-start">
              <TooltipText
                text={value || 'N/A'}
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
  }, [columns, onView]);

  return (
    <DataTable
      data={data}
      columns={tableColumns}
      pagination={pagination}
      emptyMessage="No Project RERA Document Category Data Found"
      fixedHeight={true}
      recordsPerPage={20}
      className="flex-1"
      sortInfo={sortInfo}
      onSort={onSort}
      loading={loading}
    />
  );
};

