import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
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
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { Edit } from 'lucide-react';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { updateFilter } from '@/core/utils/filterHelper';
import { fetchEmployeeMasterDropdown } from "@/features/employeeMaster/employeeMasterDropDown";
import { fetchBranchMasterDropdown } from "@/features/branchMaster/branchMasterDropDown";
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';

const initialFormState = (): AddUpdateBranchAssociationsMasterRequest => ({
  BranchAssociationsId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  BranchMasterId: "",
  EmployeeId: 0
});


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
  const { addToast } = useToast()

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

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  // EDIT BRANCH ASSOCIATION  MASTER
  const [editingBranchAssociationMasterData, setEditingBranchAssociationMasterData] = useState<BranchAssociationsMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE BRANCH ASSOCIATION MASTER
  const [formData, setFormData] = useState<AddUpdateBranchAssociationsMasterRequest>(() => initialFormState());


  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeBranchAssociationsMasterColumnsModal, setIsShowCustomizeBranchAssociationsMasterColumnsModal] = useState(false);

  const [dropdownLabels, setDropdownLabels] = useState<{
    branchName?: string;
    employeeName?: string;
  }>({});
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
          Uniquekey: editingBranchAssociationMasterData.Uniquekey || initialFormState().Uniquekey,
          BranchMasterId: editingBranchAssociationMasterData.BranchMasterId || '',
          EmployeeId: editingBranchAssociationMasterData.EmployeeId || 0
        });

        setDropdownLabels({
          branchName: editingBranchAssociationMasterData.BranchName || "",
          employeeName: editingBranchAssociationMasterData.EmployeeName || ""
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingBranchAssociationMasterData]);

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

    const filterParams: FilterInfo = {
      EmployeeName: searchValue.trim(),
    };

    await loadBranchAssociations(1, filterParams)

  }
  //#endregion

  
  const handleResetForm = () => {
    setFormData(initialFormState());   
    setErrors({});                    
  };

  //#region CLEAR BRANCH ASSOCIATIONS 
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
      'Preparing Export'
    )
  }

  const handleExportBranchAssociationsExcel = () => handleExportBranchAssociations('Excel')
  const handleExportBranchAssociationsPdf = () => handleExportBranchAssociations('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET BRANCH ASSOCIATIONS 

  const getBranchAssociations = async (filterParams: FilterWithPaginationBranchAssociationsMasterRequest) => {

    return await branchAssociationsService.apiCallPullBranchAssociations(filterParams);
  }

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT

  const handlePageChange = (page: number) => {
    fetchBranchAssociationsList(page);
  };

  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchBranchAssociationsList(1);

  }
  //#endregion

  //#region TABLE PAGINATION INFO

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

  //#region TABLE COLUMN
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
                    size='sm'
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsViewModalOpen(false)
                      handleEditBranchAssociationsMaster(data)
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
  //#endregion

  //#region CLEAR FILTER 
  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadBranchAssociations(1, {})
    setShowFilterPopup(false)
  }

  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //ADD UPDATE BRANCH ASSOCIATION MASTER

  const handleFieldChange = (field: keyof AddUpdateBranchAssociationsMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddBranchAssociationsMaster = () => {
    setEditingBranchAssociationMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddBranchAssociationsMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.BranchMasterId === "") {

      newErrors.BranchMasterId = "Branch is required"
    }

    if (formData.EmployeeId === 0) {
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

      setIsLoadingMessage,
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

  return (
    

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
          searchPlaceholder="Search By Employee Name"
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
          emptyMessage="No Branch Associations Data Found"
          fixedHeight={true}
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

        {/* ADD BRANCH ASSOCIATIONS MODAL */}

        <Modal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingBranchAssociationMasterData(null)
            setFormData(initialFormState());
            setErrors({})
          }}
          onCancel={() => {
            setIsAddUpdateModalOpen(false)
            setEditingBranchAssociationMasterData(null)
            setFormData(initialFormState());
            setErrors({})
          }}
          title={editingBranchAssociationMasterData ? 'Update Branch Associations' : 'Add Branch Associations'}
          onSubmit={handleAddUpdateBranchAssociationsMaster}
          saveText={editingBranchAssociationMasterData ? 'Update Branch Associations' : 'Save Branch Associations'}
          resetText='Reset'
          loading={isLoading}
          size='xl'
        >
          <div className="space-y-10 p-6 bg-blue-100">
            <div className="space-y-4" >
              <div>
                <SingleSelectDropdownWithPagination
                  label="Branch"
                  title="Select Branch"
                  size="lg"
                  required
                  dataFetchCallBack={fetchBranchMasterDropdown}
                  onSelected={(item) => handleFieldChange("BranchMasterId", Number(item.value))}
                  initialValue={createDropdownInitialValue(formData.BranchMasterId, dropdownLabels.branchName)}
                  error={errors.BranchMasterId}
                />
              </div>
              <SingleSelectDropdownWithPagination
                label="Employee"
                title="Select Employee"
                size="lg"
                required
                dataFetchCallBack={fetchEmployeeMasterDropdown}
                onSelected={(item) => handleFieldChange("EmployeeId", Number(item.value))}
                initialValue={createDropdownInitialValue(formData.EmployeeId, dropdownLabels.employeeName)}
                error={errors.EmployeeId}
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
          size="small-half"
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
                  placeholder="Enter Employee Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch Master
                </label>
                <Input
                  type="text"
                  value={tempFilters.BranchMasterId || ''}
                  onChange={(e) => handleFilterChange('BranchMasterId', e.target.value)}
                  placeholder="Enter Branch Name"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>

  )
}

export default BranchAssociationsMaster


