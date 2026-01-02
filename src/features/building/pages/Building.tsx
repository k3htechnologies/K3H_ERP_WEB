import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { BuildingData, DeleteBuildingRequest, FilterWithPaginationBuildingRequest } from '@/features/building/models/BuildingModel';
import { buildingService } from '@/features/building/services/BuildingService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import { FileText, Info, Trash2 } from 'lucide-react';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import { useBuildingListState } from '@/features/building/context/BuildingListStateContext';

export const Building: React.FC = () => {
  //#region STATE
  const [buildingList, setBuildingList] = useState<BuildingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeBuildingColumnsModal, setIsShowCustomizeBuildingColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteBuildingData, setDeleteBuildingData] = useState<BuildingData | null>(null)

  //#endregion

  //#region PROJECT SELECTION GET ID
  const { projectId } = useProject()
  //#endregion

  //#region BUILDING LIST STATE CONTEXT
  const { listState, updateListState, resetFilters, clearBuildingContext } = useBuildingListState();

  const { page, filters, sortInfo, searchTerm } = listState;
  //#endregion

  //#region DATA LOAD BUILDING

  const loadBuildings = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;

        if (sortInfo) {
          const column = buildingColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationBuildingRequest = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          BuildingId: filterParams.BuildingId ? Number(filterParams.BuildingId) : undefined,
          ProjectId: projectId ?? undefined,
          BuildingName: filterParams.BuildingName?.trim() || undefined,
          CTSNumber: filterParams.CTSNumber?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await buildingService.apiCallPullBuilding(params);

        if (E.isRight(response)) {

          setBuildingList(response.right.Data);

          setPagination({
            currentPage: pageNum,
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
      'Loading Building'
    );
  };

  //#endregion

  //#region INIT
  useEffect(() => {

    if (!projectId) return;

    clearBuildingContext();

    if (searchTerm && searchTerm.trim()) {

      loadBuildings(page, { BuildingName: searchTerm.trim() }, sortInfo);

    } else {

      loadBuildings(page, filters, sortInfo);

    }
  }, [projectId, page, filters, sortInfo, searchTerm, clearBuildingContext]);


  useEffect(() => {

    setPagination({ currentPage: page });

  }, [page]);

  useEffect(() => {

    setTempFilters(filters);

  }, [filters]);

  //#endregion

  //#region SEARCH BUILDING FILTER

  const debouncedSearch = useDebouncedCallback((value: string, isSerach: boolean = true) => {

    let filterParams: FilterInfo = {};

    if (value.trim() === '') {

      updateListState({ searchTerm: '', filters: {}, page: 1 });

      return;
    }

    if (isSerach) {

      filterParams = { BuildingName: value.trim() };
    }

    updateListState({ searchTerm: value, filters: filterParams, page: 1 });

  }, 350);

  const searchBuildings = (searchValue: string) => {

    updateListState({ searchTerm: searchValue });

    debouncedSearch(searchValue, false);
  };

  //#endregion

  //#region CLEAR SEARCH BUILDING
  const clearSearchBuildings = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  //#endregion

  //#region  EXCEL EXPORT TO EXCEL | PDF
  const handleExportBuildings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam: string | undefined;
        if (sortInfo) {
          const column = buildingColumns.find(col => col.key === sortInfo.column);
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`;
          }
        }

        const params: FilterWithPaginationBuildingRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: projectId ?? undefined,
          BuildingName: filters.BuildingName?.trim() || undefined,
          CTSNumber: filters.CTSNumber?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        };

        const response = await buildingService.apiCallPullBuilding(params);

        handleExportFile(response, exportType, 'Building Master', addToast);

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

  const handleExportBuildingExcel = () => handleExportBuildings('Excel');
  const handleExportBuildingPdf = () => handleExportBuildings('PDF');

  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((newPage: number) => {
    updateListState({ page: newPage });
  }, [updateListState]);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
  }, [updateListState]);

  const buildingPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize]
  );

  const buildingsForTable = useMemo(() => buildingList, [buildingList]);
  //#endregion

  //#region VIEW BUILDING DETAILS
  const handleViewBuildingDetails = useCallback((row: BuildingData) => {
    updateListState({
      buildingId: row.BuildingId,
      buildingName: row.BuildingName,
    });
    navigate('/building/view');
  }, [navigate, updateListState]);
  //#endregion

  //#region VIEW BUILDING DOCUMENT
  const handleViewBuildingDocument = useCallback((row: BuildingData) => {
    updateListState({
      buildingId: row.BuildingId,
      buildingName: row.BuildingName,
    });
    navigate('/building/document');
  }, [navigate, updateListState]);
  //#endregion

  //#region VIEW BUILDING DESCRIPTION
  const handleViewBuildingDescription = useCallback((row: BuildingData) => {
    updateListState({
      buildingId: row.BuildingId,
      buildingName: row.BuildingName,
    });
    navigate('/building/description');
  }, [navigate, updateListState]);
  //#endregion

  //#region CONFIRMATION DIALOG BOX

  const handleConfirmationDialogBoxOpen = useCallback((row: BuildingData) => {
    setDeleteBuildingData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN
  const buildingColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'BuildingName',
        label: 'Building Name',
        width: '22',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <TooltipText
                  text={value || 'N/A'}
                  maxWidth="260px"
                  tooltipThreshold={26}
                  onClick={() => handleViewBuildingDetails(row)}
                />
              </div>
            </div>

          </div>
        )
      },
      {
        key: 'CTSNumber',
        label: 'CTS Number',
        width: '18',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="220px" tooltipThreshold={22} />
        )
      },
      {
        key: 'RoadWidth',
        label: 'Road Width',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },

      {
        key: 'TotalPlotAreaSqFt',
        label: 'Total Plot Area (SqFt)',
        width: '18',
        sortable: true,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'TotalNumberOfUnits',
        label: 'Total Units',
        width: '18',
        sortable: true,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'NumberOfFloors',
        label: 'Floors',
        width: '12',
        sortable: true,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'LandOwnershipType',
        label: 'Land Ownership',
        width: '18',
        sortable: false,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="200px" tooltipThreshold={20} />
        )
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },
      {
        key: 'IsReligiousStructure',
        label: 'Is Religious',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => (value ? 'Yes' : 'No')
      },
      {
        key: 'IsGarden',
        label: 'Is Garden',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => (value ? 'Yes' : 'No')
      },
      {
        key: 'IsLitigation',
        label: 'Litigation',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => (value ? 'Yes' : 'No')
      },
      {
        key: 'actions',
        label: 'Actions',
        width: '12',
        fixed: 'right',
        align: 'center',
        render: (_value, row) => (
          canAction ? (
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
                title="Delete Vendor"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewBuildingDescription(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'blue',
                  padding: '4px 8px'
                }}
                title="Building Details"
              >
                <Info className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewBuildingDocument(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'green',
                  padding: '4px 8px'
                }}
                title="Building Document"
              >
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          ) : null


        )
      }
    ],
    [canAction, handleViewBuildingDetails, handleViewBuildingDocument, handleConfirmationDialogBoxOpen]
  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredBuildingColumnKeys: string[] = ['BuildingName'];

  const allBuildingColumnKeys: string[] = buildingColumns.map(c => c.key);

  const [selectedBuildingColumnKeys, setSelectedBuildingColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getRedevelopmentBuildingTableColumns?.();
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const withRequired = Array.from(new Set([...parsed, ...requiredBuildingColumnKeys]));
        return withRequired.filter(k => allBuildingColumnKeys.includes(k));
      }
    } catch {
      // ignore
    }
    return allBuildingColumnKeys;
  });

  useEffect(() => {
    setSelectedBuildingColumnKeys(prev =>
      Array.from(new Set([...prev, ...requiredBuildingColumnKeys])).filter(k =>
        allBuildingColumnKeys.includes(k)
      )
    );

  }, [buildingColumns.length]);

  const visibleBuildingColumns = useMemo(
    () => buildingColumns.filter(col => selectedBuildingColumnKeys.includes(col.key)),
    [buildingColumns, selectedBuildingColumnKeys]
  );
  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region  DELETE VENDOR EVENT
  const handleDeleteBuilding = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBuildingData) return

    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        const params: DeleteBuildingRequest = {
          BuildingId: deleteBuildingData.BuildingId,
          UniqueKey: deleteBuildingData.Uniquekey ?? "",
          ProjectId: Number(projectId)
        }

        const response = await buildingService.apiCallDeleteBuilding(params);

        if (E.isRight(response)) {

          setBuildingList(prevData => prevData.filter(item => item.BuildingId !== deleteBuildingData.BuildingId));

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize)
          });
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] })

          setIsConfirmationDialogBoxOpen(false);

          setDeleteBuildingData(null);

        } else {

          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);

        }

        return response
      },
      undefined,
      (error: unknown) => {
        const err = error as { message?: string };
        addToast({ type: 'error', title: err.message || 'An error occurred' })
      },
      undefined,
      'Delete Building'
    )
  }

  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Building Name"
        onSearchChange={searchBuildings}
        onClearSearch={clearSearchBuildings}
        isShowFilterButton
        filters={filters}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton
        onCustomize={() => setIsShowCustomizeBuildingColumnsModal(true)}
        // ADD
        isShowAddButton={canAction && Number(projectId) > 0}
        addTitle="Add"
        onAdd={() => navigate('/building/add')}
        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={canExport && buildingsForTable.length > 0}
        onExportExcel={handleExportBuildingExcel}
        onExportPdf={handleExportBuildingPdf}
        exportLoading={isLoading}
      />

      <DataTable
        data={buildingsForTable}
        columns={visibleBuildingColumns}
        pagination={buildingPaginationInfo}
        emptyMessage="No Buildings Data Found"
        fixedHeight
        recordsPerPage={20}
        className="flex-1"
        sortInfo={sortInfo}
        onSort={handleSortColumn}
      />

      <CustomizeColumnsModal
        isOpen={isShowCustomizeBuildingColumnsModal}
        onClose={() => setIsShowCustomizeBuildingColumnsModal(false)}
        onApply={keys => {
          const withRequired = Array.from(new Set([...keys, ...requiredBuildingColumnKeys]));
          setSelectedBuildingColumnKeys(withRequired);
          try {
            LocalStorageHelper.storeRedevelopmentBuildingTableColumns?.(JSON.stringify(withRequired));
          } catch {
            // ignore
          }
        }}
        columns={buildingColumns}
        selectedKeys={selectedBuildingColumnKeys}
        requiredKeys={requiredBuildingColumnKeys}
        title="Customize Table Columns"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <ConfirmationDialogBox
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteBuildingData(null)
        }}
        onConfirm={handleDeleteBuilding}
        title="You are about to delete a building?"
        message="Deleting this building will permanently remove its contents."
        confirmText="Delete"
        cancelText="Cancel"
        loading={isLoading}
        variant="danger"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Building"
        onSubmit={e => {
          e.preventDefault();
          updateListState({ filters: tempFilters, page: 1 });
          setShowFilterPopup(false);
        }}
        saveText="Apply Filter"
        cancelText="Clear Filter"
        onCancel={() => {
          setTempFilters({});
          resetFilters();
          setShowFilterPopup(false);
        }}

        resetText=''
        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>

              <Input
                label='Building Name'
                type="text"
                value={tempFilters.BuildingName || ''}
                onChange={e => handleFilterChange('BuildingName', e.target.value)}
                placeholder="Enter building name"
              />
            </div>

            <div>

              <Input
                label='CTS Number'
                type="text"
                value={tempFilters.CTSNumber || ''}
                onChange={e => handleFilterChange('CTSNumber', e.target.value)}
                placeholder="Enter CTS number"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default Building;
