import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateEarningMasterRequest,
  DeleteEarningMasterRequest,
  EarningMasterData,
  FilterWithPaginationEarningMasterRequest
} from '@/features/earningMaster/models/EarningMasterModel';

import { EarningMasterService } from '@/features/earningMaster/services/EarningMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit, Trash2 } from 'lucide-react';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { updateFilter } from '@/core/utils/filterHelper';
import { fetchBranchMasterDropdown } from '@/features/branchMaster/branchMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';

const initialFormState = (): AddUpdateEarningMasterRequest => ({
  EarningMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  Name: "",
  Type: "",
  Value: 0,
  BranchMasterId: 0
});

export const EarningMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [earningMasterList, setEarningMasterList] = useState<EarningMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()


  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchEarnings(value)
  }, 350)

  //VIEW BRANCH ASSOCIATIONS MASTER MODAL STATES
  const [viewEarningMasterDetailsData, setViewEarningMasterDetailsData] = useState<EarningMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT EARNING MASTER
  const [editingEarningMasterData, setEditingEarningMasterData] = useState<EarningMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);


  //ADD UPDATE DEPARTMENT MASTER
  const [formData, setFormData] = useState<AddUpdateEarningMasterRequest>(() => initialFormState());


  //DELETE EARNING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteEarningMasterDetailsData, setDeleteEarningMasterDetailsData] = useState<EarningMasterData | null>(null)


  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeEarningMasterColumnsModal, setIsShowCustomizeEarningMasterColumnsModal] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
  }>({});
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialEarnings = useRef(false)


  useEffect(() => {
    if (hasFetchedInitialEarnings.current) return
    hasFetchedInitialEarnings.current = true;
    fetchEarningList()
  }, [])

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])


  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingEarningMasterData) {
        setFormData({
          EarningMasterId: editingEarningMasterData.EarningMasterId,
          Uniquekey: editingEarningMasterData.Uniquekey || initialFormState().Uniquekey,
          Name: editingEarningMasterData.Name || '',
          Type: editingEarningMasterData.Type || '',
          Value: editingEarningMasterData.Value || 0,
          BranchMasterId: editingEarningMasterData.BranchMasterId || 0
        });

        setDropdownLabels({
          branchName: editingEarningMasterData.BranchName || ""
        });

      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingEarningMasterData]);

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchEarningList = async (page: number = pagination.currentPage) => {
    return await loadEarnings(page, filters);
  }

  const loadEarnings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined;

        if (sortInfo) {

          const column = earningMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationEarningMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EarningMasterId: filterParams.EarningMasterId ? Number(filterParams.EarningMasterId) : undefined,
          Name: filterParams.Name?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getEarnings(params);

        if (E.isRight(response)) {

          setEarningMasterList(response.right.Data);

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
      'Loading Earning'
    )
  }
  //#endregion

  //#region SEARCH ASSET MAPPING 
  const searchEarnings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchEarningList();

      return
    }

    const filterParams: FilterInfo = {
      Name: searchValue.trim(),
    };

    await loadEarnings(1, filterParams)
  }

  //#endregion

  //#region CLEAR EARNING MASTER 
  const clearsearchEarnings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchEarningList();
  }
  //#endregion 

  //#region EXPORT EXCEL | PDF
  const handleExportEarnings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        // Find the column label for sorting

        let sortByParam = undefined
        if (sortInfo) {
          const column = earningMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationEarningMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getEarnings(params);

        handleExportFile(response, exportType, 'Earning Master', addToast)

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

  const handleExportEarningExcel = () => handleExportEarnings('Excel')
  const handleExportEarningPdf = () => handleExportEarnings('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET EARNING MAPPING 
  const getEarnings = async (filterParams: FilterWithPaginationEarningMasterRequest) => {

    return await EarningMasterService.apiCallPullEarningMaster(filterParams);
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchEarningList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchEarningList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const earningMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const earningListForTable = useMemo(() => earningMasterList, [earningMasterList]);
  //#endregion

  //#region VIEW EDIT
  const handleViewEarningDetails = useCallback((row: EarningMasterData) => {
    setViewEarningMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
//#endregion
 
//#region EDIT EARNING MASTER

  const handleEditEarningMaster = useCallback((row: EarningMasterData) => {
    setEditingEarningMasterData({
      ...row,
      Name: row.Name || '',
      Type: row.Type || '',
      Value: row.Value || 0,
      BranchMasterId: row.BranchMasterId || 0
    })
    setIsAddUpdateModalOpen(true);

  }, [])


  //#endregion

  //#region CONFIRMATION DIALOG BOX


  const handleConfirmationDialogBoxOpen = useCallback((row: EarningMasterData) => {
    setDeleteEarningMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

  const earningMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Name',
        label: 'Earning Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewEarningDetails(row)}
            />

          </div>
        )
      },
      {
        key: 'Type',
        label: 'Type',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'Value',
        label: 'Value',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value || 0}
          </span>
        )
      },
      {
        key: 'BranchName',
        label: 'Branch Name',
        width: '20',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewEarningDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS
  const requiredEarningMasterColumnKeys: string[] = ['Name'];

  const allEarningMasterColumnKeys: string[] = earningMasterColumns.map(c => c.key)

  const [selectedEarningMasterColumnKeys, setSelectedEarningMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getEarningMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredEarningMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allEarningMasterColumnKeys.includes(k));
      }
    } catch { }
    return allEarningMasterColumnKeys
  })

  useEffect(() => {
    setSelectedEarningMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredEarningMasterColumnKeys])).filter(k => allEarningMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [earningMasterColumns.length])

  const visibleEarningMasterColumns = useMemo(
    () => earningMasterColumns.filter(col => selectedEarningMasterColumnKeys.includes(col.key)),
    [earningMasterColumns, selectedEarningMasterColumnKeys]
  )


  //#endregion

  //#region VIEW ASSET MAPPING DETAILS MODAL COMPONENT

  interface ViewEarningDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: EarningMasterData | null
  }

  const ViewEarningDetailsModal: React.FC<ViewEarningDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Earning Details"
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
            <FieldItem label="Earning Name" value={data.Name} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Type" value={data.Type} isRow withBorder={true} />
            <FieldItem label="Value" value={data.Value} isRow withBorder={true} />
            <FieldItem label="BranchName" value={data.BranchName} isRow withBorder={true} />
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
                      handleEditEarningMaster(data)
                    }}
                  >
                    <Edit className="h-5 w-5" />
                    Edit
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

      </Modal>
    )
  }

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadEarnings(1, tempFilters)
    setShowFilterPopup(false)
  }
  //#endregion

  //#region CLEAR FILTER 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadEarnings(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE EDIT EARNING MASTER

  const handleFieldChange = (field: keyof AddUpdateEarningMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddEarningModal = () => {
    setEditingEarningMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddEarningMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.Name.trim() === "") {

      newErrors.Name = "Name is required"
    }
    
    if (formData.Type.trim() === "") {
      newErrors.Type = "Type is required";
    }

    if (formData.Value === 0) {
      newErrors.Value = "Value is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushEarningMasterFormData = (): AddUpdateEarningMasterRequest => {
    return {
      EarningMasterId: formData.EarningMasterId,
      Uniquekey: formData.Uniquekey,
      Name: formData.Name,
      Type: formData.Type,
      Value: formData.Value,
      BranchMasterId: formData.BranchMasterId
    };

  };

  const handleAddUpdateEarningMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddEarningMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushEarningMasterFormData();

        const response = await EarningMasterService.apiCallAddUpdateEarningMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.EarningMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as EarningMasterData

            setEarningMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          } else {

            const updatedRecord = response.right.Data[0] as EarningMasterData;

            setEarningMasterList(prevData =>
              prevData.map(item =>
                item.EarningMasterId === formData.EarningMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingEarningMasterData(null);
        } else {

          addToast({ type: "error", title: response.left?.message });

        }
        return response;
      },
      undefined,
      (error: any) => {

        addToast({ type: 'error', title: error.message })
      },
      undefined,

      Number(formData.EarningMasterId) === 0 ? 'Add Earning' : 'Update Earning'
    )

  };

  //#endregion

  //#region DELETE EARNING MASTER
  const handleDeleteEarningMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteEarningMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteEarningMasterRequest = {
          EarningMasterId: deleteEarningMasterDetailsData.EarningMasterId ?? 0,
          UniqueKey: deleteEarningMasterDetailsData.Uniquekey ?? ""
        }
        const response = await EarningMasterService.apiCallDeleteEarningMaster(params);

        if (E.isRight(response)) {
          setEarningMasterList(prevData => prevData.filter(item => item.EarningMasterId !== deleteEarningMasterDetailsData.EarningMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteEarningMasterDetailsData(null);
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
      'Delete Earning master data...'
    )
  }
  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Earning Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchEarnings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeEarningMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle='Add Earning'
          onAdd={handleAddEarningModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportEarningExcel}
          onExportPdf={handleExportEarningPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={earningListForTable}
          columns={visibleEarningMasterColumns}
          pagination={earningMasterPaginationInfo}
          emptyMessage="No Earnings Data Found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewEarningDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewEarningMasterDetailsData(null)
          }}
          data={viewEarningMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE EARNING MASTER */}


        {/*  ADD EDIT UPDATE DEPARTMENT MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false);
            setEditingEarningMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false);
            setEditingEarningMasterData(null);
            setFormData(initialFormState());
            setErrors({});
          }}
          title={editingEarningMasterData ? 'Update Earning' : 'Add Earning'}
          onSubmit={handleAddUpdateEarningMaster}
          saveText={editingEarningMasterData ? 'Update Earning' : 'Save Earning'}
          resetText='Reset'
          loading={isLoading}
          size='xl'
        >
          <div className="space-y-10 p-6 bg-blue-100">
            <div className="space-y-4" >
              <div>
                <Input
                  type="text"
                  required
                  label='Earning Name'
                  value={formData.Name ?? ""}
                  onChange={(e) => handleFieldChange("Name", e.target.value)}
                  placeholder="Enter Earning Name"
                  maxLength={250}
                  error={errors.Name} />

              </div>

              <div>
                <Input
                  type="text"
                  label='Type'
                  value={formData.Type ?? ""}
                  onChange={(e) => handleFieldChange("Type", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Type"
                  error={errors.Type} />
              </div>
              <div>
                <Input
                  type="text"
                  label='Value'
                  value={formData.Value ?? ""}
                  onChange={(e) => handleFieldChange("Value", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Value"
                  error={errors.Value}
                />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch"
                  title="Select Branch"
                  size="lg"
                  dataFetchCallBack={fetchBranchMasterDropdown}
                  onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
                  error={errors.BranchMasterId}
                />

              </div>
            </div>
          </div>

        </Modal>

        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeColumnsModal
          isOpen={isShowCustomizeEarningMasterColumnsModal}
          onClose={() => setIsShowCustomizeEarningMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredEarningMasterColumnKeys]))
            setSelectedEarningMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeEarningMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={earningMasterColumns}
          selectedKeys={selectedEarningMasterColumnKeys}
          requiredKeys={requiredEarningMasterColumnKeys}
          title="Customize Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Earning Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Earning Name</label>
                <Input
                  type="text"
                  value={tempFilters.Name || ''}
                  onChange={(e) => handleFilterChange('Name', e.target.value)}
                  placeholder="Enter Earning Name"
                />
              </div>
            </div>
          </div>
        </Modal>
        {/* DELETE CONFIRMATION  EARNING MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteEarningMasterDetailsData(null)
          }}
          onConfirm={handleDeleteEarningMaster}
          title="You are about to delete a  Earning?"
          message="Deleting this  Earning will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />

      </div>
    </>
  )
}

export default EarningMaster


