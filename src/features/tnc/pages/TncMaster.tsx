import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  TncMasterData,
  FilterWithPaginationTncMasterRequest,
  AddUpdateTncMasterRequest,
  DeleteTncMasterRequest
} from '@/features/tnc/models/TncMasterModel';

import { tncMasterService } from '@/features/tnc/services/TncMasterService';
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
import { Tabs } from '@/ui/components/Tab/Tab';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { Trash2 } from 'lucide-react';
import RichTextEditor from '@/ui/components/forms/RichTextEditor';
import { updateFilter } from '@/core/utils/filterHelper';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { cleanHtml } from '@/core/utils/comman';

const initialFormState = (): AddUpdateTncMasterRequest => ({
  TermsAndConditionsMasterId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ModuleName: '',
  Title: '',
  Description: ''
});

export const TncMaster: React.FC = () => {

  //#region STATE
  const [tncList, setTncList] = useState<TncMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { addToast } = useToast();

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

  //ERROR SET UP
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeTncColumnsModal, setIsShowCustomizeTncColumnsModal] = useState(false);


  const hasFetchedInitialTnc = useRef(false);

  // EDIT TNC MASTER
  const [editingTncMasterData, setEditingTncMasterData] = useState<TncMasterData | null>(null);
  const [isAddUpdateModalOpen, setIsAddUpdateModalOpen] = useState(false);

  //ADD UPDATE T&C MASTER
  const [formData, setFormData] = useState<AddUpdateTncMasterRequest>(() => initialFormState());

  //DELETE TNC MASTER STATES

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteTncMasterDetailsData, setDeleteTncMasterDetailsData] = useState<TncMasterData | null>(null)

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();

  //#endregion

  //#regionTAB ACTIVITY
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

  useEffect(() => {
    if (isAddUpdateModalOpen) {
      if (editingTncMasterData) {
        setFormData({
          TermsAndConditionsMasterId: editingTncMasterData.TermsAndConditionsMasterId || 0,
          Uniquekey: editingTncMasterData.Uniquekey || initialFormState().Uniquekey,
          ModuleName: editingTncMasterData.ModuleName || '',
          Title: editingTncMasterData.Title || '',
          Description: editingTncMasterData.Description || ''
        });
      } else {
        setFormData(initialFormState());
      }
      setErrors({});
    }
  }, [isAddUpdateModalOpen, editingTncMasterData]);

  //#endregion

  //#region DATA LOAD
  const fetchTncList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadTnc(page, filters, sort ?? sortInfo);
  };

  const loadTnc = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

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
          Title: searchtext ?? filterParams.Title?.trim() ?? undefined,
          SortBy: getSortByParam(sortInfo ?? null, tncColumns)
        };

        const response = await tncMasterService.apiCallPullTncMaster(params);

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
      'Loading Terms & Conditions'
    );
  };
  //#endregion

  //#region SERACH T&C 
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

    await loadTnc(1, filters, sortInfo, searchValue)
  };

  //#endregion

  //#region CLEAR SERACH T&C

  const clearSearchTnc = () => {
    setSearchTerm('');
    debouncedSearch.cancel?.();
    loadTnc(1, { DepartmentName: '' }, sortInfo, undefined);
  };

  //#endregion

  //#region EXPORT EXCEL | PDF
  const handleExportTnc = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationTncMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ModuleName: activeTab?.trim() || undefined,
          Title: filters.Title?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, tncColumns),
          ExportType: exportType
        };

        const response = await tncMasterService.apiCallPullTncMaster(params);

        handleExportFile(response, exportType, 'Terms & Conditions Master', addToast);

        return response;
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message || 'Export failed' });
      },
      undefined,
      'Preparing Export'
    );
  };

  const handleExportTncExcel = () => handleExportTnc('Excel');
  const handleExportTncPdf = () => handleExportTnc('PDF');

  //#endregion

  //#region HANDLE PAGE CHNAGE EVENT
  const handlePageChange = (page: number) => {
    fetchTncList(page);
  };
  //#endregion

  //#region TABLE SORT COLUMN
  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    loadTnc(1, filters, sort, searchTerm || undefined);
  }, [filters, searchTerm]);
  //#endregion

  //#region TABLE PAGINATION INFO
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

  //#endregion

  //#region VIEW EDIT
  const handleViewTncDetails = useCallback((row: TncMasterData) => {
    setViewTncData(row);
    setIsViewModalOpen(true);
  }, []);

  //#endregion

  //#region EDIT T&C MASTER

  const handleEditTncMaster = useCallback((row: TncMasterData) => {
    setEditingTncMasterData({
      ...row,
      ModuleName: row.ModifiedDate || '',
      Title: row.Title || '',
      Description: row.Description || ''
    })
    setIsAddUpdateModalOpen(true);

  }, [])

  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: TncMasterData) => {
    setDeleteTncMasterDetailsData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN

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
              text={value || '-'}
              maxWidth="320px"
              tooltipThreshold={30}
              onClick={() => handleViewTncDetails(row)}
            />

          </div>
        )
      },

      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => (
          canAction && !row.NumberOfEmployee ? (
            <div className="flex items-center justify-center gap-2">

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleConfirmationDialogBoxOpen(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'red',
                  padding: '4px 8px'
                }}
                title="Delete T&C"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null
        )
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
        title="Terms & Conditions Details"
        onSubmit={e => {
          e.preventDefault();
          onClose();
        }}
        cancelText="Close"
        loading={false}
        size='large-half'
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <FieldItem label="Module Name" value={data.ModuleName} isRow withBorder={true} />
            <FieldItem label="Title" value={data.Title} isRow withBorder={true} />
            <h4 className="text-sm font-medium text-[#1D1D1D80] truncate">
              Description :
            </h4>
            <RichTextEditor value={data.Description ?? ""} onChange={() => { }} readOnly={true} />

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
                  color='red'
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
                  Delete
                </Button>

                <Button
                  color='blue'
                  size='md'
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setIsViewModalOpen(false)
                    handleEditTncMaster(data)
                  }}
                >
                  Edit
                </Button>
              </>
            )}
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

  //#endregion

  //#region Clear 

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});
    loadTnc(1, {});
    setShowFilterPopup(false);
  };
  //#endregion

  //#region HANDLE FILTER CHNAGE

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };
  //#endregion

  //#region ADD UPDATE EDIT T&C MASTER

  const handleFieldChange = (field: keyof AddUpdateTncMasterRequest, value: any) => {

    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  };

  const handleAddTncModal = () => {
    setEditingTncMasterData(null);
    setFormData(initialFormState());
    setErrors({});
    setIsAddUpdateModalOpen(true);
  }

  // ============================================================= [VALIDATION FUNCTION] =============================================================================================
  const validateAddTncMasterForm = (): {

    isValid: boolean

    errors: { [key: string]: string }

  } => {

    const newErrors: { [key: string]: string } = {}

    if (formData.Title.trim() === "") {
      newErrors.Title = "Title is required"
    }

    if (formData.Description.trim() === "") {
      newErrors.Description = "Description is required";
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    }
  }

  const PushTncMasterFormData = (): AddUpdateTncMasterRequest => {
    return {
      TermsAndConditionsMasterId: formData.TermsAndConditionsMasterId,
      Uniquekey: formData.Uniquekey,
      Title: formData.Title,
      ModuleName: activeTab?.trim() || "",
      Description: cleanHtml(formData.Description)
    };

  };

  const handleAddUpdateTncMaster = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({})

    const validation = validateAddTncMasterForm()

    if (!validation.isValid) {

      setErrors(validation.errors)

      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushTncMasterFormData();

        const response = await tncMasterService.apiCallAddUpdateTncMaster(payload);

        if (E.isRight(response)) {

          setIsAddUpdateModalOpen(false);

          const isAdd = formData.TermsAndConditionsMasterId === 0;

          if (isAdd) {

            const newRecord = response.right.Data[0] as TncMasterData

            setTncList(prevData => [newRecord, ...prevData]);

            setPagination({
              currentPage: pagination.currentPage,
              totalRecords: pagination.totalRecords + 1,
              totalPages: Math.ceil((pagination.totalRecords + 1) / pagination.pageSize)
            });


            addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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

          setEditingTncMasterData(null);
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

      Number(formData.TermsAndConditionsMasterId) === 0 ? 'Add T&C' : 'Update T&C'
    )

  };

  //#endregion

  //#region DELETE TNC MASTER

  const handleDeleteTncMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteTncMasterDetailsData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteTncMasterRequest = {
          TermsAndConditionsMasterId: deleteTncMasterDetailsData.TermsAndConditionsMasterId ?? 0,
          UniqueKey: deleteTncMasterDetailsData.Uniquekey ?? ""
        }

        const response = await tncMasterService.apiCallDeleteTncMaster(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (tncList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });

          await loadTnc(pageToShow, filters, sortInfo);

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
      'Delete T&C'
    )
  }

  //#endregion

  return (

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>
      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Title"
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchTnc}
        isShowFilterButton={false}
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton={false}
        onCustomize={() => setIsShowCustomizeTncColumnsModal(true)}
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddTncModal}
        isShowImportButton={false}
        isShowExportButton={canExport && tncListForTable.length > 0}
        onExportExcel={handleExportTncExcel}
        onExportPdf={handleExportTncPdf}
        exportLoading={isLoading}
      />

      <Tabs
        tabs={tncTabList}
        defaultActive={activeTab}
        islarge={true}
        onTabChange={(t) => {
          setActiveTab(t.id);

          const newFilters: FilterInfo = {
            ...filters,
            ModuleName: t.id,
          };

          loadTnc(1, newFilters, sortInfo);

        }}
      />
      <div className='pt-5'>
        <DataTable
          data={tncListForTable}
          columns={visibleTncColumns}
          pagination={tncPaginationInfo}
          emptyMessage="No terms & conditions found"
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
      </div>
      {/*  ADD EDIT UPDATE TNC MODAL */}

      <Modal
        isOpen={isAddUpdateModalOpen}
        onClose={() => {
          setIsAddUpdateModalOpen(false);
          setEditingTncMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        onCancel={() => {
          setIsAddUpdateModalOpen(false);
          setEditingTncMasterData(null);
          setFormData(initialFormState());
          setErrors({});
        }}
        title={editingTncMasterData ? 'Update Terms & conditions' : 'Add Terms & conditions'}
        onSubmit={handleAddUpdateTncMaster}
        saveText={editingTncMasterData ? 'Update' : 'Add'}
        loading={isLoading}
        size='large-half'
      >
        <div className="space-y-6 p-6  bg-blue-100">
          <div className="space-y-4">
            <div>

              <Input
                label='Title'
                type="text"
                required
                value={formData.Title}
                error={errors.Title}
                onChange={(e) => handleFieldChange('Title', e.target.value)}
                placeholder="Enter Title"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.Description}
                onChange={(html) => handleFieldChange('Description', html)}
                placeholder="Enter Description"
              />
              {errors.Description && (
                <p className="text-red-500 text-sm mt-1">{errors.Description}</p>
              )}
            </div>

          </div>
        </div>
      </Modal>

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
        title="Customize Table Columns"
      />
      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Terms & Conditions Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}
        size="half-screen"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>

              <Input
                label="Module Name"
                type="text"
                value={tempFilters.ModuleName || ''}
                onChange={e => handleFilterChange('ModuleName', e.target.value)}
                placeholder="Enter Module Name"
              />
            </div>
            <div>
              <Input
                label="Title"
                type="text"
                value={tempFilters.Title || ''}
                onChange={e => handleFilterChange('Title', e.target.value)}
                placeholder="Enter Title"
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION TNC MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteTncMasterDetailsData(null)
        }}
        onConfirm={handleDeleteTncMaster}
        loading={isLoading}
        pageName='tnc'
      />
    </div>
  );
};

export default TncMaster;


