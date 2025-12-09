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
import { FieldItem } from '@/ui/components/forms/FieldItem';


export const LeaveEncashmentMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [leaveEncashmentMasterList, setLeaveEncashmentMasterList] = useState<LeaveEncashmentMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  //VIEW BRANCH MASTER MODAL STATES
  const [viewLeaveEncashmentMasterDetailsData, setViewLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);


  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveEncashmentMasterColumnsModal, setIsShowCustomizeLeaveEncashmentMasterColumnsModal] = useState(false);

  // EDIT BRANCH MASTER
  const [editingLeaveEncashmentMasterData, setEditingLeaveEncashmentMasterData] = useState<LeaveEncashmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  const [leaveEncashmentMasterFormData, setLeaveEncashmentMasterFormData] = useState<AddUpdateLeaveEncashmentMasterRequest>({
    LeaveEncashmentMasterSlabsId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    MinSalary: 0,
    MaxSalary: 0,
    EncashmentRate: 0,
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE LeaveEncashment MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteLeaveEncashmentMasterDetailsData, setDeleteLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();


  //#region INITIALIZATION
  const hasFetchedInitialLeaveEncashments = useRef(false)
  //#endregion


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

  //#region EXPORT EXCEL | PDF
  const handleExportLeaveEncashments = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
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

  //#endregion

  //#region API | SERVICES CALL TO GET BRANCH 


  const getLeaveEncashments = async (filterParams: FilterWithPaginationLeaveEncashmentMasterRequest) => {
    return await LeaveEncashmentMasterService.apiCallPullLeaveEncashmentMaster(filterParams);
  }

  //#endregion

  //#region TABLE CONFIGURATION

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

  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewLeaveEncashmentDetails = useCallback((row: LeaveEncashmentMasterData) => {
    setViewLeaveEncashmentMasterDetailsData(row)
    setIsViewModalOpen(true)
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
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div
            onClick={() => handleViewLeaveEncashmentDetails(row)}
            className="flex items-center cursor-pointer"
          >
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full 
                       text-xs font-medium bg-blue-100 text-blue-800">
              {value || 0}%
            </span>
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
        render: (value) => (
          <span className="text-sm font-medium">
            {value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'}
          </span>
        )
      },
      {
        key: 'MaxSalary',
        label: 'Max Salary',
        width: '20',
        sortable: true,
        fixed: 'left',
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
    // dependencies: include everything used inside that might change
    [handleViewLeaveEncashmentDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredLeaveEncashmentMasterColumnKeys: string[] = ['MinSalary'];

  const allLeaveEncashmentMasterColumnKeys: string[] = leaveEncashmentMasterColumns.map(c => c.key)

  const [selectedLeaveEncashmentMasterColumnKeys, setSelectedLeaveEncashmentMasterColumnKeys] = useState<string[]>(() => {

    try {
      const saved = LocalStorageHelper.getLeaveEncashmentMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredLeaveEncashmentMasterColumnKeys]));

        // Filter out any keys that no longer exist
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

  //#endregion

  //#region VIEW BRANCH DETAILS MODAL COMPONENT

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
        title="Leave Encashment Details"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
        size='xl'
      >
        <div className="space-y-6">

          <div className="space-y-4">

            <FieldItem label="Encashment Rate" value={data.EncashmentRate} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="MinSalary" value={data.MinSalary} isRow withBorder={true} />
            <FieldItem label="MaxSalary" value={data.MaxSalary} isRow withBorder={true} />

          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold pb-2">
              Action Details
            </h4>

            <FieldItem label="Created By / Date" isRow={true} value={data.CreatedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={data.ModifiedBy !== '' ? true : false} />

            {data.ModifiedBy !== '' ?
              <FieldItem label="Modified By / Date" isRow={true} value={data.ModifiedBy + ' - ' + formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />

              :
              ''}
          </div>
          <div className="flex justify-between items-center pt-4">

            {canAction && (
              <>
                <Button
                  color='gray'
                  variant='solid'
                  colorMode="light"
                  size='md'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleConfirmationDialogBoxOpen(data)
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                  Delete
                </Button>

                <Button
                  color='blue'
                  size='md'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleEditLeaveEncashmentMasterData(data)
                  }}
                >
                  <Edit className="h-5 w-5" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    );
  };

  //#endregion

  // ADD UPDATE Leave Encashment Master
  const handleAddLeaveEncashmentModal = () => {
    setEditingLeaveEncashmentMasterData(null);
    setLeaveEncashmentMasterFormData({
      LeaveEncashmentMasterSlabsId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      MinSalary: 0,
      MaxSalary: 0,
      EncashmentRate: 0,
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const handleEditLeaveEncashmentMasterData = (row: LeaveEncashmentMasterData) => {
    setEditingLeaveEncashmentMasterData(row);
    setLeaveEncashmentMasterFormData({
      LeaveEncashmentMasterSlabsId: row.LeaveEncashmentMasterSlabsId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      MinSalary: row.MinSalary || 0,
      MaxSalary: row.MaxSalary || 0,
      EncashmentRate: row.EncashmentRate || 0,
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const handleFieldChange = (field: keyof AddUpdateLeaveEncashmentMasterRequest, value: string | number | null | boolean) => {
    setLeaveEncashmentMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateLeaveEncashmentMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!leaveEncashmentMasterFormData.EncashmentRate) {
      newErrors.EncashmentRate = "Encashment Rate is required.";
    }

    if (!leaveEncashmentMasterFormData.MinSalary) {
      newErrors.MinSalary = "Min Salary is required.";
    }

    if (!leaveEncashmentMasterFormData.MaxSalary) {
      newErrors.MaxSalary = "Max Salary is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushLeaveEncashmentMasterFormData = (): AddUpdateLeaveEncashmentMasterRequest => {
    return {
      LeaveEncashmentMasterSlabsId: leaveEncashmentMasterFormData.LeaveEncashmentMasterSlabsId || 0,
      Uniquekey: leaveEncashmentMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      MinSalary: leaveEncashmentMasterFormData.MinSalary || 0,
      MaxSalary: leaveEncashmentMasterFormData.MaxSalary || 0,
      EncashmentRate: leaveEncashmentMasterFormData.EncashmentRate || 0,
    };
  };

  const handleAddUpdateLeaveEncashmentMaster = async () => {


    setFormErrors({});

    const validation = validateLeaveEncashmentMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushLeaveEncashmentMasterFormData();
        const response = await LeaveEncashmentMasterService.apiCallAddUpdateLeaveEncashmentMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = leaveEncashmentMasterFormData.LeaveEncashmentMasterSlabsId === 0

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
                item.LeaveEncashmentMasterSlabsId === leaveEncashmentMasterFormData.LeaveEncashmentMasterSlabsId
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
      leaveEncashmentMasterFormData.LeaveEncashmentMasterSlabsId === 0 ? 'Add Leave Encashment' : 'Update Leave Encashment...'
    )
  }
  //#endregion 

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
          UniqueKey: deleteLeaveEncashmentMasterDetailsData.Uniquekey || ""
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

  //#endregion
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
          emptyMessage="No leave encashment found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
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
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingLeaveEncashmentMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingLeaveEncashmentMasterData(null)
            setFormErrors({})
          }}
          title={editingLeaveEncashmentMasterData ? 'Update LeaveEncashment Master Details' : 'Add Branch Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateLeaveEncashmentMaster()
          }}
          saveText="Save"
          cancelText="Cancel"
          loading={isLoading}
          size="large75"
        >
          <div className="space-y-6 p-6 bg-blue-50">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Encashment Rate'
                  value={leaveEncashmentMasterFormData.EncashmentRate ?? ""}
                  onChange={(e) => handleFieldChange("EncashmentRate", e.target.value)}
                  placeholder="Enter Encashment Rate"
                  maxLength={250}
                  error={formErrors.EncashmentRate}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Min Salary'
                  value={leaveEncashmentMasterFormData.MinSalary ?? ""}
                  onChange={(e) => handleFieldChange("MinSalary", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Min Salary"
                  error={formErrors.MinSalary}
                />

              </div>
            </div>

            <div >
              <div>
                <Input
                  type="text"
                  label='MaxSalary'
                  value={leaveEncashmentMasterFormData.MaxSalary ?? ""}
                  onChange={(e) => handleFieldChange("MaxSalary", e.target.value)}
                  required
                  placeholder="Enter MaxSalary"
                  maxLength={250}
                  error={formErrors.MaxSalary}
                />
              </div>
            </div>

          </div>
        </Modal>

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


