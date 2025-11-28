import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { ToastContainer } from '@/ui/components/Toast';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProjectMasterData,
  FilterWithPaginationProjectMasterRequest,
} from '@/features/projectMaster/models/ProjectMasterModel';

import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useLocation, type Location, useNavigate } from 'react-router-dom';
import { updateFilter } from '@/core/utils/filterHelper';
import ImageCarousel from '@/ui/components/ImageViewer/ImageCarousel';

export const ProjectMaster: React.FC = () => {

  //#region STATE
  const [projectMasterList, setProjectMasterList] = useState<ProjectMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setIsLoadingMessage] = useState('');
  const navigate = useNavigate();

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  //TABLE SORT INFO
  const [sortInfo, setSortInfo] = useState<SortInfo | undefined>();

  // TOAST
  const { toasts, removeToast, addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const [searchTerm, setSearchTerm] = useState('')

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchProjects(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filters, setFilters] = useState<FilterInfo>({});
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectMasterColumnsModal, setIsShowCustomizeProjectMasterColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region STATE CREATED PAGE AFTER NAVIGATE VIEW OR ADD UPDATE PAGE THEN CHECK

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

      loadProjects(listState.page ?? 1, { ProjectName: String(listState.searchTerm).trim() });

      return;
    }


    loadProjects(listState.page ?? 1, listState.filters ?? {});

  }, [location.state]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchProjectList = async (page: number = pagination.currentPage) => {
    return await loadProjects(page, filters);
  }

  const loadProjects = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {

        let sortByParam = undefined;
        if (sortInfo) {
          const column = projectMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsProjectAccess: true,
          ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
          ProjectName: filterParams.ProjectName?.trim() || undefined,
          ProjectLocation: filterParams.ProjectLocation?.trim() || undefined,
          CTCNumber: filterParams.CTCNumber?.trim() || undefined,
          SortBy: sortByParam
        }

        const response = await getProjects(params);

        if (E.isRight(response)) {

          setProjectMasterList(response.right.Data);

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
      'Loading Project Data'
    )
  }

  //#endregion

  //#region SERACH PROJECT
  const searchProjects = async (searchValue: string) => {

    setSearchTerm(searchValue);

    if (searchValue.trim() === '') {
      fetchProjectList();
      return;
    }

    const filterParams: FilterInfo = {
      ProjectName: searchValue.trim()
    };

    await loadProjects(1, filterParams);
  }
  //#endregion

  //#region CLAER SERACH PROJECT
  const clearsearchProjects = () => {
    setSearchTerm('');

    debouncedSearch.cancel?.();

    setFilters({});
    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadProjects(1, {});
    try {
      navigate(location.pathname, { replace: true, state: {} });
    } catch {
    }
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportProjects = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setIsLoadingMessage,
      async () => {
        let sortByParam = undefined
        if (sortInfo) {
          const column = projectMasterColumns.find(col => col.key === sortInfo.column)
          if (column) {
            sortByParam = `${column.label} ${sortInfo.direction.toUpperCase()}`
          }
        }
        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsProjectAccess: true,
          ProjectName: filters.ProjectName?.trim() || undefined,
          ProjectLocation: filters.ProjectLocation?.trim() || undefined,
          CTCNumber: filters.CTCNumber?.trim() || undefined,
          SortBy: sortByParam,
          ExportType: exportType
        }
        const response = await getProjects(params);
        handleExportFile(response, exportType, 'Project Master', addToast)
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

  const handleExportProjectExcel = () => handleExportProjects('Excel')
  const handleExportProjectPdf = () => handleExportProjects('PDF')
  //#endregion

  //#region GET PROJECT MASTER DATA FROM API
  const getProjects = async (filterParams: FilterWithPaginationProjectMasterRequest) => {
    return await ProjectMasterService.apiCallPullProjectMaster(filterParams);
  }
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    fetchProjectList(page);
  }, []);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    setSortInfo(sort);
    fetchProjectList(1);
  }, []);

  const projectMasterPaginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange
    }),
    [pagination.currentPage, pagination.totalPages, pagination.totalRecords, pagination.pageSize, handlePageChange]
  )

  const projectListForTable = useMemo(() => projectMasterList, [projectMasterList]);

  //#endregion

  //#region VIEW PROJECT MASTER DETAILS
  const handleViewProjectDetails = useCallback((row: ProjectMasterData) => {
    navigate('/projectMaster/view', {
      state: {
        editProjectMasterData: row,
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

  //#region TABLE COLUMN

  const projectMasterColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'ProjectName',
        label: 'Project Name',
        width: '25',
        sortable: true,
        fixed: 'left',
        align: 'left',
        render: (value, row) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || '-'}
              maxWidth="250px"
              tooltipThreshold={25}
              onClick={() => handleViewProjectDetails(row)}
            />
          </div>
        )
      },
      {
        key: 'ProjectLocation',
        label: 'Project Location',
        width: '18',
        sortable: false,
        align: 'left',
        render: (value) => (
          <TooltipText
            text={value || '-'}
            maxWidth="180px"
            tooltipThreshold={18}
          />
        )
      },
      {
        key: 'CTSNumber',
        label: 'CTS Number',
        width: '15',
        sortable: false,
        align: 'center',
         render: (value) => (
          <div className="flex items-center justify-start">
            <TooltipText
              text={value || '-'}
              maxWidth="150px"
              tooltipThreshold={15}
            />
          </div>
        )
      },
      {
        key: 'BussinessCategory',
        label: 'Business Category',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'ProjectStatus',
        label: 'Project Status',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'StateName',
        label: 'State',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value || '-'
      }
    ],
    [handleViewProjectDetails]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS

  const requiredProjectMasterColumnKeys: string[] = ['ProjectName'];

  const [selectedProjectMasterColumnKeys, setSelectedProjectMasterColumnKeys] = useState<string[]>([]);

  useEffect(() => {

    if (projectMasterColumns.length === 0) return;

    try {
      const saved = localStorage.getItem('projectMasterTableColumns');
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        const filtered = parsed.filter(k =>
          projectMasterColumns.some(col => col.key === k)
        );
        const final = Array.from(
          new Set([
            ...filtered,
            ...requiredProjectMasterColumnKeys,
          ])
        );
        setSelectedProjectMasterColumnKeys(final);
        return;
      }
    } catch { }

    const allKeys = projectMasterColumns.map(c => c.key);
    const final = Array.from(
      new Set([...allKeys, ...requiredProjectMasterColumnKeys])
    );
    setSelectedProjectMasterColumnKeys(final);
  }, [projectMasterColumns]);

  const visibleProjectMasterColumns = useMemo(
    () => projectMasterColumns.filter(col =>
      selectedProjectMasterColumnKeys.includes(col.key)
    ),
    [projectMasterColumns, selectedProjectMasterColumnKeys]
  );

  //#endregion

  //#region FILTER HELPERS
  const applyFilters = () => {
    setFilters(tempFilters)
    loadProjects(1, tempFilters)
    setShowFilterPopup(false)
  }

  const clearFilters = () => {
  setTempFilters({});
  setFilters({});

  // reset page
  setPagination({ currentPage: 1 });

  // load empty filters
  loadProjects(1, {});

  setShowFilterPopup(false);

  // clear router state (very important)
  navigate(location.pathname, { replace: true, state: {} });
};


  //#endregion

  //#region  HANDLE CHANGE EVENT

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters(prev => updateFilter(prev, key, value));
  };

  //#endregion

  //#region ADD PROJECT THEN NAVIGATE
  const handleAddProjectMasterModal = () => {
    navigate('/projectMaster/add');
  };
  //#endregion

  return (
    <>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
        <TableActionToolbar
          isShowSearchBar
          searchTerm={searchTerm}
          searchPlaceholder="Search By Project Name..."
          onSearchChange={(v) => {
            setSearchTerm(v)
            debouncedSearch(v)
          }}
          onClearSearch={clearsearchProjects}
          isShowFilterButton
          filters={filters}
          onOpenFilter={() => {
            setTempFilters(filters)
            setShowFilterPopup(true)
          }}
          isShowCustomizeButton
          onCustomize={() => setIsShowCustomizeProjectMasterColumnsModal(true)}

          // ADD
          isShowAddButton={canAction}
          addTitle="Add Project"
          onAdd={handleAddProjectMasterModal}

          // IMPORT 
          isShowImportButton={canAction}

          // EXPORT
          isShowExportButton={canExport}
          onExportExcel={handleExportProjectExcel}
          onExportPdf={handleExportProjectPdf}
          exportLoading={isLoading}
        />
        <DataTable
          data={projectListForTable}
          columns={visibleProjectMasterColumns}
          pagination={projectMasterPaginationInfo}
          emptyMessage="No projects found"
          fixedHeight={true}
          recordsPerPage={20}
          className="flex-1"
          sortInfo={sortInfo}
          onSort={handleSortColumn}
        />

        <CustomizeColumnsModal
          isOpen={isShowCustomizeProjectMasterColumnsModal}
          onClose={() => setIsShowCustomizeProjectMasterColumnsModal(false)}
          onApply={(keys) => {
            const withRequired = Array.from(
              new Set([...keys, ...requiredProjectMasterColumnKeys])
            );
            setSelectedProjectMasterColumnKeys(withRequired);
            try {

              localStorage.setItem('projectMasterTableColumns', JSON.stringify(withRequired));
            } catch { }
          }}
          columns={projectMasterColumns}
          selectedKeys={selectedProjectMasterColumnKeys}
          requiredKeys={requiredProjectMasterColumnKeys}
          title="Customize Table Columns"
        />

        <Modal
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          title="Filter - Project Master"
          onSubmit={(e) => {
            e.preventDefault()
            applyFilters()
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
                  label='Project Name'
                  type="text"
                  value={tempFilters.ProjectName || ''}
                  onChange={(e) => handleFilterChange('ProjectName', e.target.value)}
                  placeholder="Enter Project Name"
                />
              </div>
              <div>
                <Input
                  label='Project Location'
                  type="text"
                  value={tempFilters.ProjectLocation || ''}
                  onChange={(e) => handleFilterChange('ProjectLocation', e.target.value)}
                  placeholder="Enter Project Location"
                />
              </div>
              <div>
                <Input
                  label='CTS Number'
                  type="text"
                  value={tempFilters.CTCNumber || ''}
                  onChange={(e) => handleFilterChange('CTCNumber', e.target.value)}
                  placeholder="Enter CTS Number"
                />
              </div>
            </div>
          </div>
        </Modal>


      </div>
    </>
  )
}

export default ProjectMaster

