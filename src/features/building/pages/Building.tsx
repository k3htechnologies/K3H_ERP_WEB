import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type { BuildingData, FilterWithPaginationBuildingRequest } from '@/features/building/models/BuildingModel';
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
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { Button, Input } from '@/ui/components/forms';
import { updateFilter } from '@/core/utils/filterHelper';
import { FileText, Info } from 'lucide-react';
import { useProject } from '@/features/projectMaster/context/ProjectContext';

export const Building: React.FC = () => {
  //#region STATE
  const [buildingList, setBuildingList] = useState<BuildingData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  const { addToast } = useToast();

  const { projectId } = useProject()

  const [searchTerm, setSearchTerm] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchBuildings(value);
  }, 350);

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isShowCustomizeBuildingColumnsModal, setIsShowCustomizeBuildingColumnsModal] = useState(false);

  const { canAction, canExport } = useMenuPermissions();

  const location = useLocation() as Location & {
    state?: {
      listState?: {
        page?: number;
        filters?: FilterInfo;
        sortInfo?: SortInfo;
        searchTerm?: string;
      };
    };
  };

  //#endregion

  //#region INIT
  useEffect(() => {

    if (!projectId) return;

    const incoming = location.state?.listState as
      | { page?: number; filters?: FilterInfo; sortInfo?: SortInfo; searchTerm?: string }
      | undefined;

    const listState = incoming ?? { page: 1, filters: {} as FilterInfo, sortInfo: undefined, searchTerm: '' };

    setPagination({ currentPage: listState.page ?? pagination.currentPage });

    setSortInfo(listState.sortInfo);

    setFilters(listState.filters ?? {});

    setTempFilters(listState.filters ?? {});

    setSearchTerm(listState.searchTerm ?? '');

    if (listState.searchTerm && String(listState.searchTerm).trim()) {

      setSearchTerm(String(listState.searchTerm));

      loadBuildings(listState.page ?? 1, { BuildingName: String(listState.searchTerm).trim() });

      return;
    }

    loadBuildings(listState.page ?? 1, listState.filters ?? {});
  }, [location.state, projectId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  
  useEffect(() => {
    if (!projectId) return;
    setFilters({});
    setTempFilters({});
  }, [projectId]);

  //#endregion

  //#region DATA LOAD
  const fetchBuildingList = async (page: number = pagination.currentPage) => {
    return await loadBuildings(page, filters);
  };

  const loadBuildings = async (page: number, filterParams: FilterInfo) => {
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
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          BuildingId: filterParams.BuildingId ? Number(filterParams.BuildingId) : undefined,
          ProjectId: projectId ?? undefined,
          BuildingName: filterParams.BuildingName?.trim() || undefined,
          CTSNumber: filterParams.CTSNumber?.trim() || undefined,
          SortBy: sortByParam
        };

        const response = await getBuildings(params);

        if (E.isRight(response)) {
          setBuildingList(response.right.Data);
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
      'Loading Building Data'
    );
  };

  //#endregion

  //#region SEARCH BUILDING FILTER
  const searchBuildings = async (searchValue: string) => {
    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchBuildingList();
      return;
    }

    const filterParams: FilterInfo = {
      BuildingName: searchValue.trim()
    };

    await loadBuildings(1, filterParams);
  };

  //#endregion

  //#region CLAER SERACH BUILDING
  const clearSearchBuildings = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadBuildings(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
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

        const response = await getBuildings(params);

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

  //#region PULL BUILDING MASTER
  const getBuildings = async (filterParams: FilterWithPaginationBuildingRequest) => {
    return await buildingService.apiCallPullBuilding(filterParams);
  };
  //#endregion

  //#region TABLE CONFIG
  const handlePageChange = useCallback((page: number) => {
    fetchBuildingList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchBuildingList(1);
  }, []);

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

  //#region VIEW BUILDING MASTER

  const handleViewBuildingDetails = useCallback((row: BuildingData) => {
    navigate('/building/view', {
      state: {
        editBuildingData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
  //#endregion

  //#region VIEW BUILDING DOCUMENT

  const handleViewBuildingDocument = useCallback((row: BuildingData) => {
    navigate('/building/document', {
      state: {
        editBuildingData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          buildingId: row.BuildingId,
          projectId: row.ProjectId,
          buildingName: row.BuildingName,

        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
  //#endregion

  //#region VIEW BUILDING DOCUMENT

  const handleViewBuildingDescription = useCallback((row: BuildingData) => {
    navigate('/building/description', {
      state: {
        editBuildingData: row,
        fromList: true,
        listState: {
          page: pagination.currentPage,
          filters,
          sortInfo,
          searchTerm,
          buildingId: row.BuildingId,
          projectId: row.ProjectId,
          buildingName: row.BuildingName,

        },
      },
    });
  }, [navigate, pagination.currentPage, filters, sortInfo, searchTerm]);
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
        label: 'Total Plot Area (sqft)',
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
    [canAction, handleViewBuildingDetails, handleViewBuildingDocument]
  );
  //#endregion

  //#region CUSTOMIZE COLUMNS
  const requiredBuildingColumnKeys: string[] = ['BuildingName'];

  const allBuildingColumnKeys: string[] = buildingColumns.map(c => c.key);

  const [selectedBuildingColumnKeys, setSelectedBuildingColumnKeys] = useState<string[]>(() => {
    try {
      const saved = LocalStorageHelper.getEmployeeMasterTableColumns?.();
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

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters);
    loadBuildings(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    setFilters({});

    // reset page
    setPagination({ currentPage: 1 });

    // load empty filters
    loadBuildings(1, {});

    setShowFilterPopup(false);

    // clear router state (very important)
    navigate(location.pathname, { replace: true, state: {} });
  };
  //#endregion

  //#region ADD NEW BUILDING
  const handleAddBuildingModal = () => {
    navigate('/building/add');
  };
  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

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
        onSearchChange={v => {
          setSearchTerm(v);
          debouncedSearch(v);
        }}
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
        isShowAddButton={canAction}
        addTitle="Add"
        onAdd={handleAddBuildingModal}

        // IMPORT
        isShowImportButton={false}

        // EXPORT
        isShowExportButton={canExport}
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
            LocalStorageHelper.storeEmployeeMasterTableColumns?.(JSON.stringify(withRequired));
          } catch {
            // ignore
          }
        }}
        columns={buildingColumns}
        selectedKeys={selectedBuildingColumnKeys}
        requiredKeys={requiredBuildingColumnKeys}
        title="Customize Table Columns"
      />

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Building Master"
        onSubmit={e => {
          e.preventDefault();
          applyFilters();
        }}
        saveText="Apply Filter"
        cancelText="Clear Filter"
        onCancel={() => clearFilters()}
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
    </div>
  );
};

export default Building;
