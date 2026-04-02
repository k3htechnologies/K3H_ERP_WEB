import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { usePagination } from '@/core/hooks/usePagination';
import { DataTable, type FilterInfo, type PaginationInfo, type SortInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import type {
  ProjectMasterData,
  FilterWithPaginationProjectMasterRequest,
} from '@/features/projectMaster/models/ProjectMasterModel';

import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService'
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { Modal } from '@/ui/components/Modal/Modal';
import { Button, Input } from '@/ui/components/forms';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import CustomizeColumnsModal from '@/ui/components/CustomizeColumns/CustomizeColumnsModal';
import { useNavigate } from 'react-router-dom';
import { useProjectMasterListState } from '@/features/projectMaster/context/ProjectMasterListStateContext';
import { updateFilter } from '@/core/utils/filterHelper';
import { BanknoteXIcon, Building2Icon, CheckCircle, User2 } from 'lucide-react';
import { getSortByParam } from '@/core/constants/sortingColumnDetails';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { PROJECT_SCHEME, PROJECT_STATUS_OPTIONS, PROJECT_SUB_SCHEME_BMC, PROJECT_SUB_SCHEME_MHADA, PROJECT_SUB_SCHEME_SRA } from '@/core/constants';
import ToggleSwitch from '@/ui/components/forms/ToggleSwitch';

export const ProjectMaster: React.FC = () => {

  //#region STATE
  const [projectMasterList, setProjectMasterList] = useState<ProjectMasterData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const navigate = useNavigate();
  const { listState, updateListState } = useProjectMasterListState();
  const { searchTerm, filters, sortInfo } = listState;

  // PAGINATION STATE
  const { pagination, setPagination } = usePagination(20);

  // TOAST
  const { addToast } = useToast()

  // SINGLE SEARCH TEXT BOX
  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchProjects(value)
  }, 350)


  //FILTER STATES
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  //CUSTOMIZE COLUMN MODAL
  const [isShowCustomizeProjectMasterColumnsModal, setIsShowCustomizeProjectMasterColumnsModal] = useState(false);

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction, canExport } = useMenuPermissions();
  //#endregion

  //#region INIT

  useEffect(() => {
    // Sync pagination with context state
    setPagination({ currentPage: listState.page });

    // Load projects with current context state
    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadProjects(listState.page, { ProjectName: String(listState.searchTerm).trim() }, listState.sortInfo);
    } else {
      loadProjects(listState.page, listState.filters, listState.sortInfo);
    }
  }, [listState.page, listState.filters, listState.sortInfo, listState.searchTerm]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.()
    }
  }, [debouncedSearch])
  //#endregion

  //#region DATA LOAD
  const fetchProjectList = async (page: number = pagination.currentPage, sort?: SortInfo) => {
    return await loadProjects(page, filters, sort ?? sortInfo);
  }

  const loadProjects = async (page: number, filterParams: FilterInfo, sortInfo?: SortInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsProjectAccess: false,
          ProjectId: filterParams.ProjectId ? Number(filterParams.ProjectId) : undefined,
          ProjectName: searchtext ?? filterParams.ProjectName?.trim() ?? undefined,
          ProjectLocation: filterParams.ProjectLocation?.trim() || undefined,
          CTCNumber: filterParams.CTCNumber?.trim() || undefined,
          IsRedevelopment: filterParams.IsRedevelopment?.trim() || undefined,
          ProjectStatus: filterParams.ProjectStatus?.trim() || undefined,
          VillageName: filterParams.VillageName?.trim() || undefined,
          ArchitectName: filterParams.ArchitectName?.trim() || undefined,
          RERANumber: filterParams.RERANumber?.trim() || undefined,
          ProjectScheme: filterParams.ProjectScheme?.trim() || undefined,
          ProjectSubScheme: filterParams.ProjectSubScheme?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, projectMasterColumns)
        }

        const response = await projectMasterService.apiCallPullProjectMaster(params);

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
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      fetchProjectList();
      return;
    }

    updateListState({ searchTerm: searchValue, page: 1 });
    await loadProjects(1, filters, sortInfo, searchValue);
  }
  //#endregion

  //#region CLAER SERACH PROJECT
  const clearsearchProjects = () => {
    updateListState({ searchTerm: '', filters: {}, page: 1 });

    debouncedSearch.cancel?.();

    setTempFilters({});
    setPagination({ currentPage: 1 });
    loadProjects(1, { ProjectName: '' }, sortInfo, undefined);
  };

  //#endregion

  //#region EXCEL EXPORT PDF | EXCEL
  const handleExportProjects = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationProjectMasterRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          IsProjectAccess: true,
          ProjectName: filters.ProjectName?.trim() || undefined,
          ProjectLocation: filters.ProjectLocation?.trim() || undefined,
          CTCNumber: filters.CTCNumber?.trim() || undefined,
          IsRedevelopment: filters.IsRedevelopment?.trim() || undefined,
          ProjectStatus: filters.ProjectStatus?.trim() || undefined,
          VillageName: filters.VillageName?.trim() || undefined,
          ArchitectName: filters.ArchitectName?.trim() || undefined,
          RERANumber: filters.RERANumber?.trim() || undefined,
          ProjectScheme: filters.ProjectScheme?.trim() || undefined,
          ProjectSubScheme: filters.ProjectSubScheme?.trim() || undefined,
          SortBy: getSortByParam(sortInfo ?? null, projectMasterColumns),
          ExportType: exportType
        }
        const response = await projectMasterService.apiCallPullProjectMaster(params);
        handleExportFile(response, exportType, 'Project Master', addToast)
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

  const handleExportProjectExcel = () => handleExportProjects('Excel')
  const handleExportProjectPdf = () => handleExportProjects('PDF')
  //#endregion

  //#region TABLE CONFIG

  const handlePageChange = useCallback((page: number) => {
    updateListState({ page });
    fetchProjectList(page);
  }, [updateListState]);

  const handleSortColumn = useCallback((sort: SortInfo) => {
    updateListState({ sortInfo: sort, page: 1 });
    loadProjects(1, filters, sort, searchTerm || undefined);
  }, [filters, updateListState, searchTerm]);

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
    updateListState({ projectId: row.ProjectId, projectName: row.ProjectName, uniquekey: row.Uniquekey });
    navigate('/projectMaster/view');
  }, [navigate, updateListState]);

  //#endregion

  //#region VIEW BANK DETAILS

  const handleViewProjectBank = useCallback((row: ProjectMasterData) => {
    updateListState({ projectId: row.ProjectId, projectName: row.ProjectName, uniquekey: row.Uniquekey });
    navigate('/projectMaster/bank');
  }, [navigate, updateListState]);
  //#endregion

  //#region VIEW EMPLOYEE DETAILS

  const handleViewProjectEmployee = useCallback((row: ProjectMasterData) => {
    updateListState({ projectId: row.ProjectId, projectName: row.ProjectName, uniquekey: row.Uniquekey });
    navigate('/projectMaster/employee');
  }, [navigate, updateListState]);
  //#endregion

  //#region VIEW COMPANY DETAILS

  const handleViewProjectCompany = useCallback((row: ProjectMasterData) => {
    updateListState({ projectId: row.ProjectId, projectName: row.ProjectName, uniquekey: row.Uniquekey });
    navigate('/projectMaster/company');
  }, [navigate, updateListState]);
  //#endregion

  //#region VIEW COMPANY DETAILS

  const handleViewProjectApproval = useCallback((row: ProjectMasterData) => {
    updateListState({ projectId: row.ProjectId, projectName: row.ProjectName, uniquekey: row.Uniquekey });
    navigate('/projectMaster/approval');
  }, [navigate, updateListState]);
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
        key: 'IsRedevelopment',
        label: 'Redevelopment',
        width: '15',
        sortable: false,
        align: 'center',
        render: (value) => value == 1 ? 'Yes' : 'No'
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
        align: 'left',
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
        key: 'RERANumber',
        label: 'RERA Number',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'BussinessCategory',
        label: 'Business Category',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'ProjectStatus',
        label: 'Project Status',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'StateName',
        label: 'State',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'DistrictName',
        label: 'District',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'CityName',
        label: 'City',
        width: '15',
        sortable: false,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'VillageName',
        label: 'Village',
        width: '15',
        sortable: true,
        align: 'left',
        render: (value) => value || '-'
      },
      {
        key: 'Actions',
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
                  handleViewProjectEmployee(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'blue',
                  padding: '4px 8px'
                }}
                title="Project Employee"
              >
                <User2 className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewProjectCompany(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'green',
                  padding: '4px 8px'
                }}
                title="Project Company"
              >
                <Building2Icon className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewProjectBank(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'gray',
                  padding: '4px 8px'
                }}
                title="Project Bank"
              >
                <BanknoteXIcon className="h-4 w-4" />
              </Button>

              <Button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleViewProjectApproval(row)
                }}
                color='transparent'
                isborderRadius
                size='sm'
                style={{
                  color: 'black',
                  padding: '4px 8px'
                }}
                title="Modules Workflow Approval"
              >
                <CheckCircle className="h-4 w-4" />

              </Button>
            </div>
          ) : null


        )
      }
    ],
    [handleViewProjectDetails, handleViewProjectEmployee, handleViewProjectCompany, handleViewProjectBank, handleViewProjectApproval]
  )

  //#endregion

  //#region CUSTOMIZE COLUMNS

  const requiredProjectMasterColumnKeys: string[] = ['ProjectName', 'Actions'];

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
    updateListState({ filters: tempFilters, page: 1 });
    loadProjects(1, tempFilters);
    setShowFilterPopup(false);
  }

  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {}, page: 1 });
    loadProjects(1, {});
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

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>  <div></div> </Loader>
      <TableActionToolbar
        isShowSearchBar
        searchTerm={searchTerm}
        searchPlaceholder="Search By Project Name..."
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
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
        addTitle="Add"
        onAdd={handleAddProjectMasterModal}

        // IMPORT 
        isShowImportButton={canAction}

        // EXPORT
        isShowExportButton={canExport && projectListForTable.length > 0}
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
        saveText="Apply"
        cancelText="Clear"
        onCancel={() => clearFilters()}

        size="small-half"
      >
        <div className="space-y-6">
          <div className=" space-y-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1">
            <div>
              <ToggleSwitch
                label="Is Redevelopment"
                name="IsRedevelopment"
                value={tempFilters.IsRedevelopment === "1"}
                onChange={(name, value) =>
                  handleFilterChange(name, value ? "1" : "0")
                }
              />
            </div>
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
            <div>
              <SinglePageSelection
                label="Project Status"
                placeholder="Select Project Status"
                value={tempFilters.ProjectStatus || ''}
                onChange={e => handleFilterChange('ProjectStatus', String(e))}
                options={PROJECT_STATUS_OPTIONS.map(opt => ({ label: opt.name, value: opt.id }))}
              />
            </div>
            <div>
              <Input
                label='Village'
                type="text"
                value={tempFilters.VillageName || ''}
                onChange={(e) => handleFilterChange('VillageName', e.target.value)}
                placeholder="Enter Village Name"
              />
            </div>
            <div>
              <Input
                label='Architect Name'
                type="text"
                value={tempFilters.ArchitectName || ''}
                onChange={(e) => handleFilterChange('ArchitectName', e.target.value)}
                placeholder="Enter Architect Name"
              />
            </div>
            <div>
              <Input
                label='RERA Number'
                type="text"
                value={tempFilters.RERANumber || ''}
                onChange={(e) => handleFilterChange('RERANumber', e.target.value)}
                placeholder="Enter RERA Number"
              />
            </div>
            <div>
              <SinglePageSelection
                label="Project Scheme"
                placeholder="Select Project Scheme"
                value={tempFilters.ProjectScheme}
                onChange={(val) => handleFilterChange('ProjectScheme', String(val))}
                options={PROJECT_SCHEME.map(opt => ({ label: opt.name, value: opt.id }))}
              />
            </div>
            <div>
              <SinglePageSelection
                label="Project Sub Scheme"
                placeholder="Select Project Sub Scheme"
                value={tempFilters.ProjectSubScheme}
                onChange={(val) => handleFilterChange('ProjectSubScheme', String(val))}
                options={
                  tempFilters.ProjectScheme === 'BMC'
                    ? PROJECT_SUB_SCHEME_BMC.map(opt => ({ label: opt.name, value: opt.id }))
                    : tempFilters.ProjectScheme === 'MHADA'
                      ? PROJECT_SUB_SCHEME_MHADA.map(opt => ({ label: opt.name, value: opt.id }))
                      : tempFilters.ProjectScheme === 'SRA'
                        ? PROJECT_SUB_SCHEME_SRA.map(opt => ({ label: opt.name, value: opt.id }))
                        : []
                }
                disabled={!tempFilters.ProjectScheme}
              />
            </div>
          </div>
        </div>
      </Modal>


    </div>
  )
}

export default ProjectMaster

