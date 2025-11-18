import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  TncMasterData,
  FilterWithPaginationTncMasterRequest,
  AddUpdateTncMasterRequest,
  DeleteTncMasterRequest
} from '@/features/tnc/models/TncMasterModel';

import { TncMasterService } from '@/features/tnc/services/TncMasterService';
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
import { Tabs } from '@/ui/components/Tab/Tab';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Edit, Trash2 } from 'lucide-react';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import RichTextEditor from '@/ui/components/forms/RichTextEditor';

export const TncMaster: React.FC = () => {

  //#region STATE
  const [tncList, setTncList] = useState<TncMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast();

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchTnc(value);
  }, 350);

  //VIEW TNC MASTER MODAL STATES
  const [viewTncData, setViewTncData] = useState<TncMasterData | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});


  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeTncColumnsModal, setIsShowCustomizeTncColumnsModal] = useState(false);

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  const hasFetchedInitialTnc = useRef(false);

  // EDIT TNC MASTER
  const [editingTncMasterData, setEditingTncMasterData] = useState<TncMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //DELETE TNC MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteTncMasterDetailsData, setDeleteTncMasterDetailsData] = useState<TncMasterData | null>(null)


  //TAB ACTIVITY
  const tncTabList = [
    { id: "Material Requisition", label: "Material Requisition" },
    { id: "Booking", label: "Booking" },
  ];

  const [activeTab, setActiveTab] = useState<string>(tncTabList[0].id);

  //#endregion

  //#region INIT
  useEffect(() => {
    if (hasFetchedInitialTnc.current) return;
    hasFetchedInitialTnc.current = true;
    fetchTncList();
  }, []);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);
  //#endregion

  //#region DATA LOAD
  const fetchTncList = async (page: number = pagination.currentPage) => {
    return await loadTnc(page, filters);
  };

  const loadTnc = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = tncColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const moduleName =
          filterParams.ModuleName?.toString().trim() ||
          activeTab?.trim() ||
          undefined;

        const params: FilterWithPaginationTncMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          TermsAndConditionsMasterId: filterParams.TermsAndConditionsMasterId
            ? Number(filterParams.TermsAndConditionsMasterId)
            : undefined,
          ModuleName: moduleName,
          Title: filterParams.Title?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await getTnc(params);

        if (E.isRight(response)) {
          setTncList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize)
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message });
      },
      undefined,
      'Loading Terms & Conditions...'
    );
  };

  const searchTnc = async (searchValue: string) => {
    setSearchTerm(searchValue);

    const baseFilters: FilterInfo = {
      ...filters,
      ModuleName: filters.ModuleName || activeTab,
    };

    if (searchValue.trim() === '') {
      setFilters(baseFilters);
      await loadTnc(1, baseFilters);
      return;
    }

    const filterParams: FilterInfo = {
      ...baseFilters,
      Title: searchValue.trim()
    };

    await loadTnc(1, filterParams);
  };

  const clearSearchTnc = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    fetchTncList();
  };

  const handleExportTnc = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = tncColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationTncMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ModuleName: activeTab?.trim() || undefined,
          Title: filters.Title?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await getTnc(params);

        handleExportFile(response, exportType, 'Terms & Conditions Master', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export...'
    );
  };

  const handleExportTncExcel = () => handleExportTnc('Excel');
  const handleExportTncPdf = () => handleExportTnc('PDF');

  const getTnc = async (filterParams: FilterWithPaginationTncMasterRequest) => {
    return await TncMasterService.apiCallPullTncMaster(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = (page: number) => {
    fetchTncList(page);
  };

  const handleSortColumn = (sort: SortInfo) => {
    setSortInfo(sort);
    fetchTncList(1);
  };

  const tncPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const tncListForTable = useMemo(() => tncList, [tncList]);

  const handleViewTncDetails = useCallback((row: TncMasterData) => {
    setViewTncData(row);
    setIsViewModalOpen(true);
  }, []);

  const handleEditTncMaster = useCallback((row: TncMasterData) => {
    setEditingTncMasterData({
      ...row,
      ModuleName: row.ModifiedDate || '',
      Title: row.Title || '',
      Description: row.Description || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])

  const handleConfirmationDialogBoxOpen = useCallback((row: TncMasterData) => {
    setDeleteTncMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  const tncColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'Title',
        label: 'Title',
        width: '28',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || 'N/A'}
              maxWidth="320px"
              tooltipThreshold={30}
              onClick={() => handleViewTncDetails(row)}
            />

            {canAction && (
              <div className="flex items-center justify-end ml-2 w-20">
                <>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleEditTncMaster(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    title="Edit Tnc"
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
                    title="Delete Tnc"
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
        key: 'Description',
        label: 'Description',
        width: '30',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="340px" tooltipThreshold={34} />
        )
      },
      {
        key: 'CreatedBy',
        label: 'Last Modified By',
        width: '12',
        sortable: true,
        align: 'center',
        render: value => value || 'N/A'
      },
      {
        key: 'CreatedDate',
        label: 'Last Modified Date',
        width: '12',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      }
    ],
    [handleViewTncDetails, handleViewTncDetails, handleEditTncMaster, handleConfirmationDialogBoxOpen]
  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredTncColumnKeys: string[] = ['Title'];

  const allTncColumnKeys: string[] = tncColumns.map(c => c.key);

  const [selectedTncColumnKeys, setSelectedTncColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getTncMasterTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredTncColumnKeys]));
        return withRequired.filter(k => allTncColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allTncColumnKeys;
  });

  useEffect(() => {
    setSelectedTncColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredTncColumnKeys])).filter(k =>
        allTncColumnKeys.includes(k)
      )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tncColumns.length]);

  const visibleTncColumns = useMemo(
    () => tncColumns.filter(col => selectedTncColumnKeys.includes(col.key)),
    [tncColumns, selectedTncColumnKeys]
  );
  //#endregion

  //#region VIEW MODAL
  interface ViewTncDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: TncMasterData | null;
  }

  const ViewTncDetailsModal: React.FC<ViewTncDetailsModalProps> = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="View Terms & Conditions Details"
        onSubmit={e => {
          e.preventDefault();
          onClose();
        }}
        cancelText="Close"
        loading={false}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <FieldItem label="Module Name" value={data.ModuleName} isRow withBorder={false} />
            <FieldItem label="Title" value={data.Title} isRow withBorder={false} />
            <FieldItem label="Description" value={data.Description} isRow withBorder={false} />

          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Action Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <FieldItem label="Created By" isRow={true} value={data.CreatedBy} withBorder={false} />
                <FieldItem label="Created Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.CreatedDate || '-')} withBorder={false} />

              </div>
              <div className="space-y-2">
                {data.ModifiedBy && (
                  <>
                    <FieldItem label="Modified By" isRow={true} value={data.ModifiedBy} withBorder={false} />
                    <FieldItem label="Modified Date" isRow={true} value={formatDate_dd_MonthName_yy_hh_mm(data.ModifiedDate || '-')} withBorder={false} />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  };
  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadTnc(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadTnc(1, {});
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters: FilterInfo = { ...tempFilters };
    if (value.trim()) {
      newFilters[key] = value.trim();
    } else {
      delete newFilters[key];
    }
    setTempFilters(newFilters);
  };
  //#endregion

  //#region ADD UPDATE EDIT TNC MASTER
  const handleAddTncModal = () => {
    setEditingTncMasterData(null)
    setIsAddUpdateModalOpen(true)
  }

  interface AddUpdateTncModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: AddUpdateTncMasterRequest) => void
    data?: TncMasterData | null
    loading?: boolean
  }

  const AddUpdateTncModal: React.FC<AddUpdateTncModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    data,
    loading = false
  }) => {
    const [formData, setFormData] = useState<AddUpdateTncMasterRequest>({
      TermsAndConditionsMasterId: 0,
      Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      ModuleName: '',
      Title: '',
      Description: ''
    })
    const [titleError, setTitleError] = useState('')
    const [descriptionError, setDescriptionError] = useState('')

    useEffect(() => {
      if (isOpen) {
        if (data) {
          setFormData({
            TermsAndConditionsMasterId: data.TermsAndConditionsMasterId ?? 0,
            Uniquekey: data.Uniquekey,
            ModuleName: activeTab?.trim() || "",
            Title: data.Title || '',
            Description: data.Description || ''
          })
        } else {
          setFormData({
            TermsAndConditionsMasterId: 0,
            Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            ModuleName: '',
            Title: '',
            Description: ''
          })
        }
        setTitleError('')
        setDescriptionError('')
      }
    }, [isOpen, data])

    const handleSubmitAddUpdateTnc = (e: React.FormEvent) => {

      e.preventDefault()

      // Clear previous errors
      setTitleError('')
      setDescriptionError('')

      let hasErrors = false;

      // TITLE  validation
      const title = formData.Title || ''
      if (title.trim() === "") {
        setTitleError("Title is required.")
        hasErrors = true
      }

      // DESCRIPTION validation
      const description = formData.Description || ''
      if (description.trim() === "") {
        setDescriptionError("Description is required.")
        hasErrors = true
      }

      if (hasErrors) {
        return
      }

      onSubmit({
        TermsAndConditionsMasterId: data?.TermsAndConditionsMasterId || 0,
        Uniquekey: data?.Uniquekey || '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        ModuleName: activeTab?.trim() || "",
        Title: title,
        Description: description
      })
    }

    const handleFieldChange = (field: keyof AddUpdateTncMasterRequest, value: string) => {

      setFormData(prev => ({ ...prev, [field]: value }))

      if (field === 'Title') {
        setTitleError('')
      } else if (field === 'Description') {
        setDescriptionError('')
      }
    }

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        onCancel={onClose}
        title={data ? 'Update Terms & Condtion' : 'Add Terms & Condtion'}
        onSubmit={handleSubmitAddUpdateTnc}
        saveText={data ? 'Update' : 'Save'}
        cancelText="Cancel"
        loading={loading}
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={formData.Title}
                onChange={(e) => handleFieldChange('Title', e.target.value)}
                placeholder="Enter title"
              />
              {titleError && (
                <p className="text-red-500 text-sm mt-1">{titleError}</p>
              )}
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.Description}
                onChange={(html) => handleFieldChange('Description', html)}
                placeholder="Enter description"
              />
              {descriptionError && (
                <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
              )}
            </div>


          </div>
        </div>
      </Modal>
    )
  }

  const handleAddUpdateTncMaster = async (formData: AddUpdateTncMasterRequest) => {

    setIsAddUpdateModalOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const response = await TncMasterService.apiCallAddUpdateTncMaster(formData);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.TermsAndConditionsMasterId === 0

          if (isAdd) {

            const newRecord = response.right.Data[0] as TncMasterData

            setTncList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: 'Tnc added successfully' })
          } else {

            const updatedRecord = response.right.Data[0] as TncMasterData;

            setTncList(prevData =>
              prevData.map(item =>
                item.TermsAndConditionsMasterId === formData.TermsAndConditionsMasterId
                  ? updatedRecord
                  : item
              )
            )

            addToast({ type: 'success', title: response.right.SuccessMessage[0] })
          }

          setIsAddUpdateModalOpen(false);

          setEditingTncMasterData(null);

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
      formData.TermsAndConditionsMasterId === 0 ? 'Add Tnc' : 'Update Tnc...'
    )
  }
  //#endregion 

  //#region DELETE TNC MASTER



  const handleDeleteTncMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTncMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,

      async () => {

        const params: DeleteTncMasterRequest = {
          TermsAndConditionsMasterId: deleteTncMasterDetailsData.TermsAndConditionsMasterId ?? 0,
          UniqueKey: deleteTncMasterDetailsData.Uniquekey ?? ""
        }

        const response = await TncMasterService.apiCallDeleteTncMaster(params);

        if (E.isRight(response)) {

          setTncList(prevData => prevData.filter(item => item.TermsAndConditionsMasterId !== deleteTncMasterDetailsData.TermsAndConditionsMasterId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteTncMasterDetailsData(null);

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
      'Delete tnc master data...'
    )
  }

  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="h-full flex flex-col">
        <Loader loading={isLoading} title={loadingMessage}>
          <div></div>
        </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search by title..."
          onSearchChange={v => {
            setSearchTerm(v);
            debouncedSearch(v);
          }}
          onClearSearch={clearSearchTnc}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters);
            setShowFilterPopup(true);
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeTncColumnsModal(true)}
          isShowAddButton={canAction}
          addTitle="Add Tnc Master"
          onAdd={handleAddTncModal}
          isShowImportButton={false}
          isShowExportButton={canExport}
          onExportExcel={handleExportTncExcel}
          onExportPdf={handleExportTncPdf}
          exportLoading={isLoading}
        />

        <Tabs
          tabs={tncTabList}
          defaultActive={activeTab}
          onTabChange={(t) => {
            setActiveTab(t.id);

            const newFilters: FilterInfo = {
              ...filters,
              ModuleName: t.id,
            };

            loadTnc(1, newFilters);
          }}
        />

        <DataTable
          data={tncListForTable}
          columns={visibleTncColumns}
          pagination={tncPaginationInfo}
          emptyMessage="No terms & conditions found"
          fixedHeight
          maxHeight="calc(100vh - 200px)"
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />
        <ViewTncDetailsModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setViewTncData(null);
          }}
          data={viewTncData}
        />
        {/*  ADD EDIT UPDATE TNC MODAL */}
        <AddUpdateTncModal
          isOpen={isAddUpdateModalOpen}
          onClose={() => {
            setIsAddUpdateModalOpen(false)
            setEditingTncMasterData(null)
          }}
          onSubmit={handleAddUpdateTncMaster}
          data={editingTncMasterData}
          loading={isLoading}
        />

        <CustomizeColumnsModal
          isOpen={isShowCustomizeTncColumnsModal}
          onClose={() => setIsShowCustomizeTncColumnsModal(false)}
          onApply={keys => {
            const withRequired = Array.from(new Set([...keys, ...requiredTncColumnKeys]));
            setSelectedTncColumnKeys(withRequired);
            try {
              LocalStorageHelper.storeTncMasterTableColumns?.(JSON.stringify(withRequired));
            } catch {
              // ignore
            }
          }}
          columns={tncColumns}
          selectedKeys={selectedTncColumnKeys}
          requiredKeys={requiredTncColumnKeys}
          title="Customize Terms & Conditions Master Table Columns"
        />
        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Terms & Conditions Master"
          onSubmit={e => {
            e.preventDefault();
            applyFilters();
          }}
          saveText="Apply Filter"
          cancelText="Clear Filter"
          onCancel={() => clearFilters()}
          size="half-screen"
        >
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
                <Input
                  type="text"
                  value={tempFilters.ModuleName || ''}
                  onChange={e => handleFilterChange('ModuleName', e.target.value)}
                  placeholder="Enter module name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  type="text"
                  value={tempFilters.Title || ''}
                  onChange={e => handleFilterChange('Title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>
            </div>
          </div>
        </Modal>

        {/* DELETE CONFIRMATION TNC MODAL */}
        <ConfirmationDialogBox
          isOpen={isConfirmationDialogBoxOpen}
          onClose={() => {
            setIsConfirmationDialogBoxOpen(false)
            setDeleteTncMasterDetailsData(null)
          }}
          onConfirm={handleDeleteTncMaster}
          title="You are about to delete a tnc?"
          message="Deleting this terms & Conditions will permanently remove its contents."
          confirmText="Delete"
          cancelText="Cancel"
          loading={isLoading}
          variant="danger"
        />
      </div>
    </>
  );
};

export default TncMaster;


