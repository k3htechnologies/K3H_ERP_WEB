import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import type { SortInfo, TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateBranchAssociationsMasterRequest,
  BranchAssociationsMasterData,
  DeleteBranchAssociationsRequest,
  FilterWithPaginationBranchAssociationsMasterRequest
} from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import { branchAssociationsService } from '@/features/branchAssociationsMaster/services/BranchAssociationsMasterService';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { handleExportFile } from '@/core/utils/exportFile';
import { getInitialFormState, getBranchAssociationsMasterColumns } from '@/features/branchAssociationsMaster/constants/branchAssociationsMasterConstants';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { fetchEmployeeMasterById } from '@/features/employeeMaster/employeeMasterDropDown';

export const useBranchAssociationsMaster = () => {
  //#region STATE MANAGEMENT
  const [branchAssociationsMasterList, setBranchAssociationsMasterList] = useState<BranchAssociationsMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();
  const { addToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBranchAssociations(value)
  }, 350)
  const [viewBranchAssociationsMasterDetailsData, setViewBranchAssociationsMasterDetailsData] = useState<BranchAssociationsMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT BRANCH ASSOCIATION  MASTER
  const [editingBranchAssociationMasterData, setEditingBranchAssociationMasterData] = useState<BranchAssociationsMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE BRANCH ASSOCIATION MASTER
  const [formData, setFormData] = useState<AddUpdateBranchAssociationsMasterRequest>(() => getInitialFormState());

  //DELETE BRANCH ASSOCIATIONS MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteBranchAssociationsData, setDeleteBranchAssociationsData] = useState<BranchAssociationsMasterData | null>(null)

//SET UP EMPLOYEE DETAILS STATES
  const [departmentName, setDepartmentName] = useState("");
  const [designationName, setDesignationName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [reportingPersonName, setReportingPersonName] = useState("");
  const [emailId, setEmailId] = useState("");
  const [personalMobileNumber, setPersonalMobileNumber] = useState("");

  //DROPDOWN STATES
  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    employeeName?: string;
  }>({});
  const [dropdownResetKey, setDropdownResetKey] = useState(0);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION

  const hasFetchedInitialBranchAssociations = useRef(false)

  useEffect(() => {
    if (hasFetchedInitialBranchAssociations.current) return
    hasFetchedInitialBranchAssociations.current = true;
    fetchBranchAssociationsList()
  }, [])

  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingBranchAssociationMasterData) {
        setFormData({
          BranchAssociationsId: editingBranchAssociationMasterData.BranchAssociationsId,
          Uniquekey: editingBranchAssociationMasterData.Uniquekey || getInitialFormState().Uniquekey,
          BranchMasterId: editingBranchAssociationMasterData.BranchMasterId || '',
          EmployeeId: editingBranchAssociationMasterData.EmployeeId || 0
        });

        setDropdownLabels({
          branchName: editingBranchAssociationMasterData.BranchName || "",
          employeeName: editingBranchAssociationMasterData.EmployeeName || ""
        });
      } else {
        setFormData(getInitialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingBranchAssociationMasterData]);

  useEffect(() => {
    let mounted = true;

    const loadEmployeeDetails = async () => {
      if (!formData.EmployeeId) {
        setDepartmentName("");
        setDesignationName("");
        setBranchName("");
        setReportingPersonName("");
        setEmailId("");
        setPersonalMobileNumber("");
        return;
      }

      const employee = await fetchEmployeeMasterById(formData.EmployeeId);

      if (!employee || !mounted) return;

      setDepartmentName(employee.Department ?? "");
      setDesignationName(employee.Designation ?? "");
      setBranchName(employee.Branch ?? "");
      setReportingPersonName(employee.ReportPersonName ?? "");
      setEmailId(employee.EmailId ?? "");
      setPersonalMobileNumber(employee.PersonalMobileNumber ?? "");
    };

    loadEmployeeDetails();

    return () => {
      mounted = false;
    };
  }, [formData.EmployeeId]);


  //#endregion

  //#region TABLE COLUMN DEFINITION

  const branchAssociationsMasterColumns = useMemo<TableColumn[]>(
    () => getBranchAssociationsMasterColumns(),
    []
  )
  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchBranchAssociationsList = async (page: number = pagination.currentPage) => {
    return await loadBranchAssociations(page);
  }

  const loadBranchAssociations = async (page: number, sortInfo?: SortInfo, searchValue?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBranchAssociationsMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          EmployeeName: searchValue || undefined,
          SortBy: getSortByParam(sortInfo ?? null, branchAssociationsMasterColumns)
        }

        const response = await branchAssociationsService.apiCallPullBranchAssociations(params);

        if (E.isRight(response)) {
          setBranchAssociationsMasterList(response.right.Data);
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
      'Loading Branch Associations.'
    )
  }
  //#endregion

  //#region SEARCH BRANCH ASSOCIATIONS 
  const searchBranchAssociations = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchBranchAssociationsList();
      return
    }
    await loadBranchAssociations(1, sortInfo, searchValue)
  }
  //#endregion

  //#region CLEAR SEARCH BRANCH ASSOCIATIONS 
  const clearsearchBranchAssociations = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBranchAssociationsList();
  }
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportBranchAssociations = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationBranchAssociationsMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          SortBy: getSortByParam(sortInfo ?? null, branchAssociationsMasterColumns),
          ExportType: exportType
        }

        const response = await branchAssociationsService.apiCallPullBranchAssociations(params);
        handleExportFile(response, exportType, 'Branch Associations Master', addToast)
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

  const handleExportBranchAssociationsExcel = () => handleExportBranchAssociations('Excel')
  const handleExportBranchAssociationsPdf = () => handleExportBranchAssociations('PDF')
  //#endregion

  //#region HANDLE PAGE CHANGE EVENT
  const handlePageChange = (page: number) => {
    fetchBranchAssociationsList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {

    setSortInfo(sort);

    loadBranchAssociations(1, sort, searchTerm || undefined);

  }, [searchTerm]);
  //#endregion

  //#region VIEW EDIT
  const handleViewBranchAssociationsDetails = useCallback((row: BranchAssociationsMasterData) => {
    setViewBranchAssociationsMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])
  //#endregion

  //#region EDIT BRANCH ASSOCIATIONS  MASTER
  const handleEditBranchAssociationsMaster = useCallback((row: BranchAssociationsMasterData) => {
    setEditingBranchAssociationMasterData({
      ...row,
      BranchMasterId: row.BranchMasterId || '',
      EmployeeId: row.EmployeeId || 0
    })
    setIsAddUpdateModalOpen(true);
  }, [])
  //#endregion

  //#region CONFIRMATION DIALOG BOX
  const handleConfirmationDialogBoxOpen = useCallback((row: BranchAssociationsMasterData) => {
    setDeleteBranchAssociationsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  //#endregion

  //#region ADD UPDATE EDIT BRANCH ASSOCIATION MASTER
  const handleFieldChange = (field: keyof AddUpdateBranchAssociationsMasterRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // RESET FORM DATA
  const handleResetForm = () => {
    setFormData(getInitialFormState());
    setDropdownLabels({});
    setErrors({});
    setDropdownResetKey(prev => prev + 1);
  };

  const handleAddBranchAssociationsMaster = () => {
    setEditingBranchAssociationMasterData(null);
    setFormData(getInitialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  const validateAddBranchAssociationsMasterForm = (): {
    isValid: boolean
    errors: { [key: string]: string }
  } => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.BranchMasterId) {
      newErrors.BranchMasterId = "Branch is required"
    }

    if (!formData.EmployeeId) {
      newErrors.EmployeeId = "Employee is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushBranchAssociationsMasterFormData = (): AddUpdateBranchAssociationsMasterRequest => {
    return {
      BranchAssociationsId: formData.BranchAssociationsId,
      Uniquekey: formData.Uniquekey,
      BranchMasterId: formData.BranchMasterId ? String(formData.BranchMasterId) : "",
      EmployeeId: formData.EmployeeId
    };
  };

  const handleAddUpdateBranchAssociationsMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddBranchAssociationsMasterForm()

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const payload = PushBranchAssociationsMasterFormData();
        const response = await branchAssociationsService.apiCallAddUpdateBranchAssociations(payload);

        if (E.isRight(response)) {
          setIsAddUpdateModalOpen(false);

          const isAdd = formData.BranchAssociationsId === 0;

          if (isAdd) {
            const newRecord = response.right.Data[0] as BranchAssociationsMasterData
            setBranchAssociationsMasterList(prevData => [newRecord, ...prevData]);
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          } else {
            const updatedRecord = response.right.Data[0] as BranchAssociationsMasterData;
            setBranchAssociationsMasterList(prevData =>
              prevData.map(item =>
                item.BranchAssociationsId === formData.BranchAssociationsId
                  ? updatedRecord
                  : item
              )
            )
            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setEditingBranchAssociationMasterData(null);
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
      Number(formData.BranchAssociationsId) === 0 ? 'Add Branch Association' : 'Update Branch Association'
    )
  };
  //#endregion

  //#region DELETE BRANCH ASSOCIATIONS  EVENT
  const handleDeleteBranchAssociations = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBranchAssociationsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteBranchAssociationsRequest = {
          BranchAssociationsId: deleteBranchAssociationsData.BranchAssociationsId || 0,
          UniqueKey: deleteBranchAssociationsData.Uniquekey || ""
        };

        const response = await branchAssociationsService.apiCallDeleteBranchAssociations(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;
          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (branchAssociationsMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadBranchAssociations(pageToShow);

          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })
          setIsConfirmationDialogBoxOpen(false);
          setDeleteBranchAssociationsData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });
          setIsConfirmationDialogBoxOpen(false);
        }
        return response;
      },
      undefined,
      (error: any) => addToast({ type: "error", title: error.message }),
      undefined,
      "Deleting Branch Associations"
    );
  };
  //#endregion

  return {
    branchAssociationsMasterList,
    isLoading,
    loadingMessage,
    pagination,
    sortInfo,
    searchTerm,
    viewBranchAssociationsMasterDetailsData,
    isViewModalOpen,
    errors,
    editingBranchAssociationMasterData,
    isAddUpdateModalOpen,
    formData,
    isConfirmationDialogBoxOpen,
    deleteBranchAssociationsData,
    canAction,
    canExport,
    branchAssociationsMasterColumns,
    dropdownLabels,
    dropdownResetKey,

    departmentName,
    designationName,
    branchName,
    reportingPersonName,
    emailId,
    personalMobileNumber,

    // Setters
    setSearchTerm,
    setIsViewModalOpen,
    setViewBranchAssociationsMasterDetailsData,
    setErrors,
    setEditingBranchAssociationMasterData,
    setIsAddUpdateModalOpen,
    setFormData,
    setIsConfirmationDialogBoxOpen,
    setDeleteBranchAssociationsData,
    setDropdownLabels,
    setDropdownResetKey,

    // Actions
    fetchBranchAssociationsList,
    handlePageChange,
    handleSortColumn,
    handleViewBranchAssociationsDetails,
    handleEditBranchAssociationsMaster,
    handleConfirmationDialogBoxOpen,
    handleFieldChange,
    handleAddBranchAssociationsMaster,
    handleAddUpdateBranchAssociationsMaster,
    handleDeleteBranchAssociations,
    handleExportBranchAssociationsExcel,
    handleExportBranchAssociationsPdf,
    handleResetForm,
    debouncedSearch,
    clearsearchBranchAssociations,
  }
}
