import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
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
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Button, Input } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';


const initialFormState = (): AddUpdateLeaveEncashmentMasterRequest => ({
  LeaveEncashmentMasterSlabsId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  MinSalary: 0,
  MaxSalary: 0,
  EncashmentRate: 0,
});

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
  const { addToast } = useToast()

  //VIEW LEAVE ENCASHMENT MASTER MODAL STATES
  const [viewLeaveEncashmentMasterDetailsData, setViewLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT LEAVE ENCASHMENT MASTER
  const [editingLeaveEncashmentMasterData, setEditingLeaveEncashmentMasterData] = useState<LeaveEncashmentMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE LEAVE ENCASHMENT MASTER
  const [formData, setFormData] = useState<AddUpdateLeaveEncashmentMasterRequest>(() => initialFormState());

  //DELETE LEAVE ENCASHMENT MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteLeaveEncashmentMasterDetailsData, setDeleteLeaveEncashmentMasterDetailsData] = useState<LeaveEncashmentMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeLeaveEncashmentMasterColumnsModal, setIsShowCustomizeLeaveEncashmentMasterColumnsModal] = useState(false);
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialLeaveEncashments = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialLeaveEncashments.current) return

    hasFetchedInitialLeaveEncashments.current = true;

    fetchLeaveEncashmentList()
  }, [])
  //#endregion

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingLeaveEncashmentMasterData) {
        setFormData({
          LeaveEncashmentMasterSlabsId: editingLeaveEncashmentMasterData.LeaveEncashmentMasterSlabsId,
          Uniquekey: editingLeaveEncashmentMasterData.Uniquekey || initialFormState().Uniquekey,
          MinSalary: editingLeaveEncashmentMasterData.MinSalary || 0,
          MaxSalary: editingLeaveEncashmentMasterData.MaxSalary || 0,
          EncashmentRate: editingLeaveEncashmentMasterData.EncashmentRate || 0,
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingLeaveEncashmentMasterData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchLeaveEncashmentList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadLeaveEncashments(page, sort);

  }

  const loadLeaveEncashments = async (page: number, sortInfo?: SortInfo) => {
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
      'Loading Leave Encashment'
    )
  }
  //#endregion

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
      'Preparing Export'
    )
  }

  const handleExportLeaveEncashmentExcel = () => handleExportLeaveEncashments('Excel')
  const handleExportLeaveEncashmentPdf = () => handleExportLeaveEncashments('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET LEAVE ENCASHMENT 
  const getLeaveEncashments = async (filterParams: FilterWithPaginationLeaveEncashmentMasterRequest) => {

    return await LeaveEncashmentMasterService.apiCallPullLeaveEncashmentMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = (page: number) => {
    fetchLeaveEncashmentList(page);
  };
  //#endregion


  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sortInfo);

    loadLeaveEncashments(1, sort);

  }, []);
  //#endregion

  //#region TABLE PAGINATION INFO
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
  //#endregion


  //#region VIEW EDIT LEAVE ENCASHMENT
  const handleViewLeaveEncashmentDetails = useCallback((row: LeaveEncashmentMasterData) => {
    setViewLeaveEncashmentMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT LEAVE ENCASHMENT  MASTER

  const handleEditLeaveEncashmentMasterData = useCallback((row: LeaveEncashmentMasterData) => {
    setEditingLeaveEncashmentMasterData({
      ...row,
      EncashmentRate: row.EncashmentRate || 0,
      MaxSalary: row.MaxSalary || 0,
      MinSalary: row.MinSalary || 0,

    })
    setIsAddUpdateModalOpen(true);

  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: LeaveEncashmentMasterData) => {
    setDeleteLeaveEncashmentMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMN
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
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedLeaveEncashmentMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredLeaveEncashmentMasterColumnKeys])).filter(k => allLeaveEncashmentMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [leaveEncashmentMasterColumns.length])

  const visibleLeaveEncashmentMasterColumns = useMemo(
    () => leaveEncashmentMasterColumns.filter(col => selectedLeaveEncashmentMasterColumnKeys.includes(col.key)),
    [leaveEncashmentMasterColumns, selectedLeaveEncashmentMasterColumnKeys]
  )
  //#endregion

  //#region VIEW LEAVE ENCASHMENT DETAILS MODAL COMPONENT

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
                  size='sm'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleConfirmationDialogBoxOpen(data)
                  }}
                >
                  Delete
                </Button>

                <Button
                  color='blue'
                  size='sm'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleEditLeaveEncashmentMasterData(data)
                  }}
                >
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

  //#region ADD UPDATE LEAVE ENCASHMENT MASTER

  const handleFieldChange = (field: keyof AddUpdateLeaveEncashmentMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  //#region HANDLE RESET FORM
  const handleResetForm = () => {
    setFormData(initialFormState());
    setErrors({});
  };
  //#endregion

  const handleAddLeaveEncashmentMasterModal = () => {
    setEditingLeaveEncashmentMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateLeaveEncashmentMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.EncashmentRate || Number(formData.EncashmentRate) <= 0) {
      newErrors.EncashmentRate = "Encashment Rate is required";
    }
    if (!formData.MinSalary || Number(formData.MinSalary) <= 0) {
      newErrors.MinSalary = "Min Salary required";
    }
    if (!formData.MaxSalary || Number(formData.MaxSalary) <= 0) {
      newErrors.MaxSalary = "Max Salary is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushLeaveEncashmentMasterFormData = (): AddUpdateLeaveEncashmentMasterRequest => {
    return {
      LeaveEncashmentMasterSlabsId: formData.LeaveEncashmentMasterSlabsId,
      Uniquekey: formData.Uniquekey,
      MinSalary: formData.MinSalary,
      MaxSalary: formData.MaxSalary,
      EncashmentRate: formData.EncashmentRate,
    };
  };

  const handleAddUpdateLeaveEncashmentMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateLeaveEncashmentMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

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
      formData.LeaveEncashmentMasterSlabsId === 0 ? 'Add Leave Encashment' : 'Update Leave Encashment'
    )
  };
  //#endregion 

  //#region DELETE LEAVE ENCASHMENT MASTER
  const handleDeleteLeaveEncashmentMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteLeaveEncashmentMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteLeaveEncashmentMasterRequest = {
          LeaveEncashmentMasterSlabsId: deleteLeaveEncashmentMasterDetailsData.LeaveEncashmentMasterSlabsId || 0,
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
      'Delete Leave Encashment'
    )
  }

  //#endregion
  return (


    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* COMMAN LOADER FOR PAGE */}

      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

      {/* COMBINED IMPORT , EXPORT ROW */}

      <div className="flex justify-end">
        <TableActionToolbar
          isShowSearchBar={false}
          isShowFilterButton={false}
          isShowCustomizeButton
          onCustomize={() =>
            setIsShowCustomizeLeaveEncashmentMasterColumnsModal(true)}

          isShowAddButton={canAction}
          addTitle="Add"
          onAdd={handleAddLeaveEncashmentMasterModal}

          isShowImportButton={false}

          isShowExportButton={canExport && leaveEncashmentListForTable.length > 0}
          onExportExcel={handleExportLeaveEncashmentExcel}
          onExportPdf={handleExportLeaveEncashmentPdf}
          exportLoading={isLoading}
        />
      </div>

      {/* DATA TABLE LEAVE ENCASHMENT */}

      <DataTable
        data={leaveEncashmentListForTable}
        columns={visibleLeaveEncashmentMasterColumns}
        pagination={leaveEncashmentMasterPaginationInfo}
        emptyMessage="No Leave Encashment Found"
        fixedHeight={true}
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      {/* VIEW LEAVE ENCASHMENT  MODAL */}

      <ViewLeaveEncashmentDetailsModal isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false)
          setViewLeaveEncashmentMasterDetailsData(null)
        }}
        data={viewLeaveEncashmentMasterDetailsData}
      />

      {/*  ADD EDIT UPDATE LEAVE ENCASHMENT MODAL */}

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false)
          setEditingLeaveEncashmentMasterData(null)
          setFormData(initialFormState());
          setErrors({})
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false)
          setEditingLeaveEncashmentMasterData(null)
          setFormData(initialFormState());
          setErrors({})
        }}
        title={editingLeaveEncashmentMasterData ? 'Update LeaveEncashment Master' : 'Add LeaveEncashment Master'}
        onSubmit={handleAddUpdateLeaveEncashmentMaster}
        saveText={editingLeaveEncashmentMasterData ? 'Update LeaveEncashment' : 'Save LeaveEncashment'}
        resetText='Reset'
        onreset={handleResetForm}
        loading={isLoading}
        size="xl"
      >
        <div className="space-y-6 p-6 bg-blue-100">
          <div className='space-y-4'>
            <div>

              <Input
                label='Encashment Rate'
                required
                error={errors.EncashmentRate}
                value={formData.EncashmentRate ?? ''}
                maxLength={4}
                onChange={(e) => handleFieldChange("EncashmentRate", e.target.value)}
                placeholder="Enter Encashment Rate"
              />
            </div>

            <div>
              <Input
                label='Min Salary'
                required
                error={errors.MinSalary}
                type="text"
                value={formData.MinSalary ?? ''}
                maxLength={10}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  handleFieldChange('MinSalary', digits === '' ? 0 : Number(digits));
                }}
                placeholder="Enter Min Salary"
              />
            </div>

            <div>
              <Input
                label='Max Salary'
                required
                error={errors.MaxSalary}
                type="text"
                value={formData.MaxSalary ?? ''}
                maxLength={10}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  handleFieldChange('MaxSalary', digits === '' ? 0 : Number(digits));
                }}
                placeholder="Enter MaxSalary"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* CUSTOMIZE COLUMNS MODAL */}

      <CustomizeColumnsModal
        isOpen={isShowCustomizeLeaveEncashmentMasterColumnsModal}
        onClose={() => setIsShowCustomizeLeaveEncashmentMasterColumnsModal(false)}
        onApply={(keys) => {
          const withRequired = Array.from(
            new Set([...keys, ...requiredLeaveEncashmentMasterColumnKeys])
          )

          setSelectedLeaveEncashmentMasterColumnKeys(withRequired)

          try {
            LocalStorageHelper.storeLeaveEncashmentMasterTableColumns(
              JSON.stringify(withRequired)
            )
          } catch { }
        }}
        columns={leaveEncashmentMasterColumns}
        selectedKeys={selectedLeaveEncashmentMasterColumnKeys}
        requiredKeys={requiredLeaveEncashmentMasterColumnKeys}
        title="Customize Leave Encashment Master Table Columns"
      />

      {/* DELETE CONFIRMATION LEAVE ENCASHMENT MODAL */}
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
  )
}

export default LeaveEncashmentMaster


