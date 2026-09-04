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
import { useBuildingListState } from '@/features/building/context/BuildingListStateContext';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';

export const Building: React.FC = () => {
  const [buildingList, setBuildingList] = useState<BuildingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeBuildingColumnsModal, setIsShowCustomizeBuildingColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false)

  const [deleteBuildingData, setDeleteBuildingData] = useState<BuildingData | null>(null)

  const { projectId } = useProject()
  const { listState, updateListState, resetFilters, clearBuildingContext } = useBuildingListState();

  const { page, filters, sortInfo, searchTerm } = listState;
  

  const loadBuildings = async (pageNum: number, filterParams: FilterInfo, sortInfo?: SortInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationBuildingRequest = {
          PageNumber: pageNum,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          BuildingId: filterParams.BuildingId ? Number(filterParams.BuildingId) : undefined,
          ProjectId: projectId ?? undefined,
          BuildingName: filterParams.BuildingName?.trim() || undefined,
          CTSNumber: filterParams.CTSNumber?.trim() || undefined,
          RoadWidth: filterParams.RoadWidth?.trim() || undefined,
          CityName: filterParams.CityName?.trim() || undefined,
          VillageName: filterParams.VillageName?.trim() || undefined,
          WardName: filterParams.WardName?.trim() || undefined,
          Category: filterParams.Category?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, buildingColumns)
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

  const clearSearchBuildings = () => {
    debouncedSearch.cancel?.();
    resetFilters();
    setTempFilters({});
  };

  const handleExportBuildings = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {


        const params: FilterWithPaginationBuildingRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsCheckPermission: true,
          ProjectId: projectId ?? undefined,
          BuildingName: filters.BuildingName?.trim() || undefined,
          CTSNumber: filters.CTSNumber?.trim() || undefined,
          RoadWidth: filters.RoadWidth?.trim() || undefined,
          CityName: filters.CityName?.trim() || undefined,
          VillageName: filters.VillageName?.trim() || undefined,
          WardName: filters.WardName?.trim() || undefined,
          Category: filters.Category?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, buildingColumns),
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
  
  const handleViewBuildingDetails = useCallback((row: BuildingData) => {
    updateListState({
      buildingId: row.BuildingId,
      buildingName: row.BuildingName,
    });
    navigate('/building/view');
  }, [navigate, updateListState]);
  
  const handleViewBuildingDocument = useCallback((row: BuildingData) => {
    updateListState({
      buildingId: row.BuildingId,
      buildingName: row.BuildingName,
    });
    navigate('/building/document');
  }, [navigate, updateListState]);
 
  const handleViewBuildingDescription = useCallback((row: BuildingData) => {
    updateListState({
      buildingId: row.BuildingId,
      buildingName: row.BuildingName,
    });
    navigate('/building/description');
  }, [navigate, updateListState]);
  

  const handleConfirmationDialogBoxOpen = useCallback((row: BuildingData) => {
    setDeleteBuildingData(row)
    setIsConfirmationDialogBoxOpen(true)
  }, [])

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
                  text={value || '-'}
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
        key: 'Category',
        label: 'Category',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'CTSNumber',
        label: 'CTS Number',
        width: '18',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || '-'} maxWidth="220px" tooltipThreshold={22} />
        )
      },
      {
        key: 'RoadWidth',
        label: 'Road Width',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'TotalPlotAreaSqMt',
        label: 'Total Plot Area (SqMt)',
        width: '18',
        sortable: false,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'TotalPlotAreaSqFt',
        label: 'Total Plot Area (SqFt)',
        width: '18',
        sortable: false,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'NumberOfWings',
        label: 'Wings',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'TotalNumberOfUnits',
        label: 'Total Units',
        width: '18',
        sortable: false,
        align: 'center',
        render: value => value ?? '-'
      },
      {
        key: 'NumberOfFloors',
        label: 'Floors',
        width: '12',
        sortable: false,
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
          <TooltipText text={value || '-'} maxWidth="200px" tooltipThreshold={20} />
        )
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || '-'
      },
      {
        key: 'VillageName',
        label: 'Village',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'WardName',
        label: 'Ward',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'IsReligiousStructure',
        label: 'Religious',
        width: '12',
        sortable: false,
        align: 'center',
        render: value => (value ? 'Yes' : 'No')
      },
      {
        key: 'IsGarden',
        label: 'Garden',
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
                title="Delete Building"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null


        )
      }
    ],
    [canAction, handleViewBuildingDetails, handleViewBuildingDocument, handleConfirmationDialogBoxOpen]
  );
  
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

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  const handleDeleteBuilding = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteBuildingData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: DeleteBuildingRequest = {
          BuildingId: deleteBuildingData.BuildingId,
          UniqueKey: deleteBuildingData.Uniquekey ?? "",
          ProjectId: Number(projectId)
        }

        const response = await buildingService.apiCallDeleteBuilding(params);

        if (E.isRight(response)) {

          const newTotalRecords = pagination.totalRecords - 1;

          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));

          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          }

          else if (buildingList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: newTotalPages
          });

          await loadBuildings(pageToShow, filters, sortInfo);

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
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
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false)
          setDeleteBuildingData(null)
        }}
        onConfirm={handleDeleteBuilding}
        loading={isLoading}
        pageName='building'
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
        saveText="Apply "
        cancelText="Clear"
        onCancel={() => {
          setTempFilters({});
          resetFilters();
          setShowFilterPopup(false);
        }}


        size="small-half"
      >
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <Input
                label='Category'
                type="text"
                value={tempFilters.Category || ''}
                onChange={e => handleFilterChange('Category', e.target.value)}
                placeholder="Enter Category"
              />
            </div>
            <div>

              <Input
                label='Building Name'
                type="text"
                value={tempFilters.BuildingName || ''}
                onChange={e => handleFilterChange('BuildingName', e.target.value)}
                placeholder="Enter Building name"
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
            <div>

              <Input
                label='Road Width'
                type="text"
                value={tempFilters.RoadWidth || ''}
                onChange={e => handleFilterChange('RoadWidth', e.target.value)}
                placeholder="Enter Road Width"
              />
            </div>
            <div>

              <Input
                label='City'
                type="text"
                value={tempFilters.CityName || ''}
                onChange={e => handleFilterChange('CityName', e.target.value)}
                placeholder="Enter City"
              />
            </div>
            <div>

              <Input
                label='Village'
                type="text"
                value={tempFilters.VillageName || ''}
                onChange={e => handleFilterChange('VillageName', e.target.value)}
                placeholder="Enter Village"
              />
            </div>
            <div>
              <Input
                label='Ward'
                type="text"
                value={tempFilters.WardName || ''}
                onChange={e => handleFilterChange('WardName', e.target.value)}
                placeholder="Enter Ward"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default Building;
