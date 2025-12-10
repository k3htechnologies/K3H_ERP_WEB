import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  WeekOffMappingMasterData,
  FilterWithPaginationWeekOffMappingMasterRequest,
  AddUpdateWeekOffMappingMasterRequest,
  DeleteWeekOffMappingMasterRequest
} from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';

import { WeekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService'
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
import { fetchEmployeeMasterDropdown } from '@/features/employeeMaster/employeeMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { fetchDepartmentMasterDropdown } from '@/features/departmentMaster/departmentMasterDropdown';
import { fetchWeekOffMasterDropdown } from '../weekOffMasterDropDown';


const initialFormState = (): AddUpdateWeekOffMappingMasterRequest => ({
  WeekOffPolicyMasterMappingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  WeekOffPolicyMasterId: 0,
  DepartmentMasterId: "",
  EmployeeId: ""
});

export const WeekOffMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const {addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchWeekOffMappings(value)
  }, 350)

  //VIEW WEEKOFF MAPPING MASTER MODAL STATES
  const [viewWeekOffMappingMasterDetailsData, setViewWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT WEEKOFF MAPPING MASTER
  const [editingWeekOffMappingMasterData, setEditingWeekOffMappingMasterData] = useState<WeekOffMappingMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE WEEK OFF MAPPING MASTER
  const [formData, setFormData] = useState<AddUpdateWeekOffMappingMasterRequest>(() => initialFormState());

  //DELETE WEEKOFF MAPPING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteWeekOffMappingMasterDetailsData, setDeleteWeekOffMappingMasterDetailsData] = useState<WeekOffMappingMasterData | null>(null)

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeWeekOffMappingMasterColumnsModal, setIsShowCustomizeWeekOffMappingMasterColumnsModal] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    departmentName?: string;
    employeeName?: string;
    weekOffPolicyName?: string
  }>({});
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialWeekOffMappings = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialWeekOffMappings.current) return

    hasFetchedInitialWeekOffMappings.current = true;

    fetchWeekOffMappingList()
  }, [])

  //#region CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingWeekOffMappingMasterData) {
        setFormData({
          WeekOffPolicyMasterMappingId: editingWeekOffMappingMasterData.WeekOffPolicyMasterMappingId,
          Uniquekey: editingWeekOffMappingMasterData.Uniquekey || initialFormState().Uniquekey,
          WeekOffPolicyMasterId: editingWeekOffMappingMasterData.WeekOffPolicyMasterId || 0,
          DepartmentMasterId: editingWeekOffMappingMasterData.DepartmentMasterId || '',
          EmployeeId: editingWeekOffMappingMasterData.EmployeeId || '',
        });
        setDropdownLabels({
          departmentName: editingWeekOffMappingMasterData.DepartmentName || "",
          employeeName: editingWeekOffMappingMasterData.EmployeeName || "",
          weekOffPolicyName: editingWeekOffMappingMasterData.WeekOffPolicyName || ""
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingWeekOffMappingMasterData]);

  //#endregion


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchWeekOffMappingList = async (page: number = pagination.currentPage) => {
    return await loadWeekOffMappings(page, filters);
  }

  const loadWeekOffMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = weekOffMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          WeekOffPolicyMasterMappingId: filterParams.WeekOffPolicyMasterMappingId ? Number(filterParams.WeekOffPolicyMasterMappingId) : undefined,
          WeekOffPolicyName: filterParams.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filterParams.DepartmentName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getWeekOffMappings(params);

        if (E.isRight(response)) {

          setWeekOffMappingMasterList(response.right.Data);

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
      'Loading Week Off Mapping'
    )
  }
  //#endregion

  //#region SEARCH WEEK OFF MAPPING 
  const searchWeekOffMappings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchWeekOffMappingList();

      return
    }
    const filterParams: FilterInfo = {
      WeekOffPolicyName: searchValue.trim(),
    };

    await loadWeekOffMappings(1, filterParams)
  }
  //#endregion

  //#region CLEAR SERACH WEEK OFF MAPPING
  const clearsearchWeekOffMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchWeekOffMappingList();
  }
  //#endregion 

  //#region EXPORT EXCEL | PDF
  const handleExportWeekOffMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = weekOffMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationWeekOffMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          WeekOffPolicyName: filters.WeekOffPolicyName?.trim() || undefined,
          DepartmentName: filters.DepartmentName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getWeekOffMappings(params);

        handleExportFile(response, exportType, 'Week Off Mapping Master', addToast)

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

  const handleExportWeekOffMappingExcel = () => handleExportWeekOffMappings('Excel')
  const handleExportWeekOffMappingPdf = () => handleExportWeekOffMappings('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET WEEK OFF MAPPING
  const getWeekOffMappings = async (filterParams: FilterWithPaginationWeekOffMappingMasterRequest) => {

    return await WeekOffMappingMasterService.apiCallPullWeekOffMappingMaster(filterParams);
  }
  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchWeekOffMappingList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchWeekOffMappingList(1);
  }
  //#endregion

  //#region TABLE PAGINATION INFO

  const weekOffMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const weekOffMappingListForTable = useMemo(() => weekOffMappingMasterList, [weekOffMappingMasterList]);

  //#endregion

  //#region VIEW EDIT WEEKOFF MAPPING
  const handleViewWeekOffMappingDetails = useCallback((row: WeekOffMappingMasterData) => {
    setViewWeekOffMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  //#endregion

  //#region EDIT WEEK OFF MAPPING  MASTER

  const handleEditWeekOffMappingMaster = useCallback((row: WeekOffMappingMasterData) => {
    setEditingWeekOffMappingMasterData({
      ...row,
      WeekOffPolicyMasterId: row.WeekOffPolicyMasterId || 0,
      DepartmentMasterId: row.DepartmentMasterId || '',
      EmployeeId: row.EmployeeId || '',

    })
    setIsAddUpdateModalOpen(true);

  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: WeekOffMappingMasterData) => {
    setDeleteWeekOffMappingMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region TABLE COLUMN
  const weekOffMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'WeekOffPolicyName',
        label: 'Week Off Policy Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewWeekOffMappingDetails(row)}
            />

          </div>
        )
      },
      {
        key: 'DepartmentName',
        label: 'Department Name',
        width: '18',
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
        key: 'EmployeeName',
        label: 'Employee Name',
        width: '18',
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
        key: 'WeeklyOff',
        label: 'Weekly Off',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'WeeklyOff2',
        label: 'Weekly Off 2',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 'N/A'}
          </span>
        )
      },
    ],
    // dependencies: include everything used inside that might change
    [handleViewWeekOffMappingDetails]
  )
  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredWeekOffMappingMasterColumnKeys: string[] = ['WeekOffPolicyName'];

  const allWeekOffMappingMasterColumnKeys: string[] = weekOffMappingMasterColumns.map(c => c.key)

  const [selectedWeekOffMappingMasterColumnKeys, setSelectedWeekOffMappingMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getWeekOffMappingMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredWeekOffMappingMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allWeekOffMappingMasterColumnKeys.includes(k));

      }
    } catch { }
    return allWeekOffMappingMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedWeekOffMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredWeekOffMappingMasterColumnKeys])).filter(k => allWeekOffMappingMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekOffMappingMasterColumns.length])

  const visibleWeekOffMappingMasterColumns = useMemo(
    () => weekOffMappingMasterColumns.filter(col => selectedWeekOffMappingMasterColumnKeys.includes(col.key)),
    [weekOffMappingMasterColumns, selectedWeekOffMappingMasterColumnKeys]
  )

  //#endregion

  //#region VIEW WEEK OFF MAPPING DETAILS MODAL COMPONENT

  interface ViewWeekOffMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: WeekOffMappingMasterData | null
  }

  const ViewWeekOffMappingDetailsModal: React.FC<ViewWeekOffMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Week Off Mapping Details"
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

            <FieldItem label="Week Off Policy Name" value={data.WeekOffPolicyName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Week Off Policy Code" value={data.WeekOffPolicyCode} isRow withBorder={true} />
            <FieldItem label="Department Name" value={data.DepartmentName} isRow withBorder={true} />
            <FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />
            <FieldItem label="Week Days" value={data.WeekDays} isRow withBorder={true} />
            <FieldItem label="Week Days Starts On" value={data.WeekDaysStartsOn} isRow withBorder={true} />
            <FieldItem label="Weekly Off" value={data.WeeklyOff} isRow withBorder={true} />
            <FieldItem label="Weekly Off2" value={data.WeeklyOff2} isRow withBorder={true} />
            <FieldItem label="Weekly Off2 Type" value={data.WeeklyOff2Type} isRow withBorder={true} />
            <FieldItem label="Not Applicable For Months" value={data.NotApplicableForMonths} isRow withBorder={true} />

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
                      handleEditWeekOffMappingMaster(data)
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
    loadWeekOffMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  //#endregion

  //#region CLEAR FILTER

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadWeekOffMappings(1, {})
    setShowFilterPopup(false)
  }
  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD UPDATE WEEK OFF MAPPING MASTER

  const handleFieldChange = (field: keyof AddUpdateWeekOffMappingMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddWeekOffMappingMasterModal = () => {
    setEditingWeekOffMappingMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddWeekOffMappingMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (!formData.DepartmentMasterId) {
      newErrors.DepartmentMasterId = "Department Name is required.";
    }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }

    if (!formData.WeekOffPolicyMasterId) {
      newErrors.WeekOffPolicyMasterId = "Week Off Policy Name is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekWeekOffMappingFormData = (): AddUpdateWeekOffMappingMasterRequest => {
    return {
      WeekOffPolicyMasterMappingId: formData.WeekOffPolicyMasterMappingId,
      Uniquekey: formData.Uniquekey,
      WeekOffPolicyMasterId: formData.WeekOffPolicyMasterId,
      DepartmentMasterId: formData.DepartmentMasterId,
      EmployeeId: formData.EmployeeId
    };

  };

  const handleAddUpdateWeekOffMappingMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({});

    const validation = validateAddWeekOffMappingMasterForm();

    if (!validation.isValid) {

      setErrors(validation.errors);

      return;
    }

    await runApiWithLoader(
      setIsLoading,

      setIsLoadingMessage,
      async () => {

        const payload = PushWeekWeekOffMappingFormData();

        const response = await WeekOffMappingMasterService.apiCallAddUpdateWeekOffMappingMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.WeekOffPolicyMasterMappingId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as WeekOffMappingMasterData

            setWeekOffMappingMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Week Off Mapping added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as WeekOffMappingMasterData;

            setWeekOffMappingMasterList(prevData =>
              prevData.map(item =>
                item.WeekOffPolicyMasterMappingId === formData.WeekOffPolicyMasterMappingId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingWeekOffMappingMasterData(null);

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
      formData.WeekOffPolicyMasterMappingId === 0 ? 'Add Week Off Mapping' : 'Update Week Off Mapping...'
    )
  };

  //#endregion

  //#region DELETE WEEK OFF MAPPING MASTER

  const handleDeleteWeekOffMappingMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteWeekOffMappingMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteWeekOffMappingMasterRequest = {
          WeekOffPolicyMasterMappingId: deleteWeekOffMappingMasterDetailsData.WeekOffPolicyMasterMappingId,
          UniqueKey: deleteWeekOffMappingMasterDetailsData.Uniquekey || ""
        }
        const response = await WeekOffMappingMasterService.apiCallDeleteWeekOffMappingMaster(params);

        if (E.isRight(response)) {

          setWeekOffMappingMasterList(prevData => prevData.filter(item => item.WeekOffPolicyMasterMappingId !== deleteWeekOffMappingMasterDetailsData.WeekOffPolicyMasterMappingId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteWeekOffMappingMasterDetailsData(null);

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
      'Delete Week Off Mapping master data'
    )
  }
  //#endregion
  return (
    

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        {/* COMMAN LOADER FOR PAGE */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>

        {/* COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW */}

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Week Off Policy Name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchWeekOffMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle='Add Week Off'
          onAdd={handleAddWeekOffMappingMasterModal}

          // IMPORT
          isShowImportButton={false}

          // EXPORT 
          isShowExportButton={canExport}
          onExportExcel={handleExportWeekOffMappingExcel}
          onExportPdf={handleExportWeekOffMappingPdf}
          exportLoading={isLoading}
        />

        {/* DATA TABLE WEEK OFF MAPPING */}

        <DataTable
          data={weekOffMappingListForTable}
          columns={visibleWeekOffMappingMasterColumns}
          pagination={weekOffMappingMasterPaginationInfo}
          emptyMessage="No week off mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW WEEK OFF MAPPING MODAL */}

        <ViewWeekOffMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewWeekOffMappingMasterDetailsData(null)
          }}
          data={viewWeekOffMappingMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE WEEK OFF MAPPING MODAL */}

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMappingMasterData(null)
            setFormData(initialFormState());
            setErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingWeekOffMappingMasterData(null)
            setFormData(initialFormState());
          }}
          title={editingWeekOffMappingMasterData ? 'Update Week Off Mapping ' : 'Add Week Off Mapping'}
          onSubmit={handleAddUpdateWeekOffMappingMaster}
          saveText={editingWeekOffMappingMasterData ? 'Update Week Off Mapping' : 'Save Week Off Mapping'}
          resetText='Reset'
          loading={isLoading}
          size="xl"
        >
          <div className="space-y-6 p-6 bg-blue-100">
            <div className='space-y-4'>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Week Off Policy Name"
                  title="Select Week Off Policy Name "
                  size="lg"
                  required
                  dataFetchCallBack={fetchWeekOffMasterDropdown}
                  onSelected={(item) => handleFieldChange("WeekOffPolicyMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.WeekOffPolicyMasterId, dropdownLabels.weekOffPolicyName)}
                  error={errors.WeekOffPolicyMasterId}
                />
              </div>

              <SingleSelectDropdownWithPagination
                label="Employee"
                title="Select Employee"
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                onSelected={(item) => handleFieldChange("EmployeeId", item.value)}
                initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
                error={errors.EmployeeId}
              />
            </div>
            
            <div>
              <SingleSelectDropdownWithPagination
                label="Department"
                title="Select Department"
                size="lg"
                required
                dataFetchCallBack={fetchDepartmentMasterDropdown}
                onSelected={(item) => handleFieldChange("DepartmentMasterId", item.value)}
                initialValue={createDropdownInitialValue(formData.DepartmentMasterId, dropdownLabels.departmentName)}
                error={errors.DepartmentMasterId}
              />
            </div>
          </div>
        </Modal >

        {/* CUSTOMIZE COLUMNS MODAL */}

        < CustomizeColumnsModal
          isOpen={isShowCustomizeWeekOffMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeWeekOffMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredWeekOffMappingMasterColumnKeys]),
            )

            setSelectedWeekOffMappingMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeWeekOffMappingMasterTableColumns(
                JSON.stringify(withRequired)
              )
            } catch { }
          }}
          columns={weekOffMappingMasterColumns}
          selectedKeys={selectedWeekOffMappingMasterColumnKeys}
          requiredKeys={requiredWeekOffMappingMasterColumnKeys}
          title="Customize Week Off Mapping Master Table Columns"
        />

        {/* FILTER WEEK OFF MAPPING MODAL */}
        < Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Week Off Mapping Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          resetText=''
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Off Policy Name</label>
                <Input
                  type="text"
                  value={tempFilters.WeekOffPolicyName || ''}
                  onChange={(e) => handleFilterChange('WeekOffPolicyName', e.target.value)}
                  placeholder="Enter week off policy name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <Input
                  type="text"
                  value={tempFilters.DepartmentName || ''}
                  onChange={(e) => handleFilterChange('DepartmentName', e.target.value)}
                  placeholder="Enter department name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
            </div>
          </div>
        </Modal >

        {/* DELETE CONFIRMATION  WEEK OFF MAPPING MODAL */}
        < ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteWeekOffMappingMasterDetailsData(null)
          }}
          onConfirm={handleDeleteWeekOffMappingMaster}
          title="You are about to delete a  Week Off Mapping?"
          message="Deleting this  Week Off Mapping will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />

      </div>
  )
}

export default WeekOffMappingMaster


