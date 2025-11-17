import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  LeaveEncashmentMasterData,
  FilterWithPaginationLeaveEncashmentMasterRequest
} from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';

import { LeaveEncashmentMasterService } from '@/features/leaveEncashmentMaster/services/LeaveEncashmentMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';


export const LeaveEncashmentMaster: React.FC = () => {

  const [leaveEncashmentMasterList, setLeaveEncashmentMasterList] = useState<LeaveEncashmentMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { toasts, removeToast, addToast } = useToast()
  const [viewLeaveEncashmentMasterDetailsData, setViewLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isShowCustomizeLeaveEncashmentMasterColumnsModal, setIsShowCustomizeLeaveEncashmentMasterColumnsModal] = useState(false);
  const { canExport } = useMenuPermissions();
  const hasFetchedInitialLeaveEncashments = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialLeaveEncashments.current) return
    hasFetchedInitialLeaveEncashments.current = true;
    fetchLeaveEncashmentList()
  }, [])

  const fetchLeaveEncashmentList = async (page: number = pagination.currentPage) => {
    return await loadLeaveEncashments(page);
  }

  const loadLeaveEncashments = async (page: number) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;
        if (sortInfo) {
          const column = leaveEncashmentMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveEncashmentMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          LeaveEncashmentMasterSlabsId: undefined,
          SortBy: sortByParam
        }
        const response = await getLeaveEncashments(params);
        if (E.isRight(response)) {
          setLeaveEncashmentMasterList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }
        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Loading Leave Encashment Data...'
    )
  }

  const handleExportLeaveEncashments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = leaveEncashmentMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationLeaveEncashmentMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getLeaveEncashments(params);
        handleExportFile(response, exportType, 'Leave Encashment Master', addToast)
        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' })
      },
      undefined,
      'Preparing Export...'
    )
  }

  const handleExportLeaveEncashmentExcel = () => handleExportLeaveEncashments('Excel')
  const handleExportLeaveEncashmentPdf = () => handleExportLeaveEncashments('PDF')

  const getLeaveEncashments = async (filterParams: FilterWithPaginationLeaveEncashmentMasterRequest) => {
    return await LeaveEncashmentMasterService.apiCallPullLeaveEncashmentMaster(filterParams);
  }

  const handlePageChange = (page: number) => {
    fetchLeaveEncashmentList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {
    setSortInfo(sortInfo);
    fetchLeaveEncashmentList(1);
  }

  const leaveEncashmentMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const leaveEncashmentListForTable = useMemo(() => leaveEncashmentMasterList, [leaveEncashmentMasterList]);

  const handleViewLeaveEncashmentDetails = useCallback((row: LeaveEncashmentMasterData) => {
    setViewLeaveEncashmentMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const leaveEncashmentMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'MinSalary',
        label: 'Min Salary',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'}
              maxWidth="200px"
              tooltipThreshold={20}
              onClick={() => handleViewLeaveEncashmentDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'MaxSalary',
        label: 'Max Salary',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <span className="text-sm font-medium">
            {value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'}
          </span>
        )
      },
      {
        key: 'EncashmentRate',
        label: 'Encashment Rate',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value || 0}%
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    [handleViewLeaveEncashmentDetails]
  )

  const requiredLeaveEncashmentMasterColumnKeys: string[] = ['MinSalary'];
  const allLeaveEncashmentMasterColumnKeys: string[] = leaveEncashmentMasterColumns.map(c => c.key)
  const [selectedLeaveEncashmentMasterColumnKeys, setSelectedLeaveEncashmentMasterColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getLeaveEncashmentMasterTableColumns();
      if (saved) {
        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveEncashmentMasterColumnKeys]));
        return withRequired.filter(k => allLeaveEncashmentMasterColumnKeys.includes(k));
      }
    } catch { }
    return allLeaveEncashmentMasterColumnKeys
  })

  useEffect(() => {
    setSelectedLeaveEncashmentMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveEncashmentMasterColumnKeys])).filter(k => allLeaveEncashmentMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveEncashmentMasterColumns.length])

  const visibleLeaveEncashmentMasterColumns = useMemo(
    () => leaveEncashmentMasterColumns.filter(col => selectedLeaveEncashmentMasterColumnKeys.includes(col.key)),
    [leaveEncashmentMasterColumns, selectedLeaveEncashmentMasterColumnKeys]
  )

  interface ViewLeaveEncashmentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: LeaveEncashmentMasterData | null
  }

  const ViewLeaveEncashmentDetailsModal: React.FC<ViewLeaveEncashmentDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Leave Encashment Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Min Salary</span>
              <span className="text-sm text-blue-600 font-medium">
                {data.MinSalary ? `₹${data.MinSalary.toLocaleString('en-IN')}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Max Salary</span>
              <span className="text-sm text-blue-600 font-medium">
                {data.MaxSalary ? `₹${data.MaxSalary.toLocaleString('en-IN')}` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Encashment Rate</span>
              <span className="text-sm text-blue-600 font-medium">{data.EncashmentRate || 0}%</span>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">{data.CreatedBy || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified By</span>
                    <span className="text-sm text-blue-600 font-medium">{data.ModifiedBy}</span>
                  </div>
                )}
                {data.ModifiedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified Date</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar={false}
          isShowFilterButton={false}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeLeaveEncashmentMasterColumnsModal(true)}
          isShowAddButton={false}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportLeaveEncashmentExcel}
          onExportPdf={handleExportLeaveEncashmentPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={leaveEncashmentListForTable}
          columns={visibleLeaveEncashmentMasterColumns}
          pagination={leaveEncashmentMasterPaginationInfo}
          emptyMessage="No leave encashment records found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewLeaveEncashmentDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewLeaveEncashmentMasterDetailsData(null)
          }}
          data={viewLeaveEncashmentMasterDetailsData}
        />
        <CustomizeColumnsModal
          isOpen={isShowCustomizeLeaveEncashmentMasterColumnsModal}
          onClose={() => setIsShowCustomizeLeaveEncashmentMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredLeaveEncashmentMasterColumnKeys]))
            setSelectedLeaveEncashmentMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeLeaveEncashmentMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={leaveEncashmentMasterColumns}
          selectedKeys={selectedLeaveEncashmentMasterColumnKeys}
          requiredKeys={requiredLeaveEncashmentMasterColumnKeys}
          title="Customize Leave Encashment Master Table Columns"
        />
      </div>
    </>
  )
}

export default LeaveEncashmentMaster


