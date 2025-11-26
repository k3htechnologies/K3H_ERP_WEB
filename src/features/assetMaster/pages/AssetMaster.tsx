import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  AddUpdateAssetMasterRequest,
  AssetMasterData,
  DeleteAssetMasterRequest,
  FilterWithPaginationAssetMasterRequest
} from '@/features/assetMaster/models/AssetMasterModel';

import { assetMasterService } from '@/features/assetMaster/services/AssetMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { convert_dd_mm_yyyy_To_Yyyy_mm_dd, formatDate_dd_mm_yyyy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { Edit, Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { DatePickerInput } from '@/ui/components/forms/Datepicker';
import { FieldItem } from '@/ui/components/forms/FieldItem';


export const AssetMaster: React.FC = () => {

  //#region STATE MANAGEMENT
  const [assetMasterList, setAssetMasterList] = useState<AssetMasterData[]>([]);
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
    searchAssets(value)
  }, 350)

  //VIEW ASSET MASTER MODAL STATES
  const [viewAssetMasterDetailsData, setViewAssetMasterDetailsData] = useState<AssetMasterData | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeAssetMasterColumnsModal, setIsShowCustomizeAssetMasterColumnsModal] = useState(false);

  // EDIT ASSET MASTER
  const [editingAssetMasterData, setEditingAssetMasterData] = useState<AssetMasterData | null>(null)
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE ASSET MASTER STATES
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)
  const [deleteAssetMasterDetailsData, setDeleteAssetMasterDetailsData] = useState<AssetMasterData | null>(null)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INITIALIZATION
  const hasFetchedInitialAssets = useRef(false);

  useEffect(() => {

    if (hasFetchedInitialAssets.current) return

    hasFetchedInitialAssets.current = true;

    fetchAssetList()
  }, [])


  //CLEANUP PENDING DEBOUNCED CALLBACK ON UNMOUNT
  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])

  //#endregion

  //#region DATA LOADING | FETCH |  LOAD | SEARCH 

  const fetchAssetList = async (page: number = pagination.currentPage) => {
    return await loadAssets(page, filters);
  }

  const loadAssets = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;

        if (sortInfo) {

          const column = assetMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }

        }

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          AssetMasterId: filterParams.AssetMasterId ? Number(filterParams.AssetMasterId) : undefined,
          AssetName: filterParams.AssetName?.trim() || undefined,
          Status: filterParams.Status?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getAssets(params);

        if (E.isRight(response)) {

          setAssetMasterList(response.right.Data);

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
      'Loading Asset Data...'
    )
  }

  // SEARCH ASSET 
  const searchAssets = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {

      fetchAssetList();

      return
    }

    const filterParams: FilterInfo = {
      AssetName: searchValue.trim(),
    };

    await loadAssets(1, filterParams)

  }

  const clearsearchAssets = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchAssetList();
  }
 
  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportAssets = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        // Find the column label for sorting
        let sortByParam = undefined
        if (sortInfo) {
          const column = assetMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }

        const params: FilterWithPaginationAssetMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          AssetName: filters.AssetName?.trim() || undefined,
          Status: filters.Status?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }

        const response = await getAssets(params);

        handleExportFile(response, exportType, 'Asset Master', addToast)

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

  const handleExportAssetExcel = () => handleExportAssets('Excel')
  const handleExportAssetPdf = () => handleExportAssets('PDF')

  //#endregion

  //#region API | SERVICES CALL TO GET ASSET 

  const getAssets = async (filterParams: FilterWithPaginationAssetMasterRequest) => {

    return await assetMasterService.apiCallPullAssetMaster(filterParams);
  }

  //#endregion

  //#region TABLE CONFIGURATION

  const handlePageChange = (page: number) => {
    fetchAssetList(page);
  };

  const handleSortColumn = (sortInfo: SortInfo) => {

    setSortInfo(sortInfo);

    fetchAssetList(1);

  }

  const assetMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const assetListForTable = useMemo(() => assetMasterList, [assetMasterList]);


  // STABLE HANDLER VIEW
  const handleViewAssetDetails = useCallback((row: AssetMasterData) => {
    setViewAssetMasterDetailsData(row)
    setIsViewModalOpen(true)
  }, [])

  const handleEditAssetMaster = useCallback((row: AssetMasterData) => {
    setEditingAssetMasterData({
      ...row,

    })
    setIsAddUpdateModalOpen(true);

  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: AssetMasterData) => {
    setDeleteAssetMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])
  const assetMasterColumns = useMemo<TableColumn[]>(
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
              onClick={() => handleViewAssetDetails(row)}
            />

          </div>
        )
      },
      {
        key: 'AssetCode',
        label: 'Asset Code',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="170px"
            tooltipThreshold={15}
            tooltipClassName='inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap'
          />
        )
      },
      {
        key: 'AssetType',
        label: 'Asset Type',
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
        key: 'AssetBrand',
        label: 'Brand',
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
      },
      {
        key: 'AssetModel',
        label: 'Model',
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
      },
      {
        key: 'SerialNumber',
        label: 'Serial Number',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="150px"
            tooltipThreshold={15}
          />
        )
      },
      {
        key: 'Status',
        label: 'Status',
        width: '12',
        sortable: false,
        align: 'center',
        render: (value) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value === 'Active' ? 'bg-green-100 text-green-800' :
            value === 'Inactive' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
            {value || 'N/A'}
          </span>
        )
      }
    ],

    [handleViewAssetDetails]
  )

  //#endregion

  //#region CUSTOMIZE TABLE COLUMNS

  const requiredAssetMasterColumnKeys: string[] = ['AssetName'];

  const allAssetMasterColumnKeys: string[] = assetMasterColumns.map(c => c.key)

  const [selectedAssetMasterColumnKeys, setSelectedAssetMasterColumnKeys] = useState<string[]>(() => {

    try {

      const saved = LocalStorageHelper.getAssetMasterTableColumns();

      if (saved) {

        const parsed = JSON.parse(saved) as string[]
        // Ensure required columns are always present

        const withRequired = Array.from(new Set([...parsed, ...requiredAssetMasterColumnKeys]));

        // Filter out any keys that no longer exist
        return withRequired.filter(k => allAssetMasterColumnKeys.includes(k));

      }
    } catch { }
    return allAssetMasterColumnKeys
  })

  useEffect(() => {
    // Guarantee required columns remain selected if state changes elsewhere

    setSelectedAssetMasterColumnKeys(prev => Array.from(new Set([...prev, ...requiredAssetMasterColumnKeys])).filter(k => allAssetMasterColumnKeys.includes(k)));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assetMasterColumns.length])

  const visibleAssetMasterColumns = useMemo(
    () => assetMasterColumns.filter(col => selectedAssetMasterColumnKeys.includes(col.key)),
    [assetMasterColumns, selectedAssetMasterColumnKeys]
  )

  //#endregion

  //#region VIEW ASSET DETAILS MODAL COMPONENT

  interface ViewAssetDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    data: AssetMasterData | null
  }

  const ViewAssetDetailsModal: React.FC<ViewAssetDetailsModalProps> = ({
    isOpen,
    onClose,
    data
  }) => {
    if (!data) return null

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Asset Details"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FieldItem label="Asset Code" value={data.AssetCode} />
              <FieldItem label="Asset Name" value={data.AssetName} className='font-medium text-blue-900 ' />
              <FieldItem label="Asset Type" value={data.AssetType} />
            </div>
            <FieldItem label="Asset Brand" value={data.AssetBrand} isRow withBorder={true} />
            <FieldItem label="Asset Model" value={data.AssetModel} isRow withBorder={true} className='font-medium text-blue-900 ' />
            <FieldItem label="Serial Number" value={data.SerialNumber} isRow withBorder={true} />

            <FieldItem label="Purchase Date" value={formatDate_dd_MonthName_yy_hh_mm(data.PurchaseDate || '-')} isRow withBorder={true} />
            <FieldItem label="Warranty Expiry Date" value={formatDate_dd_MonthName_yy_hh_mm(data.WarrantyExpiryDate || '-')} isRow withBorder={true} />

            <FieldItem label="Supplier Name" value={data.SupplierName} isRow withBorder={true} />
            <FieldItem label="Status" value={data.Status} isRow withBorder={true} />
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
                    handleEditAssetMaster(data)
                  }}
                >
                  <Edit className="h-5 w-5" />
                  Edit
                </Button>
              </>
            )}
          </div>
        </div>

      </Modal>
    )
  }

  //#endregion

  //#region FILTER MODAL HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadAssets(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
    setTempFilters({})
    setFilters({})
    loadAssets(1, {})
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

  //#region ADD UPDATE EDIT ASSET MASTER
  const handleAddAssetModal = () => {
    setEditingAssetMasterData(null);
    setIsAddUpdateModalOpen(true);
  };

  interface AddUpdateAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AddUpdateAssetMasterRequest) => void;
    data?: AssetMasterData | null;
    loading?: boolean;
  }

  const AddUpdateAssetModel: React.FC<AddUpdateAssetModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateAssetMasterRequest>({
      AssetMasterId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      AssetCode: "",
      AssetName: "",
      AssetType: "",
      AssetModel: "",
      AssetBrand: "",
      SerialNumber: "",
      PurchaseDate: "",
      WarrantyExpiryDate: "",
      AssetCost: 0,
      SupplierName: ""
    });

    // Single error object for all fields
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
      if (isOpen) {

        if (data) {

          setFormData({
            AssetMasterId: data.AssetMasterId ?? 0,
            Uniquekey: data.Uniquekey ?? "",
            AssetCode: data.AssetCode ?? "",
            AssetName: data.AssetName ?? "",
            AssetType: data.AssetType ?? "",
            AssetModel: data.AssetModel ?? "",
            AssetBrand: data.AssetBrand ?? "",
            SerialNumber: data.SerialNumber ?? "",
            PurchaseDate: data.PurchaseDate ?? "",
            WarrantyExpiryDate: data.WarrantyExpiryDate ?? "",
            AssetCost: data.AssetCost ?? 0,
            SupplierName: data.SupplierName ?? ""
          });
        } else {
          
          setFormData({
            AssetMasterId: 0,
            Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            AssetCode: "",
            AssetName: "",
            AssetType: "",
            AssetModel: "",
            AssetBrand: "",
            SerialNumber: "",
            PurchaseDate: "",
            WarrantyExpiryDate: "",
            AssetCost: 0,
            SupplierName: ""
          });
        }
        setErrors({});
      }
    }, [isOpen, data]);

    // Handle input change
    const handleFieldChange = (
      field: keyof AddUpdateAssetMasterRequest,
      value: any
    ) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // Submit handler
    const handleSubmitAddUpdateAsset = (e: React.FormEvent) => {
      
      e.preventDefault();
      const requiredFields = [
        "AssetName",
        "AssetCode",
        "AssetType",
        "AssetModel",
        "AssetBrand",
        "SerialNumber",
        "AssetCost",
        "SupplierName",
        "PurchaseDate",
        "WarrantyExpiryDate"
      ];

      const newErrors: any = {};

      requiredFields.forEach((field) => {
        const value = formData[field as keyof AddUpdateAssetMasterRequest];
        if (value === null || value === undefined || value === 0 || value.toString().trim() === "") {
          const label = field.replace(/([A-Z])/g, " $1");
          newErrors[field] = `${label} is required`;
        }
      });
      setErrors(newErrors);


      if (Object.keys(newErrors).length > 0) return;

      onSubmit(formData);
    };

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={formData.AssetMasterId === 0 ? "Add Asset" : "Update Asset"}
        onSubmit={handleSubmitAddUpdateAsset}
        saveText={formData.AssetMasterId === 0 ? "Add Asset" : "Update Asset"}
        cancelText="Cancel"
        loading={loading}
        size='half-screen'
      >
        <div className="space-y-6 p-6 bg-blue-100">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                required
                label='Asset Name'
                value={formData.AssetName ?? ""}
                onChange={(e) => handleFieldChange("AssetName", e.target.value)}
                placeholder="Enter Asset Name"
                error={errors.AssetName}
              />
            </div>

            <div>
              <Input
                type="text"
                label='Asset Code'
                value={formData.AssetCode ?? ""}
                onChange={(e) => handleFieldChange("AssetCode", e.target.value)}
                required
                placeholder="Enter Asset Code"
                error={errors.AssetCode}
              />

            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                label='Asset Type'
                value={formData.AssetType ?? ""}
                onChange={(e) => handleFieldChange("AssetType", e.target.value)}
                required
                placeholder="Enter Asset Type"
                error={errors.AssetType}
              />
            </div>

            <div>
              <Input
                type="text"
                label='Asset Model'
                value={formData.AssetModel ?? ""}
                onChange={(e) => handleFieldChange("AssetModel", e.target.value)}
                required
                placeholder="Enter Asset Model"
                error={errors.AssetModel}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                label='Asset Brand'
                value={formData.AssetBrand ?? ""}
                onChange={(e) => handleFieldChange("AssetBrand", e.target.value)}
                required
                placeholder="Enter Asset Brand"
                error={errors.AssetBrand}
              />
            </div>

            <div>
              <Input
                type="text"
                label='Serial Number'
                value={formData.SerialNumber ?? ""}
                onChange={(e) => handleFieldChange("SerialNumber", e.target.value)}
                required
                placeholder="Enter Serial Number"
                error={errors.SerialNumber}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                type="text"
                label='Asset Cost'
                value={formData.AssetCost ?? ""}
                onChange={(e) => handleFieldChange("AssetCost", e.target.value)}
                required
                placeholder="Enter Asset Cost"
                error={errors.AssetCost}
              />
            </div>
            <div>
              <Input
                type="text"
                label='Supplier Name'
                value={formData.SupplierName ?? ""}
                onChange={(e) => handleFieldChange("SupplierName", e.target.value)}
                required
                placeholder="Enter Supplier Name"
                error={errors.SupplierName}
              />
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <DatePickerInput
                label="Purchase Date"
                value={formatDate_dd_mm_yyyy(formData.PurchaseDate)}
                onChange={(val) => handleFieldChange('PurchaseDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                required
                error={errors.PurchaseDate}
              />
            </div>

            <div>
              <DatePickerInput
                label="DOB"
                value={formatDate_dd_mm_yyyy(formData.WarrantyExpiryDate)}
                onChange={(val) => handleFieldChange('WarrantyExpiryDate', convert_dd_mm_yyyy_To_Yyyy_mm_dd(val))}
                required
                error={errors.WarrantyExpiryDate}
              />
            </div>
          </div>
        </div>
      </Modal>
    );
  };

  const handleAddUpdateAssetMaster = async (formData: AddUpdateAssetMasterRequest) => {

    setIsAddUpdateModalOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await assetMasterService.apiCallAddUpdateAssetMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.AssetMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as AssetMasterData

            setAssetMasterList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Asset added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as AssetMasterData;

            setAssetMasterList(prevData =>
              prevData.map(item =>
                item.AssetMasterId === formData.AssetMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingAssetMasterData(null);

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
      formData.AssetMasterId === 0 ? 'Add Asset' : 'Update Asset...'
    )
  }

  //#region DELETE Asset MASTER
  const handleDeleteAssetMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteAssetMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteAssetMasterRequest = {
          AssetMasterId: deleteAssetMasterDetailsData.AssetMasterId ?? 0,
          UniqueKey: deleteAssetMasterDetailsData.Uniquekey ?? ""
        }
        const response = await assetMasterService.apiCallDeleteAssetMaster(params);

        if (E.isRight(response)) {
          setAssetMasterList(prevData => prevData.filter(item => item.AssetMasterId !== deleteAssetMasterDetailsData.AssetMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: "success", title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);
          setDeleteAssetMasterDetailsData(null);
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
      'Delete Asset master data...'
    )
  }

  //#endregion
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
          searchPlaceholder="Search By Asset Name"
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchAssets}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeAssetMasterColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Asset Master"
          onAdd={handleAddAssetModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportAssetExcel}
          onExportPdf={handleExportAssetPdf}
          exportLoading={isLoading}
        />


        {/* DATA TABLE ASSET */}
        <DataTable
          data={assetListForTable}
          columns={visibleAssetMasterColumns}
          pagination={assetMasterPaginationInfo}
          emptyMessage="No assets found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        {/* VIEW ASSET MODAL */}
        <ViewAssetDetailsModal isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false)
            setViewAssetMasterDetailsData(null)
          }}
          data={viewAssetMasterDetailsData}
        />


        {/*  ADD EDIT UPDATE TNC MODAL */}
        <AddUpdateAssetModel
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingAssetMasterData(null)
          }}
          onSubmit={handleAddUpdateAssetMaster}
          data={editingAssetMasterData}
          loading={isLoading}
        />
        {/* CUSTOMIZE COLUMNS MODAL */}


        <CustomizeColumnsModal
          isOpen={isShowCustomizeAssetMasterColumnsModal}
          onClose={() => setIsShowCustomizeAssetMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredAssetMasterColumnKeys]),
            )

            setSelectedAssetMasterColumnKeys(withRequired)

            try {
              LocalStorageHelper.storeAssetMasterTableColumns(
                JSON.stringify(withRequired),
              )
            } catch { }
          }}
          columns={assetMasterColumns}
          selectedKeys={selectedAssetMasterColumnKeys}
          requiredKeys={requiredAssetMasterColumnKeys}
          title="Customize Table Columns"
        />

        {/* FILTER ASSET MODAL */}
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Asset Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
          }}
          saveText="Apply Filter"
          onCancel={() => clearFilters()}
          size="small-half"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  label='Asset Name'
                  value={tempFilters?.AssetName ?? ''}
                  onChange={(e) => handleFilterChange('AssetName', e.target.value)}
                  placeholder="Enter asset name"
                />
              </div>
              <div>

                <Input
                  label='Status'
                  type="text"
                  value={tempFilters.Status || ''}
                  onChange={(e) => handleFilterChange('Status', e.target.value)}
                  placeholder="Enter status (Active / Inactive)"
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
            setDeleteAssetMasterDetailsData(null)
          }}
          onConfirm={handleDeleteAssetMaster}
          title="You are about to delete a asset?"
          message="Deleting this Asset Data will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  );
};

export default AssetMaster;
