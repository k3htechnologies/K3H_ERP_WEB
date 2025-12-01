import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateDeductionMasterRequest,
  DeductionMasterData,
  DeleteDeductionMasterRequest,
  FilterWithPaginationDeductionMasterRequest
} from '@/features/deductionMaster/models/DeductionMasterModel';
import {
  GENDER_OPTIONS,
} from "@/core/constants/staticData";
import { DeductionMasterService } from '@/features/deductionMaster/services/DeductionMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit, Trash2 } from 'lucide-react';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { BranchMasterService } from '@/features/branchMaster/services/BranchMasteService';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { useCountryStateCityDistrictVillageData } from '@/core/hooks/useCountryStateCityDistrictVillage';


export const DeductionMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [DeductionMasterList, setDeductionMasterList] = useState<DeductionMasterData[]>([]);
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
    searchDeductions(value)
  }, 350)

  //VIEW Deduction MASTER MODAL STATES
  const [viewDeductionMasterDetailsData, setViewDeductionMasterDetailsData] = useState<DeductionMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeDeductionMasterColumnsModal, setIsShowCustomizeDeductionMasterColumnsModal] = useState(false);

  // EDIT Deduction MASTER
  const [editingDeductionMasterData, setEditingDeductionMasterData] = useState<DeductionMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [DeductionMasterFormData, setDeductionMasterFormData] = useState<AddUpdateDeductionMasterRequest>({
    DeductionMasterId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    Name: "",
    Type: "",
    Value: 0,
    BranchMasterId: 0,
    BranchName: "",
    MinSalary: 0,
    MaxSalary: 0,
    Gender: "",
    StateName: "",
    StateMasterId: 0
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE Deduction MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteDeductionMasterDetailsData, setDeleteDeductionMasterDetailsData] = useState<DeductionMasterData | null>(null)

  //#endregion

 //#region COUNTRY STATE CITY DISTRICT 
  const {
    statesByCountryId,
  } = useCountryStateCityDistrictVillageData()

  const [selectedCountryId, setSelectedCountryId] = React.useState<number | null>(1)
  const [selectedStateId, setSelectedStateId] = React.useState<number | null>(null)

  const stateOptions =
    selectedCountryId != null
      ? (statesByCountryId[selectedCountryId] || []).map(s => ({
        label: s.name,
        value: s.id,
      }))
      : []
  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();

  //#region INITIALIZATION
  const hasFetchedInitialDeductions = useRef(false)

  useEffect(() => {

    if (hasFetchedInitialDeductions.current) return

    hasFetchedInitialDeductions.current = true;
    fetchDeductionList()
    setSelectedCountryId(1)
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchDeductionList = async (page: number = pagination.currentPage) => {
    return await loadDeductions(page, filters);
  }

  const loadDeductions = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = DeductionMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          DeductionMasterId: filterParams.DeductionMasterId ? Number(filterParams.DeductionMasterId) : undefined,
          Name: filterParams.Name?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getDeductions(params);

        if (E.isRight(response)) {

          setDeductionMasterList(response.right.Data);

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
      'Loading Deduction Data...'
    )
  }

  // SEARCH Deduction 
  const searchDeductions = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchDeductionList();

      return
    }

    const filterParams: FilterInfo = {
      Name: searchValue.trim(),
    };

    await loadDeductions(1, filterParams)

  }

  const clearsearchDeductions = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchDeductionList();
  }
  // END SEARCH Deduction 

  // EXPORT EXCEL | PDF
  const handleExportDeductions = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = DeductionMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationDeductionMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          Name: filters.Name?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getDeductions(params);

        handleExportFile(response, exportType, 'Deduction Master', addToast)

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

  const handleExportDeductionExcel = () => handleExportDeductions('Excel')
  const handleExportDeductionPdf = () => handleExportDeductions('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET Deduction 

  const getDeductions = async (filterParams: FilterWithPaginationDeductionMasterRequest) => {

    return await DeductionMasterService.apiCallPullDeductionMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET Deduction


  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchDeductionList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchDeductionList(1);

  }

  const DeductionMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const DeductionListForTable = useMemo(() => DeductionMasterList, [DeductionMasterList]);


  // STABLE HANDLER VIEW
  const handleViewDeductionDetails = useCallback((row: DeductionMasterData) => {
    setViewDeductionMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const handleConfirmationDialogBoxOpen = useCallback((row: DeductionMasterData) => {
    setDeleteDeductionMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  const DeductionMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Name',
        label: 'Deduction Name',
        width: '20',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className={`flex items-center ${canAction ? 'justify-between' : 'justify-start'}`}>
            <TooltipText
              text={value || 'N/A'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewDeductionDetails(row)}
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
        width: '12',
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
        key: 'MinSalary',
        label: 'Min Salary',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'
      },
      {
        key: 'MaxSalary',
        label: 'Max Salary',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? `₹${value.toLocaleString('en-IN')}` : 'N/A'
      },
      {
        key: 'Gender',
        label: 'Gender',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'StateName',
        label: 'State',
        width: '12',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="120px"
            tooltipThreshold={12}
          />
        )
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewDeductionDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredDeductionMasterColumnKeys: string[] = ['Name'];

  const allDeductionMasterColumnKeys: string[] = DeductionMasterColumns.map(c => c.key)

  const [selectedDeductionMasterColumnKeys, setSelectedDeductionMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getDeductionMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        const withRequired = Array.from(new Set([...parsed, ...requiredDeductionMasterColumnKeys]));
        return withRequired.filter(k => allDeductionMasterColumnKeys.includes(k));

      }
    } catch { }
    return allDeductionMasterColumnKeys
  })

  useEffect(() => {
    setSelectedDeductionMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredDeductionMasterColumnKeys])).filter(k => allDeductionMasterColumnKeys.includes(k)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DeductionMasterColumns.length])

  const visibleDeductionMasterColumns = useMemo(
    () => DeductionMasterColumns.filter(col => selectedDeductionMasterColumnKeys.includes(col.key)),
    [DeductionMasterColumns, selectedDeductionMasterColumnKeys]
  )

  //#endregion

  //#region VIEW Deduction DETAILS MODAL COMPONENT

  interface ViewDeductionDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: DeductionMasterData | null
  }

  const ViewDeductionDetailsModal: React.FC<ViewDeductionDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Deduction Details"
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

            <FieldItem label="Deduction Name" value={data.Name} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Type" value={data.Type} isRow withBorder={true} />
            <FieldItem label="Value" value={data.Value} isRow withBorder={true} />
            <FieldItem label="BranchName" value={data.BranchName} isRow withBorder={true} />
            <FieldItem label="MinSalary" value={data.MinSalary} isRow withBorder={true} />
            <FieldItem label="MaxSalary" value={data.MaxSalary} isRow withBorder={true} />
            <FieldItem label="Gender" value={data.Gender} isRow withBorder={true} />
            <FieldItem label="State Name" value={data.StateName} isRow withBorder={true} />

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
                      handleEditDeductionMasterData(data)
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
    loadDeductions(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadDeductions(1, {})
    setShowFilterPopup(false)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...tempFilters }
    if (value.trim()) {
      newFilters[key] = value.trim()
    } else {
      delete newFilters[key]
    }
    setTempFilters(newFilters)
  }
  //#endregion

  //#region ADD UPDATE EDIT Deduction MASTER

  const handleAddDeductionMaster = () => {
    setEditingDeductionMasterData(null);
    setDeductionMasterFormData({
      DeductionMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: "",
      Type: "",
      Value: 0,
      BranchMasterId: 0,
      BranchName: "",
      MinSalary: 0,
      MaxSalary: 0,
      Gender: "",
      StateName: "",
      StateMasterId: 0
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const handleEditDeductionMasterData = (row: DeductionMasterData) => {
    setEditingDeductionMasterData(row);
    setDeductionMasterFormData({
      DeductionMasterId: row.DeductionMasterId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: row.Name || "",
      Type: row.Type || "",
      Value: row.Value || 0,
      BranchMasterId: row.BranchMasterId || 0,
      BranchName: row.BranchName || "",
      MinSalary: row.MinSalary || 0,
      MaxSalary: row.MaxSalary || 0,
      Gender: row.Gender || "",
      StateName: row.StateName || "",
      StateMasterId: row.StateMasterId || 0
    });
    setDropdownLabels({
      branchName: row.BranchName ?? "",
      Gender: row.Gender ?? "",
      StateName: row.StateName ?? ""
    });
    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }


  const handleFieldChange = (field: keyof AddUpdateDeductionMasterRequest, value: string | number | null | boolean) => {
    setDeductionMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateDeductionMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!DeductionMasterFormData.Name) {
      newErrors.Name = "Deduction Name is required.";
    }

    if (!DeductionMasterFormData.Type) {
      newErrors.Type = "Type is required.";
    }

    if (!DeductionMasterFormData.Value) {
      newErrors.Value = "Value is required.";
    }

    if (!DeductionMasterFormData.Gender?.trim()) {
      newErrors.Gender = "Gender is required.";
    }
    if (!DeductionMasterFormData.StateMasterId) {
      newErrors.StateMasterId = "State Name is required.";
    }
    if (!DeductionMasterFormData.MinSalary) {
      newErrors.MinSalary = "Min Salary is required.";
    }
    if (!DeductionMasterFormData.MaxSalary) {
      newErrors.MaxSalary = "Max Salary is required.";
    }
    if (!DeductionMasterFormData.BranchMasterId) {
      newErrors.BranchMasterId = "Branch Name is required.";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushWeekDeductionFormData = (): AddUpdateDeductionMasterRequest => {
    return {
      DeductionMasterId: DeductionMasterFormData.DeductionMasterId || 0,
      Uniquekey: DeductionMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: DeductionMasterFormData.Name || "",
      Type: DeductionMasterFormData.Type || "",
      Value: DeductionMasterFormData.Value || 0,
      BranchMasterId: DeductionMasterFormData.BranchMasterId || 0,
      BranchName: DeductionMasterFormData.BranchName || "",
      MinSalary: DeductionMasterFormData.MinSalary || 0,
      MaxSalary: DeductionMasterFormData.MaxSalary || 0,
      Gender: DeductionMasterFormData.Gender || "",
      StateName: DeductionMasterFormData.StateName || "",
      StateMasterId: DeductionMasterFormData.StateMasterId || 0
    };
  };

  const fetchBranchOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await BranchMasterService.apiCallPullBranchMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      BranchName: params?.value || "",
      IsCheckPermission: true,
    });
    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };
    const apiResponse = responseEither.right;
    const branchList = apiResponse?.Data?.map((item: any) => ({ label: item.BranchName, value: String(item.BranchMasterId) })) || [];
    return { totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? branchList.length, itemList: branchList };
  };

  const toDropdownInitialValue = (
    id?: number | null,
    label?: string
  ): { label: string; value: string | number } | null => {
    if (!id) return null;
    return {
      label: label || String(id),
      value: String(id),
    };
  };

  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    Gender?: string;
    StateName?: string
  }>({});


  const handleAddUpdateDeductionMaster = async () => {

    setFormErrors({});

    const validation = validateDeductionMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushWeekDeductionFormData();
        const response = await DeductionMasterService.apiCallAddUpdateDeductionMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = DeductionMasterFormData.DeductionMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as DeductionMasterData

            setDeductionMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });

            addToast({ type: 'success', title: 'Deduction added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as DeductionMasterData;

            setDeductionMasterList(prevData =>
              prevData.map(item =>
                item.DeductionMasterId === DeductionMasterFormData.DeductionMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingDeductionMasterData(null);

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
      DeductionMasterFormData.DeductionMasterId === 0 ? 'Add Deduction' : 'Update Deduction...'
    )
  }
  //#region DELETE Deduction MASTER
  const handleDeleteDeductionMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);
    if (!deleteDeductionMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteDeductionMasterRequest = {
          DeductionMasterId: deleteDeductionMasterDetailsData.DeductionMasterId || 0,
          UniqueKey: deleteDeductionMasterDetailsData.Uniquekey || ""
        }
        const response = await DeductionMasterService.apiCallDeleteDeductionMaster(params);

        if (E.isRight(response)) {
          setDeductionMasterList(prevData => prevData.filter(item => item.DeductionMasterId! == deleteDeductionMasterDetailsData.DeductionMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteDeductionMasterDetailsData(null);
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
      'Delete Deduction Master Data...'
    )
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* ============================================================================
          COMMAN LOADER FOR PAGE
           ============================================================================ */}

        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        {/* ============================================================================
          COMBINED SEARCH BAR, FILTER IMPORT , EXPORT ROW
           ============================================================================ */}

        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Deduction Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchDeductions}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeDeductionMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Deduction"
          onAdd={handleAddDeductionMaster}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportDeductionExcel}
          onExportPdf={handleExportDeductionPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={DeductionListForTable}
          columns={visibleDeductionMasterColumns}
          pagination={DeductionMasterPaginationInfo}
          emptyMessage="No Deductions Data Found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewDeductionDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewDeductionMasterDetailsData(null)
          }}
          data={viewDeductionMasterDetailsData}
        />
        {/*  ADD EDIT UPDATE TNC MODAL */}
        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingDeductionMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingDeductionMasterData(null)
            setFormErrors({})
          }}
          title={editingDeductionMasterData ? 'Update Deduction Master Details' : 'Add Deduction Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateDeductionMaster()
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
                  label='Deduction Name'
                  value={DeductionMasterFormData.Name ?? ""}
                  onChange={(e) => handleFieldChange("Name", e.target.value)}
                  placeholder="Enter Deduction Name"
                  maxLength={250}
                  error={formErrors.Name}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Type'
                  value={DeductionMasterFormData.Type ?? ""}
                  onChange={(e) => handleFieldChange("Type", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Type"
                  error={formErrors.Type}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  label='Value'
                  value={DeductionMasterFormData.Value ?? ""}
                  onChange={(e) => handleFieldChange("Value", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Value"
                  error={formErrors.Value}
                />
              </div>
              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch"
                  title="Select..."
                  size="lg"
                  dataFetchCallBack={fetchBranchOptions}
                  onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                  initialValue={toDropdownInitialValue(DeductionMasterFormData.BranchMasterId, dropdownLabels.branchName)}
                  error={formErrors.BranchMasterId}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SinglePageSelection
                  label="Gender"
                  required
                  value={DeductionMasterFormData.Gender}
                  onChange={(value) => handleFieldChange("Gender", value)}
                  options={GENDER_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
                  error={formErrors.Gender}
                />
              </div>
              <div>
                <SinglePageSelection
                  label="State"
                  value={selectedStateId ?? ''} required
                  onChange={val => {
                    const id = Number(val)
                    setSelectedStateId(id)
                    handleFieldChange('StateMasterId', id)
                  }}
                  disabled={
                    stateOptions.length === 0}
                  options={stateOptions}
                  error={formErrors.StateMasterId}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  type="text"
                  required
                  label='Min Salary'
                  value={DeductionMasterFormData.MinSalary ?? ""}
                  onChange={(e) => handleFieldChange("MinSalary", e.target.value)}
                  placeholder="Enter Min Salary"
                  maxLength={250}
                  error={formErrors.MinSalary}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Max Salary'
                  value={DeductionMasterFormData.MaxSalary ?? ""}
                  onChange={(e) => handleFieldChange("MaxSalary", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Max Salary"
                  error={formErrors.MaxSalary}
                />
              </div>
            </div>
          </div>

        </Modal>

        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeColumnsModal
          isOpen={isShowCustomizeDeductionMasterColumnsModal}
          onClose={() => setIsShowCustomizeDeductionMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(new Set([...keys, ...requiredDeductionMasterColumnKeys]))
            setSelectedDeductionMasterColumnKeys(withRequired)
            try {
              LocalStorageHelper.storeDeductionMasterTableColumns(JSON.stringify(withRequired))
            } catch { }
          }}
          columns={DeductionMasterColumns}
          selectedKeys={selectedDeductionMasterColumnKeys}
          requiredKeys={requiredDeductionMasterColumnKeys}
          title="Customize Deduction Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Deduction Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deduction Name</label>
                <Input
                  type="text"
                  value={tempFilters.Name || ''}
                  onChange={(e) => handleFilterChange('Name', e.target.value)}
                  placeholder="Enter Deduction name"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION Deduction Master MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteDeductionMasterDetailsData(null)
          }}
          onConfirm={handleDeleteDeductionMaster}
          title="You are about to delete a Deduction?"
          message="Deleting this Deduction Master Data will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  );
};

export default DeductionMaster


