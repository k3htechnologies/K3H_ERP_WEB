import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  LeaveEncashmentMasterData,
  FilterWithPaginationLeaveEncashmentMasterRequest,
  AddUpdateLeaveEncashmentMasterRequest,
  DeleteLeaveEncashmentMasterRequest
} from '@/features/leaveEncashmentMaster/models/LeaveEncashmentMasterModel';

import { LeaveEncashmentMasterService } from '@/features/leaveEncashmentMaster/services/LeaveEncashmentMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit, Trash2 } from 'lucide-react';
import { Button, Input } from '@/ui/components/forms';


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
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialLeaveEncashments = useRef(false)


  // EDIT DEPARTMENT MASTER
  const [editingLeaveEncashmentMasterData, setEditingLeaveEncashmentMasterData] = useState<LeaveEncashmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE DEPARTMENT MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteLeaveEncashmentMasterDetailsData, setDeleteLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)


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

  const handleEditLeaveEncashmentMaster = useCallback((row: LeaveEncashmentMasterData) => {
    setEditingLeaveEncashmentMasterData({
      ...row,

    })
    setIsAddUpdateModalOpen(true);

  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveEncashmentMasterData) => {
    setDeleteLeaveEncashmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const leaveEncashmentMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'EncashmentRate',
        label: 'Encashment Rate',
        width: '20',
        sortable: true,
        align: 'center',
        render: (value, row) => (
          <div className="flex items-center justify-center">

            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {value || 0}%
            </span>
            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditLeaveEncashmentMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit LeaveEncashment"
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    style={{
                      color: 'red',
                      padding: '0px 8px'
                    }}
                    title="Delete LeaveEncashment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              </div>
            )}
          </div>
        )
      },
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
              <span className="text-sm font-medium text-gray-700">Encashment Rate</span>
              <span className="text-sm text-blue-600 font-medium">{data.EncashmentRate || 0}%</span>
            </div>
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
    );
  };

  // ADD UPDATE Leave Encashment Master
  const handleAddLeaveEncashmentModal = () => {
    setEditingLeaveEncashmentMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateLeaveEncashmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateLeaveEncashmentMasterRequest) => void;
    data?: LeaveEncashmentMasterData | null;
    loading?: boolean;
  }

  const AddUpdateLeaveEncashmentModal: React.FC<AddUpdateLeaveEncashmentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {

    const [formData, setFormData] = useState<AddUpdateLeaveEncashmentMasterRequest>({
      LeaveEncashmentMasterSlabsId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      MinSalary: 0,
      MaxSalary: 0,
      EncashmentRate: 0,
    });

    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
      if (isOpen) {
        if (data) {
          // EDIT Leave Encashment
          setFormData({
            LeaveEncashmentMasterSlabsId: data.LeaveEncashmentMasterSlabsId ?? 0,
            Uniquekey: data.Uniquekey ?? "",
            MinSalary: data.MinSalary ?? 0,
            MaxSalary: data.MaxSalary ?? 0,
            EncashmentRate: data.EncashmentRate ?? 0,
          });
        } else {
          // ADD Leave Encashment
          setFormData({
            LeaveEncashmentMasterSlabsId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            MinSalary: 0,
            MaxSalary: 0,
            EncashmentRate: 0,
          });
        }
        setErrors({});
      }
    }, [isOpen, data]);

    // Handle input change
    const handleFieldChange = (
      field: keyof AddUpdateLeaveEncashmentMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // Submit handler
    const handleSubmitAddUpdateLeaveEncashment = (e: React.FormEvent) => {
      e.preventDefault();
      const requiredFields = [
        "MinSalary",
        "MaxSalary",
        "EncashmentRate"
      ];

      const newErrors: any = {};

      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateLeaveEncashmentMasterRequest];
        if (value === null || value === undefined || value.toString().trim() === "") {
          const label = field.replace(/([A-Z])/g, " $1");
          newErrors[field] = `${label} is required`;
        }
      });
      setErrors(newErrors);

      // STOP submit if any error
      if (Object.keys(newErrors).length > 0) return;

      onSubmit(formData);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={formData.LeaveEncashmentMasterSlabsId === 0 ? "Add LeaveEncashment" : "Update LeaveEncashment"}
        onSubmit={handleSubmitAddUpdateLeaveEncashment}
        saveText={formData.LeaveEncashmentMasterSlabsId === 0 ? "Save" : "Update"}
        cancelText="Cancel"
        loading={loading}
      >
        <div className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/*Encashment Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Encashment Rate % <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.EncashmentRate ?? ""}
                onChange={(e) => handleFieldChange("EncashmentRate", e.target.value)}
                className={`w-full p-2 rounded border ${errors.EncashmentRate ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.EncashmentRate && (
                <p className="text-red-500 text-xs mt-1">{errors.EncashmentRate}</p>
              )}
            </div>

            {/* MinSalary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MinSalary <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.MinSalary ?? ""}
                onChange={(e) => handleFieldChange("MinSalary", e.target.value)}
                className={`w-full p-2 rounded border ${errors.MinSalary ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.MinSalary && (
                <p className="text-red-500 text-xs mt-1">{errors.MinSalary}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MaxSalary */}
            <div>
              <label className="block text-sm font-medium mb-1">
                MaxSalary <span className="text-red-500">*</span></label>
              <Input
                value={formData.MaxSalary ?? ""}
                onChange={(e) => handleFieldChange("MaxSalary", e.target.value)}
                className={`w-full p-2 rounded border ${errors.MaxSalary ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder=""
              />
              {errors.MaxSalary && (
                <p className="text-red-500 text-xs mt-1">{errors.MaxSalary}</p>
              )}
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const handleAddUpdateLeaveEncashmentMaster = async (formData: AddUpdateLeaveEncashmentMasterRequest) => {

    setIsAddUpdateModalOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await LeaveEncashmentMasterService.apiCallAddUpdateLeaveEncashmentMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.LeaveEncashmentMasterSlabsId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as LeaveEncashmentMasterData

            setLeaveEncashmentMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Leave Encashment added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as LeaveEncashmentMasterData;

            setLeaveEncashmentMasterList(prevData =>
              prevData.map(item =>
                item.LeaveEncashmentMasterSlabsId === formData.LeaveEncashmentMasterSlabsId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingLeaveEncashmentMasterData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Operation failed' })
      },
      undefined,
      formData.LeaveEncashmentMasterSlabsId === 0 ? 'Add Leave Encashment' : 'Update Leave Encashment...'
    )
  }

  //#region DELETE Leave Encashment MASTER
  const handleDeleteLeaveEncashmentMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveEncashmentMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteLeaveEncashmentMasterRequest = {
          LeaveEncashmentMasterSlabsId: deleteLeaveEncashmentMasterDetailsData.LeaveEncashmentMasterSlabsId ?? 0,
          UniqueKey: deleteLeaveEncashmentMasterDetailsData.Uniquekey ?? ""
        }
        const response = await LeaveEncashmentMasterService.apiCallDeleteLeaveEncashmentMaster(params);

        if (E.isRight(response)) {
          setLeaveEncashmentMasterList(prevData => prevData.filter(item => item.LeaveEncashmentMasterSlabsId !== deleteLeaveEncashmentMasterDetailsData.LeaveEncashmentMasterSlabsId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteLeaveEncashmentMasterDetailsData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }
        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Delete Leave Encashment master data...'
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
          isShowAddButton={canAction}
          addTitle="Add LeaveEncashment"
          onAdd={handleAddLeaveEncashmentModal}
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

        {/*  ADD EDIT UPDATE LeaveEncashment MODAL */}
        <AddUpdateLeaveEncashmentModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingLeaveEncashmentMasterData(null)
          }}
          onSubmit={handleAddUpdateLeaveEncashmentMaster}
          data={editingLeaveEncashmentMasterData}
          loading={isLoading}
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

        {/* DELETE CONFIRMATION LeaveEncashment MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteLeaveEncashmentMasterDetailsData(null)
          }}
          onConfirm={handleDeleteLeaveEncashmentMaster}
          title="You are about to delete a Leave Encashment?"
          message="Deleting this Leave Encashment will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  )
}

export default LeaveEncashmentMaster


