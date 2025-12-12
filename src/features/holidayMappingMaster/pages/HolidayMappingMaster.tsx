import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  HolidayMappingMasterData,
  FilterWithPaginationHolidayMappingMasterRequest,
  DeleteHolidayMappingMasterRequest,
  AddUpdateHolidayMappingMasterRequest
} from '@/features/holidayMappingMaster/models/HolidayMappingMasterModel';

import { HolidayMappingMasterService } from '@/features/holidayMappingMaster/services/HolidayMappingMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
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
import { fetchHolidayMasterDropdown } from '../HolidayMasterDropDown';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';

const initialFormState = (): AddUpdateHolidayMappingMasterRequest => ({
  HolidayMappingMasterId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  HolidayMasterId: 0,
  BranchMasterId: "",
  HolidayDate: ""
});

export const HolidayMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [holidayMappingMasterList, setHolidayMappingMasterList] = useState<HolidayMappingMasterData[]>([]);
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
    searchHolidayMappings(value)
  }, 350)

  //VIEW WEEKOFF MAPPING MASTER MODAL STATES
  const [viewHolidayMappingMasterDetailsData, setViewHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT HOLIDAY MAPPING MASTER STATES
  const [editingHolidayMappingMasterData, setEditingHolidayMappingMasterData] = useState<HolidayMappingMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE HOLIDAY MAPPING MASTER
  const [formData, setFormData] = useState<AddUpdateHolidayMappingMasterRequest>(() => initialFormState());

  //DELETE  HOLIDAY MAPPING MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteHolidayMappingMasterDetailsData, setDeleteHolidayMappingMasterDetailsData] = useState<HolidayMappingMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeHolidayMappingMasterColumnsModal, setIsShowCustomizeHolidayMappingMasterColumnsModal] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    holidayName?: string;
  }>({});
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialHolidayMappings = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialHolidayMappings.current) return

    hasFetchedInitialHolidayMappings.current = true;

    fetchHolidayMappingList()
  }, [])

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingHolidayMappingMasterData) {
        setFormData({
          HolidayMappingMasterId: editingHolidayMappingMasterData.HolidayMappingMasterId,
          Uniquekey: editingHolidayMappingMasterData.Uniquekey || initialFormState().Uniquekey,
          HolidayMasterId: editingHolidayMappingMasterData.HolidayMasterId || 0,
          BranchMasterId: editingHolidayMappingMasterData.BranchMasterId || '',
          HolidayDate: editingHolidayMappingMasterData.HolidayDate || '',
        });
        setDropdownLabels({
          branchName: editingHolidayMappingMasterData.BranchName || "",
          holidayName: editingHolidayMappingMasterData.HolidayName || "",
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingHolidayMappingMasterData]);
  //#endregion


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 
  const fetchHolidayMappingList = async (page: number = pagination.currentPage) => {
    return await loadHolidayMappings(page, filters);
  }

  const loadHolidayMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = holidayMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          HolidayMappingMasterId: filterParams.HolidayMappingMasterId ? Number(filterParams.HolidayMappingMasterId) : undefined,
          BranchName: filterParams.BranchName?.trim() || undefined,
          HolidayName: filterParams.HolidayName?.trim() || undefined,
          FromHolidayDate: filterParams.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filterParams.ToHolidayDate?.trim() || undefined,
          SortBy: sortByParam
        }
        const response = await getHolidayMappings(params);

        if (E.isRight(response)) {

          setHolidayMappingMasterList(response.right.Data);

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
      'Loading Holiday Mapping Data'
    )
  }
  //#endregion

  //#region SEARCH WEEK OFF MAPPING 
  const searchHolidayMappings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchHolidayMappingList();

      return
    }
    const filterParams: FilterInfo = {
      HolidayName: searchValue.trim(),
    };
    await loadHolidayMappings(1, filterParams)
  }
  //#endregion

  //#region CLEAR SERACH HOLIDAY MAPPING
  const clearsearchHolidayMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchHolidayMappingList();
  }
  //#endregion 

  //#region EXPORT EXCEL | PDF
  const handleExportHolidayMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = holidayMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationHolidayMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          BranchName: filters.BranchName?.trim() || undefined,
          HolidayName: filters.HolidayName?.trim() || undefined,
          FromHolidayDate: filters.FromHolidayDate?.trim() || undefined,
          ToHolidayDate: filters.ToHolidayDate?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getHolidayMappings(params);

        handleExportFile(response, exportType, 'Holiday Mapping Master', addToast)

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

  const handleExportHolidayMappingExcel = () => handleExportHolidayMappings('Excel')
  const handleExportHolidayMappingPdf = () => handleExportHolidayMappings('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET HOLIDAY MAPPING
  const getHolidayMappings = async (filterParams: FilterWithPaginationHolidayMappingMasterRequest) => {

    return await HolidayMappingMasterService.apiCallPullHolidayMappingMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchHolidayMappingList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchHolidayMappingList(1);
  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const holidayMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const holidayMappingListForTable = useMemo(() => holidayMappingMasterList, [holidayMappingMasterList]);

  //#endregion

  //#region VIEW EDIT
  const handleViewHolidayMappingDetails = useCallback((row: HolidayMappingMasterData) => {
    setViewHolidayMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT HOLIDAY MAPPING  MASTER
  const handleEditHolidayMappingMaster = useCallback((row: HolidayMappingMasterData) => {
    setEditingHolidayMappingMasterData({
      ...row,
      HolidayMasterId: row.HolidayMasterId || 0,
      BranchMasterId: row.BranchMasterId || '',
    })
    setIsAddUpdateModalOpen(true);

  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: HolidayMappingMasterData) => {
    setDeleteHolidayMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMN
  const holidayMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'HolidayName',
        label: 'Holiday Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewHolidayMappingDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'BranchName',
        label: 'Branch Name',
        width: '20',
        sortable: true,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: 'HolidayDate',
        label: 'Holiday Date',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
    ],
    // dependencies: include everything used inside that might change
    [handleViewHolidayMappingDetails]
  )
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredHolidayMappingMasterColumnKeys: string[] = ['HolidayName'];

  const allHolidayMappingMasterColumnKeys: string[] = holidayMappingMasterColumns.map(c => c.key)

  const [selectedHolidayMappingMasterColumnKeys, setSelectedHolidayMappingMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getHolidayMappingMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(
          new Set([...parsed, ...requiredHolidayMappingMasterColumnKeys])
        );
        // Filter out any keys that no longer exist

        return withRequired.filter(k => allHolidayMappingMasterColumnKeys.includes(k));
      }
    } catch { }
    return allHolidayMappingMasterColumnKeys
  })

  useEffect(() => {

    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedHolidayMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredHolidayMappingMasterColumnKeys])).filter(k => allHolidayMappingMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holidayMappingMasterColumns.length])

  const visibleHolidayMappingMasterColumns = useMemo(
    () => holidayMappingMasterColumns.filter(col => selectedHolidayMappingMasterColumnKeys.includes(col.key)),
    [holidayMappingMasterColumns, selectedHolidayMappingMasterColumnKeys]
  )

  //#endregion

  //#region VIEW HOLIDAY MAPPING DETAILS MODAL COMPONENT

  interface ViewHolidayMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: HolidayMappingMasterData | null
  }

  const ViewHolidayMappingDetailsModal: React.FC<ViewHolidayMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Holiday Mapping Details"
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

            <FieldItem label="Holiday Name" value={data.HolidayName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Branch Name" value={data.BranchName} isRow withBorder={true} />
            <FieldItem label="Assigned Date" value={data.HolidayDate ? formatDate_dd_MonthName_yy(data.HolidayDate) : ""} isRow />
            
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
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </Button>

                  <Button
                    color='blue'
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleEditHolidayMappingMaster(data)
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
    loadHolidayMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadHolidayMappings(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE HOLIDAY MAPPING MASTER

  const handleFieldChange = (field: keyof AddUpdateHolidayMappingMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddHolidayMappingMasterModal = () => {
    setEditingHolidayMappingMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddHolidayMappingMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.HolidayMasterId) {
      newErrors.HolidayMasterId = "Holiday Name is required.";
    }

    if (!formData.BranchMasterId) {
      newErrors.BranchMasterId = "Branch Name is required.";
    }

    if (!formData.HolidayDate) {
      newErrors.HolidayDate = " Holiday Date is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekHolidayMappingFormData = (): AddUpdateHolidayMappingMasterRequest => {
    return {
      HolidayMappingMasterId: formData.HolidayMappingMasterId,
      Uniquekey: formData.Uniquekey,
      HolidayMasterId: formData.HolidayMasterId,
      BranchMasterId: formData.BranchMasterId,
      HolidayDate: formData.HolidayDate
    };
  };

  const handleAddUpdateHolidayMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddHolidayMappingMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }
    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushWeekHolidayMappingFormData();

        const response = await HolidayMappingMasterService.apiCallAddUpdateHolidayMappingMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.HolidayMappingMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as HolidayMappingMasterData

            setHolidayMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Holiday Mapping added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as HolidayMappingMasterData;

            setHolidayMappingMasterList(prevData =>
              prevData.map(item =>
                item.HolidayMappingMasterId === formData.HolidayMappingMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingHolidayMappingMasterData(null);

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
      formData.HolidayMappingMasterId === 0 ? 'Add Holiday Mapping' : 'Update Holiday Mapping...'
    )
  }
  //#endregion

  //#region DELETE Holiday Mapping MASTER
  const handleDeleteHolidayMappingMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteHolidayMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteHolidayMappingMasterRequest = {
          HolidayMappingMasterId: deleteHolidayMappingMasterDetailsData.HolidayMappingMasterId ?? 0,
          UniqueKey: deleteHolidayMappingMasterDetailsData.Uniquekey ?? ""
        }
        const response = await HolidayMappingMasterService.apiCallDeleteHolidayMappingMaster(params);

        if (E.isRight(response)) {

          setHolidayMappingMasterList(prevData => prevData.filter(item => item.HolidayMappingMasterId !== deleteHolidayMappingMasterDetailsData.HolidayMappingMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteHolidayMappingMasterDetailsData(null);
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
      'Delete Holiday Mapping Master data'
    )
  }
  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* COMMAN LOADER FOR PAGE */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        {/* COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW */}

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Holiday Name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchHolidayMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle="Add Holiday Mapping"
          onAdd={handleAddHolidayMappingMasterModal}

          // IMPORT
          isShowImportButton={false}

          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportHolidayMappingExcel}
          onExportPdf={handleExportHolidayMappingPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE BRANCH */}

        <DataTable
          data={holidayMappingListForTable}
          columns={visibleHolidayMappingMasterColumns}
          pagination={holidayMappingMasterPaginationInfo}
          emptyMessage="No Holiday Mappings Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW WEEK OFF MAPPING MODAL */}

        <ViewHolidayMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewHolidayMappingMasterDetailsData(null)
          }}
          data={viewHolidayMappingMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE WEEK OFF MAPPING MODAL */}

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingHolidayMappingMasterData(null)
            setFormData(initialFormState());
            setErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingHolidayMappingMasterData(null)
            setFormData(initialFormState());
          }}
          title={editingHolidayMappingMasterData ? 'Update Holiday Mapping ' : 'Add Holiday Mapping'}
          onSubmit={handleAddUpdateHolidayMappingMaster}
          saveText={editingHolidayMappingMasterData ? 'Update Holiday Mapping' : 'Save Holiday Mapping'}
          resetText='Reset'
          loading={isLoading}
          size="xl"
        >
          <div className="space-y-6">

            <div className='space-y-4'>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Holiday"
                  title="Select Holiday"
                  size="lg"
                  required
                  dataFetchCallBack={fetchHolidayMasterDropdown}
                  onSelected={(item) => handleFieldChange("HolidayMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.HolidayMasterId, dropdownLabels.holidayName)}
                  error={errors.HolidayMasterId}
                />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch"
                  title="Select Branch "
                  size="lg"
                  required
                  dataFetchCallBack={fetchBranchMasterDropdown}
                  onSelected={(item) => handleFieldChange("BranchMasterId", String(item.value))}
                  initialValue={createDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
                  error={errors.BranchMasterId}

                />
              </div>
            </div>

            <div>
              <DatePickerInput
                label="Holiday Date"
                value={formatDate_dd_mm_yyyy(formData.HolidayDate)}
                onChange={(val) => handleFieldChange('HolidayDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                required
                error={errors.HolidayDate}
              />
            </div>
          </div>
        </Modal>


        {/* CUSTOMIZE COLUMNS MODAL */}

        <CustomizeColumnsModal
          isOpen={isShowCustomizeHolidayMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeHolidayMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredHolidayMappingMasterColumnKeys])
            )
            setSelectedHolidayMappingMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeHolidayMappingMasterTableColumns(
                JSON.stringify(withRequired)
              )
            } catch { }
          }}
          columns={holidayMappingMasterColumns}
          selectedKeys={selectedHolidayMappingMasterColumnKeys}
          requiredKeys={requiredHolidayMappingMasterColumnKeys}
          title="Customize Master Table Columns"
        />

        {/* FILTER BRANCH MODAL */}

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Holiday Mapping Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Holiday Name</label>
                <Input
                  type="text"
                  value={tempFilters.HolidayName || ''}
                  onChange={(e) => handleFilterChange('HolidayName', e.target.value)}
                  placeholder="Enter holiday name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                <Input
                  type="text"
                  value={tempFilters.BranchName || ''}
                  onChange={(e) => handleFilterChange('BranchName', e.target.value)}
                  placeholder="Enter branch name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION Holiday Mapping MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteHolidayMappingMasterDetailsData(null)
          }}
          onConfirm={handleDeleteHolidayMappingMaster}
          title="You are about to delete a Holiday Mapping?"
          message="Deleting this Holiday Mapping Data will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  )
}

export default HolidayMappingMaster


