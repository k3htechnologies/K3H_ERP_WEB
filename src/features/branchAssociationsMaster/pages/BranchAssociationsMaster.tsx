import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateBranchAssociationsMasterRequest,
  BranchAssociationsMasterData,
  FilterWithPaginationBranchAssociationsMasterRequest
} from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';

import { branchAssociationsService } from '@/features/branchAssociationsMaster/services/BranchAssociationsMasterService'
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
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { BranchMasterService } from '@/features/branchMaster/services/BranchMasteService';
import { Edit } from 'lucide-react';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';


export const BranchAssociationsMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [branchAssociationsMasterList, setBranchAssociationsMasterList] = useState<BranchAssociationsMasterData[]>([]);
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
    searchBranchAssociations(value)
  }, 350)

  //VIEW BRANCH ASSOCIATIONS MASTER MODAL STATES
  const [viewBranchAssociationsMasterDetailsData, setViewBranchAssociationsMasterDetailsData] = useState<BranchAssociationsMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeBranchAssociationsMasterColumnsModal, setIsShowCustomizeBranchAssociationsMasterColumnsModal] = useState(false);

  // EDIT BranchAssociation MASTER
  const [editingBranchAssociationMasterData, setEditingBranchAssociationMasterData] = useState<BranchAssociationsMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  const [BranchAssociationMasterFormData, setBranchAssociationMasterFormData] = useState<AddUpdateBranchAssociationsMasterRequest>({
    BranchAssociationsId: 0,
    Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    BranchMasterId: "",
    EmployeeId: 0
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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
  //#endregion


  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchBranchAssociationsList = async (page: number = pagination.currentPage) => {
    return await loadBranchAssociations(page, filters);
  }

  const loadBranchAssociations = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = branchAssociationsMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationBranchAssociationsMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          BranchAssociationsId: filterParams.BranchAssociationsId ? Number(filterParams.BranchAssociationsId) : undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          BranchMasterId: String(filterParams.BranchMasterId ?? "").trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getBranchAssociations(params);

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
      'Loading Branch Associations Data...'
    )
  }

  // SEARCH BRANCH ASSOCIATIONS 
  const searchBranchAssociations = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchBranchAssociationsList();

      return
    }

    const filterParams: FilterInfo = {
      EmployeeName: searchValue.trim(),
    };

    await loadBranchAssociations(1, filterParams)

  }

  const clearsearchBranchAssociations = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchBranchAssociationsList();
  }
  // END SEARCH BRANCH ASSOCIATIONS 

  // EXPORT EXCEL | PDF
  const handleExportBranchAssociations = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = branchAssociationsMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationBranchAssociationsMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          BranchMasterId: filters.BranchMasterId?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getBranchAssociations(params);

        handleExportFile(response, exportType, 'Branch Associations Master', addToast)

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

  const handleExportBranchAssociationsExcel = () => handleExportBranchAssociations('Excel')
  const handleExportBranchAssociationsPdf = () => handleExportBranchAssociations('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET BRANCH ASSOCIATIONS 

  const getBranchAssociations = async (filterParams: FilterWithPaginationBranchAssociationsMasterRequest) => {

    return await branchAssociationsService.apiCallPullBranchAssociations(filterParams);
  }

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchBranchAssociationsList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchBranchAssociationsList(1);

  }

  const branchAssociationsMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const branchAssociationsListForTable = useMemo(() => branchAssociationsMasterList, [branchAssociationsMasterList]);


  // STABLE HANDLER VIEW EDIT CONFIRMATION DIALOG BOX
  const handleViewBranchAssociationsDetails = useCallback((row: BranchAssociationsMasterData) => {
    setViewBranchAssociationsMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])


  const branchAssociationsMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'EmployeeName',
        label: 'Employee Name',
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
              onClick={() => handleViewBranchAssociationsDetails(row)}
            />

          </div>
        )
      },
      {
        key: 'BranchName',
        label: 'Branch Name',
        width: '25',
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
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '25',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '25',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewBranchAssociationsDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredBranchAssociationsMasterColumnKeys: string[] = ['EmployeeName'];

  const allBranchAssociationsMasterColumnKeys: string[] = branchAssociationsMasterColumns.map(c => c.key)

  const [selectedBranchAssociationsMasterColumnKeys, setSelectedBranchAssociationsMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getBranchAssociationsMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredBranchAssociationsMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allBranchAssociationsMasterColumnKeys.includes(k));

      }
    } catch { }
    return allBranchAssociationsMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedBranchAssociationsMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredBranchAssociationsMasterColumnKeys])).filter(k => allBranchAssociationsMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchAssociationsMasterColumns.length])

  const visibleBranchAssociationsMasterColumns = useMemo(
    () => branchAssociationsMasterColumns.filter(col => selectedBranchAssociationsMasterColumnKeys.includes(col.key)),
    [branchAssociationsMasterColumns, selectedBranchAssociationsMasterColumnKeys]
  )

  //#endregion

  //#region VIEW BRANCH ASSOCIATIONS DETAILS MODAL COMPONENT

  interface ViewBranchAssociationsDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: BranchAssociationsMasterData | null
  }

  const ViewBranchAssociationsDetailsModal: React.FC<ViewBranchAssociationsDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Branch Associations Details"
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
            <FieldItem label="Branch Name" value={data.BranchName} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Employee Name" value={data.EmployeeName} isRow withBorder={true} />
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
                    color='blue'
                    size='md'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleEditBranchAssociationMasterData(data)
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
    loadBranchAssociations(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadBranchAssociations(1, {})
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

  //ADD UPDATE Branch Association MASTER
  const handleAddBranchAssociationsMaster = () => {
    setEditingBranchAssociationMasterData(null);
    setBranchAssociationMasterFormData({
      BranchAssociationsId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      BranchMasterId: "",
      EmployeeId: 0
    });

    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };

  const handleEditBranchAssociationMasterData = (row: BranchAssociationsMasterData) => {
    setEditingBranchAssociationMasterData(row);
    setBranchAssociationMasterFormData({
      BranchAssociationsId: row.BranchAssociationsId || 0,
      Uniquekey: row.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      BranchMasterId: row.BranchMasterId || "",
      EmployeeId: row.EmployeeId || 0
    });
    setDropdownLabels({
      branchName: row.BranchName ?? "",
      employeeName: row.EmployeeName ?? ""
    });
    setFormErrors({});
    setIsAddUpdateModalOpen(true);
  };


  const handleFieldChange = (field: keyof AddUpdateBranchAssociationsMasterRequest, value: string | number | null | boolean) => {
    setBranchAssociationMasterFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const validateBranchAssociationMasterForm = (): { isValid: boolean; errors: { [key: string]: string } } => {
    const newErrors: { [key: string]: string } = {};

    if (!BranchAssociationMasterFormData.BranchMasterId) {
      newErrors.BranchMasterId = "Branch  Name is required.";
    }

    if (!BranchAssociationMasterFormData.EmployeeId) {
      newErrors.EmployeeId = "Employee Name is required.";
    }
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }

  const PushBranchAssociationFormData = (): AddUpdateBranchAssociationsMasterRequest => {
    return {
      BranchAssociationsId: BranchAssociationMasterFormData.BranchAssociationsId || 0,
      Uniquekey: BranchAssociationMasterFormData.Uniquekey || "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      BranchMasterId: BranchAssociationMasterFormData.BranchMasterId || "",
      EmployeeId: BranchAssociationMasterFormData.EmployeeId || 0
    };
  };

  const fetchEmployeeOptions = async (pageNumber: number, params?: { value?: string }) => {
    const responseEither = await employeeMasterService.apiCallPullEmployeeMaster({
      PageSize: 10,
      PageNumber: pageNumber,
      EmployeeName: params?.value || "",
    });

    if (E.isLeft(responseEither)) return { totalNumberOfRecord: 0, itemList: [] };

    const apiResponse = responseEither.right;
    const employeeList = apiResponse?.Data?.map((item: any) => ({
      label: `${item.FirstName} ${item.MiddleName || ""} ${item.LastName || ""}`.trim(),
      value: String(item.EmployeeId),
    })) || [];

    return {
      totalNumberOfRecord: apiResponse?.TotalNumberOfRecord ?? employeeList.length,
      itemList: employeeList,
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
    id?: string | null,
    label?: string
  ): { label: string; value: string } | null => {
    if (!id) return null;
    return {
      label: label || id,
      value: id
    };
  };

  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    employeeName?: string;
  }>({});


  const handleAddUpdateBranchAssociationMaster = async () => {

    setFormErrors({});

    const validation = validateBranchAssociationMasterForm();

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const payload = PushBranchAssociationFormData();
        const response = await branchAssociationsService.apiCallAddUpdateBranchAssociations(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = BranchAssociationMasterFormData.BranchAssociationsId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as BranchAssociationsMasterData

            setBranchAssociationsMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Branch Association added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as BranchAssociationsMasterData;

            setBranchAssociationsMasterList(prevData =>
              prevData.map(item =>
                item.BranchAssociationsId === BranchAssociationMasterFormData.BranchAssociationsId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingBranchAssociationMasterData(null);

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
      BranchAssociationMasterFormData.BranchAssociationsId === 0 ? 'Add Branch Association' : 'Update Branch Association...'
    )
  }

  //#endregion
  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      <div className="h-full flex flex-col">
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
          searchPlaceholder="Search by employee name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchBranchAssociations}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeBranchAssociationsMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle='Add BranchAssociation'
          onAdd={handleAddBranchAssociationsMaster}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportBranchAssociationsExcel}
          onExportPdf={handleExportBranchAssociationsPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE BRANCH ASSOCIATIONS */}
        <DataTable
          data={branchAssociationsListForTable}
          columns={visibleBranchAssociationsMasterColumns}
          pagination={branchAssociationsMasterPaginationInfo}
          emptyMessage="No branch associations found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW BRANCH ASSOCIATIONS MODAL */}
        <ViewBranchAssociationsDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewBranchAssociationsMasterDetailsData(null)
          }}
          data={viewBranchAssociationsMasterDetailsData}
        />

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingBranchAssociationMasterData(null)
            setFormErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingBranchAssociationMasterData(null)
            setFormErrors({})
          }}
          title={editingBranchAssociationMasterData ? 'Update Branch Associations Master Details' : 'Add Branch AssociationsMaster Details'}
          onSubmit={(e) => {
            e.preventDefault()
            handleAddUpdateBranchAssociationMaster()
          }}
          saveText="Save"
          cancelText="Cancel"
          loading={isLoading}
          size="large75"
        >
          <div className="space-y-6 p-6 bg-blue-50">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch"
                  title="Select..."
                  size="lg"
                  required
                  dataFetchCallBack={fetchBranchOptions}
                  onSelected={(item) => handleFieldChange("BranchMasterId", String(item.value))}
                  initialValue={toDropdownInitialValue(BranchAssociationMasterFormData.BranchMasterId, dropdownLabels.branchName)}
                  error={formErrors.BranchMasterId}
                />
              </div>
              <SingleSelectDropdownWithPagination
                label="Employees"
                title="Select..."
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeOptions}
                onSelected={(item) => handleFieldChange("EmployeeId", Number(item.value))}
                initialValue={toDropdownInitialValue(
                  BranchAssociationMasterFormData.EmployeeId
                    ? String(BranchAssociationMasterFormData.EmployeeId)
                    : "",
                  dropdownLabels.employeeName
                )}
                error={formErrors.EmployeeId}
              />
            </div>
          </div>

        </Modal>


        {/* CUSTOMIZE COLUMNS MODAL */}
        <CustomizeColumnsModal
          isOpen={isShowCustomizeBranchAssociationsMasterColumnsModal}
          onClose={() => setIsShowCustomizeBranchAssociationsMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredBranchAssociationsMasterColumnKeys]),
            )

            setSelectedBranchAssociationsMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeBranchAssociationsMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={branchAssociationsMasterColumns}
          selectedKeys={selectedBranchAssociationsMasterColumnKeys}
          requiredKeys={requiredBranchAssociationsMasterColumnKeys}
          title="Customize Branch Associations Master Table Columns"
        />

        {/* FILTER BRANCH ASSOCIATIONS MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Branch Associations Master"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.EmployeeName || ''}
                  onChange={(e) => handleFilterChange('EmployeeName', e.target.value)}
                  placeholder="Enter employee name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Master ID
                </label>
                <Input
                  type="text"
                  value={tempFilters.BranchMasterId || ''}
                  onChange={(e) => handleFilterChange('BranchMasterId', e.target.value)}
                  placeholder="Enter branch master ID"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>

  )
}

export default BranchAssociationsMaster


