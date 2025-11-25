import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateAssetMappingMasterRequest,
  AssetMappingMasterData,
  DeleteAssetMappingMasterRequest,
  FilterWithPaginationAssetMappingMasterRequest
} from '@/features/assetMappingMaster/models/AssetMappingMasterModel';

import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService'
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
import { Edit, Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { SingleSelectDropdownWithPagination } from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';


export const AssetMappingMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
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
    searchAssetMappings(value)
  }, 350)

  //VIEW ASSET MAPPING MASTER MODAL STATES
  const [viewAssetMappingMasterDetailsData, setViewAssetMappingMasterDetailsData] = useState<AssetMappingMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetMappingMasterColumnsModal, setIsShowCustomizeAssetMappingMasterColumnsModal] = useState(false);


  //#endregion

  //#region MENU PERMISSIONS
  const { canAction,canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialAssetMappings = useRef(false)

   // EDIT ASSET Mapping MASTER STATES
   const[editingAssetMappingMasterData,setEditingAssetMappingMasterData]=useState<AssetMappingMasterData|null>(null)
   const[isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);
  
    //DELETE ASSET Mapping MASTER STATES
   const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
   const[deleteAssetMappingMasterDetailsData,setDeleteAssetMappingMasterDetailsData]=useState<AssetMappingMasterData|null>(null)

  useEffect(() => {

    if (hasFetchedInitialAssetMappings.current) return

    hasFetchedInitialAssetMappings.current = true;

    fetchAssetMappingList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion


  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchAssetMappingList = async (page: number = pagination.currentPage) => {
    return await loadAssetMappings(page, filters);
  }

  const loadAssetMappings = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = assetMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterMappingId: filterParams.AssetMasterMappingId ? Number(filterParams.AssetMasterMappingId) : undefined,
          AssetName: filterParams.AssetName?.trim() || undefined,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getAssetMappings(params);

        if (E.isRight(response)) {

          setAssetMappingMasterList(response.right.Data);

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
      'Loading Asset Mapping Data...'
    )
  }

  // SEARCH ASSET MAPPING 
  const searchAssetMappings = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchAssetMappingList();

      return
    }

    const filterParams: FilterInfo = {
      AssetName: searchValue.trim(),
    };

    await loadAssetMappings(1, filterParams)

  }

  const clearsearchAssetMappings = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchAssetMappingList();
  }
  // END SEARCH ASSET MAPPING 

  // EXPORT EXCEL | PDF
  const handleExportAssetMappings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = assetMappingMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationAssetMappingMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          EmployeeName: filters.EmployeeName?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getAssetMappings(params);

        handleExportFile(response, exportType, 'Asset Mapping Master', addToast)

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

  const handleExportAssetMappingExcel = () => handleExportAssetMappings('Excel')
  const handleExportAssetMappingPdf = () => handleExportAssetMappings('PDF')

  //END EXPORT EXCEL | PDF

  //API | SERVICES CALL TO GET ASSET MAPPING 

  const getAssetMappings = async (filterParams: FilterWithPaginationAssetMappingMasterRequest) => {

    return await assetMappingMasterService.apiCallPullAssetMappingMaster(filterParams);
  }

  //END API | SERVICES CALL TO GET ASSET MAPPING

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchAssetMappingList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchAssetMappingList(1);

  }

  const assetMappingMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const assetMappingListForTable = useMemo(() => assetMappingMasterList, [assetMappingMasterList]);

  // STABLE HANDLER VIEW
  const handleViewAssetMappingDetails = useCallback((row: AssetMappingMasterData) => {
    setViewAssetMappingMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditAssetMappingMaster=useCallback((row:AssetMappingMasterData)=>{
      setEditingAssetMappingMasterData({
        ...row,
  
      })
      setIsAddUpdateModalOpen(true);
  
    },[])
   const handleConfirmationDialogBoxOpen=useCallback((row:AssetMappingMasterData)=>{
      setDeleteAssetMappingMasterDetailsData(row)
      setIsConfirmationDialogBoxOpen(true)
  },[])

  const assetMappingMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'AssetName',
        label: 'Asset Name',
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
              onClick={() => handleViewAssetMappingDetails(row)}
            />
              {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditAssetMappingMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Asset Mapping"
                    style={{
                      color: '#0B3251',
                      padding: '0px 8px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleConfirmationDialogBoxOpen(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    style={{
                      color: 'red',
                      padding: '0px 8px'
                    }}
                    title="Delete Asset Mapping"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              </div>
            )}
          </div>
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
        key: 'AssetCode',
        label: 'Asset Code',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'AssignedDate',
        label: 'Assigned Date',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
      {
        key: 'ReturnDate',
        label: 'Return Date',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : 'N/A'
      },
      {
        key: 'Status',
        label: 'Status',
        width: '10',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            value === 'Active' ? 'bg-green-100 text-green-800' : 
            value === 'Inactive' ? 'bg-red-100 text-red-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {value || 'N/A'}
          </span>
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '12',
        sortable: true,
        align: 'center',
        render: (value) => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '12',
        sortable: true,
        align: 'center',
        render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
      }
    ],
    // dependencies: include everything used inside that might change
    [handleViewAssetMappingDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredAssetMappingMasterColumnKeys: string[] = ['AssetName'];

  const allAssetMappingMasterColumnKeys: string[] = assetMappingMasterColumns.map(c => c.key)

  const [selectedAssetMappingMasterColumnKeys, setSelectedAssetMappingMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getAssetMappingMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredAssetMappingMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allAssetMappingMasterColumnKeys.includes(k));

      }
    } catch { }
    return allAssetMappingMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedAssetMappingMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredAssetMappingMasterColumnKeys])).filter(k => allAssetMappingMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetMappingMasterColumns.length])

  const visibleAssetMappingMasterColumns = useMemo(
    () => assetMappingMasterColumns.filter(col => selectedAssetMappingMasterColumnKeys.includes(col.key)),
    [assetMappingMasterColumns, selectedAssetMappingMasterColumnKeys]
  )

  //#endregion

  //#region VIEW ASSET MAPPING DETAILS MODAL COMPONENT

  interface ViewAssetMappingDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: AssetMappingMasterData | null
  }

  const ViewAssetMappingDetailsModal: React.FC<ViewAssetMappingDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings - Company setup (Asset Mapping Details)"
        onSubmit={(e) => {
          e.preventDefault()
          onClose()
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          {/* Asset Mapping Information */}
          <div className="space-y-4">

            {/* Employee Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Employee Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.EmployeeName || 'N/A'}
              </span>
            </div>

            {/* Asset Code */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Code
              </span>
              <span className="text-sm text-blue-600 font-medium">
                <TooltipText
                  text={data.AssetCode || 'N/A'}
                  maxWidth="170px"
                  tooltipThreshold={15}
                  tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
                />
              </span>
            </div>

            {/* Asset Name */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Name
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetName || 'N/A'}
              </span>
            </div>

            {/* Asset Type */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Asset Type
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetType || 'N/A'}
              </span>
            </div>

            {/* Asset Brand */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Brand
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetBrand || 'N/A'}
              </span>
            </div>

            {/* Asset Model */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Model
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.AssetModel || 'N/A'}
              </span>
            </div>

            {/* Serial Number */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Serial Number
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.SerialNumber || 'N/A'}
              </span>
            </div>

            {/* Assigned Date */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Assigned Date
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.AssignedDate ? formatDate_dd_MonthName_yy(data.AssignedDate) : 'N/A'}
              </span>
            </div>

            {/* Return Date */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Return Date
              </span>
              <span className="text-sm text-blue-600 font-medium">
                {data.ReturnDate ? formatDate_dd_MonthName_yy(data.ReturnDate) : 'N/A'}
              </span>
            </div>

            {/* Condition On Issue */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Condition On Issue
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.ConditionOnIssue || 'N/A'}
              </span>
            </div>

            {/* Condition On Return */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Condition On Return
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.ConditionOnReturn || 'N/A'}
              </span>
            </div>

            {/* Remarks */}
            <div className="flex justify-between items-start py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                Remarks
              </span>
              <span className="text-sm text-blue-600 font-medium text-left break-words whitespace-normal max-w-[400px]">
                {data.Remarks || 'N/A'}
              </span>
            </div>

            {/* Status */}
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm font-medium text-gray-700">Status</span>
              <span className="text-sm text-blue-600 font-medium">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  data.Status === 'Active' ? 'bg-green-100 text-green-800' : 
                  data.Status === 'Inactive' ? 'bg-red-100 text-red-800' : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {data.Status || 'N/A'}
                </span>
              </span>
            </div>

          </div>
          {/* Action Details Header */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created By</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {data.CreatedBy || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm text-blue-600 font-medium">
                    {formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified By</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {data.ModifiedBy}
                    </span>
                  </div>
                )}
                {data.ModifiedDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Modified Date</span>
                    <span className="text-sm text-blue-600 font-medium">
                      {formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')}
                    </span>
                  </div>
                )}
              </div>
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
    loadAssetMappings(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadAssetMappings(1, {})
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

   //#region ADD UPDATE EDIT ASSET Mapping MASTER
  const handleAddAssetModal = () => {
    setEditingAssetMappingMasterData(null);
    setIsAddUpdateModalOpen(true);
  };
  
  interface AddUpdateAssetMappingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateAssetMappingMasterRequest) => void;
    data?: AssetMappingMasterData | null;
    loading?: boolean;
  }
  
const AddUpdateAssetMappingModel:React.FC<AddUpdateAssetMappingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  data,
  loading=false
})=>{
  const [formData, setFormData] = useState<AddUpdateAssetMappingMasterRequest>({
  AssetMasterMappingId: 0,
  Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  AssetMasterId: 0,
  AssignedDate: "2025-11-19T08:51:55.991Z",
  EmployeeId: 0,
  ReturnDate: "2025-11-19T08:51:55.991Z",
  ConditionOnIssue:"",
  ConditionOnReturn: "",
  Remarks: ""
});
 // Single error object for all fields
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(()=>{
    if(isOpen){
      if(data){
        //Edit Asset Mapping
        setFormData({
          AssetMasterMappingId:data.AssetMasterMappingId ?? 0,
          Uniquekey:data.Uniquekey ?? "",
          AssetMasterId:data.AssetMasterId ?? 0,
          AssignedDate:data.AssignedDate ?? "",
          EmployeeId:data.EmployeeId ?? 0,
          ReturnDate:data.ReturnDate ?? "",
          ConditionOnIssue:data.ConditionOnIssue ??"",
          ConditionOnReturn:data.ConditionOnReturn ?? "",
          Remarks:data.Remarks ?? ""
        });
      }else{
        //Add Asset Mapping
         setFormData({
          AssetMasterMappingId: 0,
          Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
          AssetMasterId: 0,
          AssignedDate: "",
          EmployeeId: 0,
          ReturnDate: "",
          ConditionOnIssue:"",
          ConditionOnReturn: "",
          Remarks: ""
         });
      }setErrors({});
    }
  },[isOpen,data]);

//handle input change
const handleFieldChange = (
    field: keyof AddUpdateAssetMappingMasterRequest,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

// Submit handler
  const handleSubmitAddUpdateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = [
      "AssignedDate",
      "ReturnDate",
      "ConditionOnIssue",
      "ConditionOnReturn",
      "Remarks"
    ];

    const newErrors: any = {};
    requiredFields.forEach((field) => {
      const value = formData[field as keyof AddUpdateAssetMappingMasterRequest];
      if (value === null || value === undefined || value.toString().trim() === "") {
        const label = field.replace(/([A-Z])/g, " $1");
        newErrors[field] = `${label} is required`;
      }
    });
    setErrors(newErrors);

    // STOP submit if any error
    if (Object.keys(newErrors).length > 0) return;

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      onCancel={onClose}
      title={formData.AssetMasterMappingId === 0 ? "Add Asset" : "Update Asset"}
      onSubmit={handleSubmitAddUpdateAsset}
      saveText={formData.AssetMasterMappingId === 0 ? "Save" : "Update"}
      cancelText="Cancel"
      loading={loading}
    >
      <div className="space-y-6">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* <SingleSelectDropdownWithPagination
            title='Select'
            size='lg'
            dataFetchCallBack={fetchAssets}
            onSelected={(item)=>handleFieldChange("AssetMasterId",Number(item.value))}
            /> */}
          </div>
         </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Condition On Issue <span className="text-red-500">*</span></label>
            <Input
              value={formData.ConditionOnIssue ?? ""}
              onChange={(e) => handleFieldChange("ConditionOnIssue", e.target.value)}
              className={`w-full p-2 rounded border ${
                errors.ConditionOnIssue ? "border-red-500" : "border-gray-300"
              }`}
              placeholder=""
            />
            {errors.ConditionOnIssue && (
              <p className="text-red-500 text-xs mt-1">{errors.ConditionOnIssue}</p>
            )}
          </div>

          {/* Condition On Return */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Condition On Return <span className="text-red-500">*</span></label>
            <Input
              value={formData.ConditionOnReturn ?? ""}
              onChange={(e) => handleFieldChange("ConditionOnReturn", e.target.value)}
              className={`w-full p-2 rounded border ${
                errors.ConditionOnReturn ? "border-red-500" : "border-gray-300"
              }`}
              placeholder=""
            />
            {errors.ConditionOnReturn && (
              <p className="text-red-500 text-xs mt-1">{errors.ConditionOnReturn}</p>
            )}
          </div>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/*  Assigned Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Assigned Date <span className="text-red-500">*</span></label>
            <Input
              type="date"
              value={formData.AssignedDate?.substring(0, 10)}
              onChange={(e) => handleFieldChange("AssignedDate", e.target.value)}
              className={`w-full p-2 rounded border ${
                errors.AssignedDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.AssignedDate && (
              <p className="text-red-500 text-xs mt-1">{errors.AssignedDate}</p>
            )}
          </div>

          {/*  Return Date */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Return Date<span className="text-red-500">*</span></label>
            <Input
              type="date"
              value={formData.ReturnDate?.substring(0, 10)}
              onChange={(e) =>
                handleFieldChange("ReturnDate", e.target.value)
              }
              className={`w-full p-2 rounded border ${
                errors.ReturnDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.ReturnDate && (
              <p className="text-red-500 text-xs mt-1">{errors.ReturnDate}</p>
            )}
          </div>
          {/* Remarks */}
          
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">
              Remarks <span className="text-red-500">*</span></label>
            <Input
              value={formData.Remarks as any}
              onChange={(e) => handleFieldChange("Remarks", e.target.value)}
              className={`w-full p-2 rounded border ${
                errors.Remarks ? "border-red-500" : "border-gray-300"
              }`}
              placeholder=""
            />
            {errors.Remarks && (
              <p className="text-red-500 text-xs mt-1">{errors.Remarks}</p>
            )}
          </div>
      </div>
    </Modal>
  );
}

const handleAddUpdateAssetMappingMaster=async (formData:AddUpdateAssetMappingMasterRequest)=>{

   setIsAddUpdateModalOpen(false);
   await runApiWithLoader(
    setIsLoading,
    setIsLoadingMessage,
    async ()=>{
      const response=await assetMappingMasterService.apiCallAddUpdateAssetMappingMaster(formData);
           if (E.isRight(response)){
            setIsAddUpdateModalOpen(false);
            const isAdd=formData.AssetMasterMappingId===0
            if(isAdd){
              const newRecord=response.right.Data[0] as AssetMappingMasterData
              
                setAssetMappingMasterList(prevData => [newRecord, ...prevData]);
          
                      setPagination({
                        currentPage: pagination.currentPage,
                        totalRecords: pagination.totalRecords + 1,
                        totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
                      });
          
          
                      addToast({ type: 'success', title: 'Asset added successfully' })
                    } else {
          
                      const updatedRecord = response.right.Data[0] as AssetMappingMasterData;
          
                      setAssetMappingMasterList(prevData =>
                        prevData.map(item =>
                          item.AssetMasterMappingId === formData.AssetMasterMappingId
                            ? updatedRecord
                            : item
                        )
                      )
          
                      addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }
          
                    setIsAddUpdateModalOpen(false);
          
                    setEditingAssetMappingMasterData(null);
          
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
                formData.AssetMasterMappingId === 0 ? 'Add Asset' : 'Update Asset...'
              )
            }

  //#region DELETE Asset Mapping MASTER
    const handleDeleteAssetMappingMaster=async()=>{
       setIsConfirmationDialogBoxOpen(false);
  
       if(!deleteAssetMappingMasterDetailsData) return
  
       await runApiWithLoader(
        setIsLoading,
        setIsLoadingMessage,
  
        async()=>{
         
          const params:DeleteAssetMappingMasterRequest={
            AssetMasterMappingId:deleteAssetMappingMasterDetailsData.AssetMasterMappingId ?? 0,
            UniqueKey:deleteAssetMappingMasterDetailsData.Uniquekey ?? ""
          }
          const response= await  assetMappingMasterService.apiCallDeleteAssetMappingMaster(params);
  
          if(E.isRight(response)){
            setAssetMappingMasterList(prevData=>prevData.filter(item=>item.AssetMasterMappingId !==deleteAssetMappingMasterDetailsData.AssetMasterMappingId));
  
            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords - 1,
              totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
            });
  
            addToast({type:"success",title:response.right.SuccessMessage[0]})
  
            setIsConfirmationDialogBoxOpen(false);
            setDeleteAssetMappingMasterDetailsData(null);
            }else{
              addToast({ type: 'error', title: response.left.message });
  
            setIsConfirmationDialogBoxOpen(false);
            }
              return response
          },
          undefined,
          (error:any)=>{
            addToast({ type: 'error', title: error.message })
          },
          undefined,
           'Delete Asset Mapping Master data...'
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
          searchPlaceholder="Search by asset name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchAssetMappings}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeAssetMappingMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Asset Mapping"
          onAdd={handleAddAssetModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportAssetMappingExcel}
          onExportPdf={handleExportAssetMappingPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE ASSET MAPPING */}
        <DataTable
          data={assetMappingListForTable}
          columns={visibleAssetMappingMasterColumns}
          pagination={assetMappingMasterPaginationInfo}
          emptyMessage="No asset mappings found"
          fixedHeight={true}
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW ASSET MAPPING MODAL */}
        <ViewAssetMappingDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewAssetMappingMasterDetailsData(null)
          }}
          data={viewAssetMappingMasterDetailsData}
        />

        {/*  ADD EDIT UPDATE TNC MODAL */}
        <AddUpdateAssetMappingModel
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingAssetMappingMasterData(null)
          }}
          onSubmit={handleAddUpdateAssetMappingMaster}
          data={editingAssetMappingMasterData}
          loading={isLoading}
        />
        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeAssetMappingMasterColumnsModal}
          onClose={() => setIsShowCustomizeAssetMappingMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredAssetMappingMasterColumnKeys]),
            )

            setSelectedAssetMappingMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeAssetMappingMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={assetMappingMasterColumns}
          selectedKeys={selectedAssetMappingMasterColumnKeys}
          requiredKeys={requiredAssetMappingMasterColumnKeys}
          title="Customize Asset Mapping Master Table Columns"
        />

        {/* FILTER ASSET MAPPING MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Asset Mapping Master"
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
                  Asset Name
                </label>
                <Input
                  type="text"
                  value={tempFilters.AssetName || ''}
                  onChange={(e) => handleFilterChange('AssetName', e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>
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
            </div>
          </div>
        </Modal>

         {/* DELETE CONFIRMATION ASSET MODAL */}
               <ConfirmationDialogBox
                isOpen={isConfirmationDialogBoxOpen}
                onClose={() => {
                setIsConfirmationDialogBoxOpen(false)
                setDeleteAssetMappingMasterDetailsData(null)
                }}
               onConfirm={handleDeleteAssetMappingMaster}
               title="You are about to delete a asset mapping?"
               message="Deleting this Asset Mapping Data will permanently remove its contents."
               confirmText="Delete"
               cancelText="Cancel"
               loading={isLoading}
               variant="danger"
            />
      </div>
    </>
  );
};

export default AssetMappingMaster;

