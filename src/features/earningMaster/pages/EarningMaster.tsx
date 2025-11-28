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
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { Edit, Trash2 } from 'lucide-react';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { BranchMasterService } from '@/features/branchMaster/services/BranchMasteService';
import { FieldItem } from '@/ui/components/forms/FieldItem';


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

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeEarningMasterColumnsModal, setIsShowCustomizeEarningMasterColumnsModal] = useState(false);

  // EDIT EARNING MASTER
  const [editingEarningMasterData, setEditingEarningMasterData] = useState<EarningMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [EarningMasterFormData, setEarningMasterFormData] = useState<AddUpdateEarningMasterRequest>({
    EarningMasterId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    Name: "",
    Type: "",
    Value: 0,
    BranchMasterId: 0
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  //DELETE EARNING MASTER
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteEarningMasterDetailsData, setDeleteEarningMasterDetailsData] = useState<EarningMasterData | null>(null)

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
      'Loading Earning Data...'
    )
  }

  // SEARCH ASSET MAPPING 
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

  const clearsearchEarnings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchEarningList();
  }
  //#endregion 

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
      'Preparing Export...'
    )
  }

  const handleExportEarningExcel = () => handleExportEarnings('Excel')
  const handleExportEarningPdf = () => handleExportEarnings('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET EARNING MAPPING 
  const getEarnings = async (filterParams: FilterWithPaginationEarningMasterRequest) => {

    return await EarningMasterService.apiCallPullEarningMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET EARNING  MAPPING

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchEarningList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchEarningList(1);

  }

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

  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewEarningDetails = useCallback((row: EarningMasterData) => {
    setViewEarningMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const handleConfirmationDialogBoxOpen = useCallback((row: EarningMasterData) => {
    setDeleteEarningMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

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
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '15',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
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
                      handleEditEarningMasterData(data)
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

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadEarnings(1, {})
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

  //ADD UPDATE Earning MASTER
  const handleAddEarningMaster = () => {
    setEditingEarningMasterData(null);
    setEarningMasterFormData({
      EarningMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: "",
      Type: "",
      Value: 0,
      BranchMasterId: 0
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const handleEditEarningMasterData = (row: EarningMasterData) => {
    setEditingEarningMasterData(row);
    setEarningMasterFormData({
      EarningMasterId: row.EarningMasterId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: row.Name || "",
      Type: row.Type || "",
      Value: row.Value || 0,
      BranchMasterId: row.BranchMasterId || 0
    });
    setDropdownLabels({
      branchName: row.BranchName ?? ""

    });
    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  }


  const handleFieldChange = (field: keyof AddUpdateEarningMasterRequest, value: string | number | null | boolean) => {
    setEarningMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateEarningMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!EarningMasterFormData.Name) {
      newErrors.Name = "Earning Name is required.";
    }

    if (!EarningMasterFormData.Type) {
      newErrors.Type = "Type is required.";
    }

    if (!EarningMasterFormData.Value) {
      newErrors.Value = "Value is required.";
    }
    if (!EarningMasterFormData.BranchMasterId) {
      newErrors.BranchMasterId = "Branch Name is required.";
    }


    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushEarningFormData = (): AddUpdateEarningMasterRequest => {
    return {
      EarningMasterId: EarningMasterFormData.EarningMasterId || 0,
      Uniquekey: EarningMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      Name: EarningMasterFormData.Name || "",
      Type: EarningMasterFormData.Type || "",
      Value: EarningMasterFormData.Value || 0,
      BranchMasterId: EarningMasterFormData.BranchMasterId || 0
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
    id?: number,
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
  }>({});


  const handleAddUpdateEarningMaster = async () => {

    setFormErrors({});

    const validation = validateEarningMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushEarningFormData();
        const response = await EarningMasterService.apiCallAddUpdateEarningMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = EarningMasterFormData.EarningMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as EarningMasterData

            setEarningMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Earning added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as EarningMasterData;

            setEarningMasterList(prevData =>
              prevData.map(item =>
                item.EarningMasterId === EarningMasterFormData.EarningMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingEarningMasterData(null);

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
      EarningMasterFormData.EarningMasterId === 0 ? 'Add Earning' : 'Update Earning...'
    )
  }

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

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by earning name..."
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
          onAdd={handleAddEarningMaster}
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
          emptyMessage="No earnings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
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

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingEarningMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingEarningMasterData(null)
            setFormErrors({})
          }}
          title={editingEarningMasterData ? 'Update Asset Mapping Master Details' : 'Add Asset Mapping Master Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateEarningMaster()
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
                  label='Earning Name'
                  value={EarningMasterFormData.Name ?? ""}
                  onChange={(e) => handleFieldChange("Name", e.target.value)}
                  placeholder="Enter Earning Name"
                  maxLength={250}
                  error={formErrors.Name}
                />
              </div>

              <div>
                <Input
                  type="text"
                  label='Type'
                  value={EarningMasterFormData.Type ?? ""}
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
                  value={EarningMasterFormData.Value ?? ""}
                  onChange={(e) => handleFieldChange("Value", e.target.value)}
                  required
                  maxLength={20}
                  placeholder="Enter Value"
                  error={formErrors.Value}
                />

              </div>
              <SingleSelectDropdownWithPagination
                label="Branch"
                title="Select..."
                size="lg"
                required
                dataFetchCallBack={fetchBranchOptions}
                onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                initialValue={toDropdownInitialValue(EarningMasterFormData.BranchMasterId, dropdownLabels.branchName)}
                error={formErrors.BranchMasterId}
              />
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
          title="Customize Earning Master Table Columns"
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
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Earning Name</label>
                <Input
                  type="text"
                  value={tempFilters.Name || ''}
                  onChange={(e) => handleFilterChange('Name', e.target.value)}
                  placeholder="Enter earning name"
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


