import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { usePagination } from '@/core/hooks/usePagination';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { updateFilter } from '@/core/utils/filterHelper';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { JobRoleDepartmentPanel, JobRoleDetailView, JobRoleListView } from '@/features/hireSpace/JobRoleMaster/components';
import { ACTIVE_INACTIVE_OPTIONS } from '@/core/constants';
import { INITIAL_FORM_STATE } from '@/features/hireSpace/JobRoleMaster/constants/jobRoleMasterConstants';
import { useJobRoleMasterListState } from '@/features/hireSpace/JobRoleMaster/context/JobRoleMasterListStateContext';
import type {
  DeleteJobRoleMasterRequest,
  FilterWithPaginationJobRoleMasterRequest,
  JobDepartmentData,
  JobRoleMasterData,
  JobRoleStatusFilter,
} from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel';
import { JobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import { getJobRoleSkillsText } from '@/features/hireSpace/JobRoleMaster/utils/jobRoleUtils';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Modal } from '@/ui/components/Modal/Modal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { PaginationInfo } from '@/ui/components/Pagination/Pagination';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { Input } from '@/ui/components/forms';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const JobRoleMaster: React.FC = () => {

  const [departments, setDepartments] = useState<JobDepartmentData[]>([]);
  const [jobRoleMasterList, setJobRoleMasterList] = useState<JobRoleMasterData[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<JobRoleMasterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteJobRoleMasterDetailsData, setDeleteJobRoleMasterDetailsData] = useState<JobRoleMasterData | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);

  const { canAction, canExport } = useMenuPermissions('/jobRoleMaster');

  const { listState, updateListState, resetFilters, setJobRoleMasterContext } = useJobRoleMasterListState();
  const { searchTerm, filters, departmentId } = listState;

  const [searchValue, setSearchValue] = useState(searchTerm);

  const selectedDepartment = useMemo(
    () => departments.find((department) => department.DepartmentId === departmentId) ?? null,
    [departmentId, departments],
  );


  const loadDepartments = useCallback(async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await JobRoleMasterService.apiCallPullJobDepartment();
        const departmentList = E.isRight(response) ? (response.right.Data ?? []) : [];
        const initialDepartment =
          departmentList.find((department) => department.DepartmentId === departmentId) ?? departmentList[0];

        setDepartments(departmentList);
        updateListState({
          departmentId: initialDepartment?.DepartmentId ?? 0,
          departmentName: initialDepartment?.DepartmentName ?? '',
          page: initialDepartment ? listState.page : 1,
        });

        return departmentList;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Departments'
    );
  }, [addToast, departmentId, listState.page, updateListState]);

  const loadJobRoleMaster = async (page: number, filterParams: FilterInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobRoleMasterRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          DepartmentId: departmentId,
          RoleName: searchtext ?? filterParams.RoleName?.trim() ?? undefined,
          RoleSkills: filterParams.RoleSkills?.trim() || undefined,
          IsActive: filterParams.Status === 'active' ? true : filterParams.Status === 'inactive' ? false : undefined,
        };

        const response = await JobRoleMasterService.apiCallPullJobRoleMaster(params);

        if (E.isRight(response)) {
          const totalRecords = response.right.TotalNumberOfRecord;
          setJobRoleMasterList(response.right.Data);
          setPagination({
            currentPage: page,
            totalRecords,
            totalPages: Math.ceil(totalRecords / pagination.pageSize),
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Job Role Master'
    );
  };


  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateListState({ searchTerm: value.trim(), page: 1 });
  }, 350);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (!departmentId) return;

    setPagination({ currentPage: listState.page });

    if (listState.searchTerm && String(listState.searchTerm).trim()) {
      loadJobRoleMaster(listState.page, { RoleName: String(listState.searchTerm).trim() });
    } else {
      loadJobRoleMaster(listState.page, listState.filters);
    }
  }, [listState.page, listState.filters, listState.searchTerm, departmentId]);

  useEffect(() => {
    setSearchValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);


  const clearSearchJobRoleMaster = () => {
    setSelectedJobRole(null);
    debouncedSearch.cancel?.();
    setSearchValue('');
    updateListState({ searchTerm: '', page: 1 });
  };

  const handlePageChange = useCallback((nextPage: number) => {
    updateListState({ page: nextPage });
  }, [updateListState]);

  const paginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage: pagination.currentPage,
      totalPages: pagination.totalPages,
      totalRecords: pagination.totalRecords,
      pageSize: pagination.pageSize,
      onPageChange: handlePageChange,
    }),
    [pagination, handlePageChange]
  );

  const handleViewJobRoleMaster = useCallback((jobRole: JobRoleMasterData) => {
    setJobRoleMasterContext(jobRole.JobRoleId, jobRole.RoleName, jobRole.UniqueKey);
    setSelectedJobRole(jobRole);
  }, [setJobRoleMasterContext]);

  const handleEditJobRoleMaster = useCallback((jobRole: JobRoleMasterData) => {
    navigate(`/jobRoleMaster/add/${jobRole.DepartmentId}/${jobRole.JobRoleId}`);
  }, [navigate]);

  const handleDepartmentChange = useCallback((department: JobDepartmentData) => {
    setJobRoleMasterList([]);
    setSelectedJobRole(null);
    updateListState({
      departmentId: department.DepartmentId,
      departmentName: department.DepartmentName,
      jobRoleId: 0,
      jobRoleName: '',
      uniqueKey: '',
      page: 1,
    });
  }, [updateListState]);


  const handleConfirmationDialogBoxOpen = useCallback((jobRole: JobRoleMasterData) => {
    setDeleteJobRoleMasterDetailsData(jobRole);
    setIsConfirmationDialogBoxOpen(true);
  }, []);


  const applyFilters = () => {
    setSelectedJobRole(null);
    updateListState({ filters: tempFilters, page: 1 });
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setSearchValue('');
    setTempFilters({});
    resetFilters();
    setShowFilterPopup(false);
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };

  const handleDeleteJobRoleMaster = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteJobRoleMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteJobRoleMasterRequest = {
          JobRoleId: deleteJobRoleMasterDetailsData.JobRoleId || 0,
          UniqueKey: deleteJobRoleMasterDetailsData.UniqueKey || '',
        };

        const response = await JobRoleMasterService.apiCallDeleteJobRoleMaster(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));
          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (jobRoleMasterList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: Math.ceil(newTotalRecords / pagination.pageSize),
          });

          await loadJobRoleMaster(pageToShow, filters);
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
          setDeleteJobRoleMasterDetailsData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Deleting Job Role'
    );
  };

  const handleDuplicateJobRoleMaster = async () => {
    if (!selectedJobRole) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await JobRoleMasterService.apiCallAddUpdateJobRoleMaster({
          JobRoleId: 0,
          UniqueKey: INITIAL_FORM_STATE.UniqueKey,
          DepartmentId: selectedJobRole.DepartmentId,
          RoleName: selectedJobRole.RoleName,
          RoleDescription: selectedJobRole.RoleDescription || '',
          RoleQualification: selectedJobRole.RoleQualification || '',
          RoleResponsibility: selectedJobRole.RoleResponsibility || '',
          JobRequirement: selectedJobRole.JobRequirement || '',
          RoleSkills: getJobRoleSkillsText(selectedJobRole.RoleSkills),
          IsCopy: '1',
        });

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
          setIsDuplicateDialogOpen(false);
          setSelectedJobRole(null);
          await loadJobRoleMaster(listState.page, filters);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Duplicating Job Role'
    );
  };

  const handleExportJobRoleMaster = async (exportType: 'Excel' | 'PDF') => {
    if (!departmentId) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await JobRoleMasterService.apiCallPullJobRoleMaster({
          PageNumber: 1,
          PageSize: Math.max(pagination.totalRecords, pagination.pageSize),
          DepartmentId: departmentId,
          RoleName: searchTerm.trim() || filters.RoleName?.trim() || undefined,
          RoleSkills: filters.RoleSkills?.trim() || undefined,
          IsActive: filters.Status === 'active' ? true : filters.Status === 'inactive' ? false : undefined,
          ExportType: exportType,
        });

        handleExportFile(response, exportType, 'Job Role Master', addToast);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Exporting Job Role Master'
    );
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

      <TableActionToolbar
        searchTerm={searchValue}
        searchPlaceholder="Search By Name"
        onSearchChange={(value) => {
          setSelectedJobRole(null);
          setSearchValue(value);
          debouncedSearch(value);
        }}
        onClearSearch={clearSearchJobRoleMaster}
        filters={{
          RoleName: filters.RoleName ?? '',
          RoleSkills: filters.RoleSkills ?? '',
          Status: filters.Status ?? '',
        }}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton={false}
        isShowExportButton={canExport && jobRoleMasterList.length > 0}
        onExportExcel={() => handleExportJobRoleMaster('Excel')}
        onExportPdf={() => handleExportJobRoleMaster('PDF')}
        exportLoading={isLoading}
      />

      {departments.length === 0 && !isLoading ? (
        <NoDataView message="No Departments Found" />
      ) : selectedDepartment ? (
        <div className="grid grid-cols-1 gap-5 rounded-lg bg-[#FAFBFC] lg:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <JobRoleDepartmentPanel
              departments={departments}
              selectedDepartmentId={selectedDepartment.DepartmentId}
              onSelectDepartment={handleDepartmentChange}
            />
          </div>

          {selectedJobRole ? (
            <JobRoleDetailView
              jobRole={selectedJobRole}
              isDuplicating={isLoading}
              canAction={canAction}
              onBackToList={() => setSelectedJobRole(null)}
              onDuplicate={() => setIsDuplicateDialogOpen(true)}
            />
          ) : (
            <JobRoleListView
              department={selectedDepartment}
              jobRoles={jobRoleMasterList}
              pagination={paginationInfo}
              canAction={canAction}
              onAddRole={() => navigate(`/jobRoleMaster/add/${selectedDepartment.DepartmentId}`)}
              onViewRole={handleViewJobRoleMaster}
              onEditRole={handleEditJobRoleMaster}
              onDeleteRole={handleConfirmationDialogBoxOpen}
            />
          )}
        </div>
      ) : null}

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Job Role Master"
        onSubmit={(event) => {
          event.preventDefault();
          applyFilters();
        }}
        saveText="Apply"
        cancelText="Clear"
        onCancel={clearFilters}
        size="small-half"
      >
        <div className="space-y-6">
          <Input
            label="Role Name"
            placeholder="Enter Role Name"
            value={tempFilters.RoleName ?? ''}
            onChange={(event) => handleFilterChange('RoleName', event.target.value)}
          />
          <Input
            label="Required Skills"
            placeholder="Enter Required Skills"
            value={tempFilters.RoleSkills ?? ''}
            onChange={(event) => handleFilterChange('RoleSkills', event.target.value)}
          />
          <SinglePageSelection
            label="Status"
            placeholder="Select Status"
            value={tempFilters.Status ?? ''}
            searchable={false}
            options={ACTIVE_INACTIVE_OPTIONS.map((opt) => ({
              label: opt.name,
              value: opt.id.toLowerCase(),
            }))}
            onChange={(value) => handleFilterChange('Status', String(value || '') as JobRoleStatusFilter)}
          />
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteJobRoleMasterDetailsData(null);
        }}
        onConfirm={handleDeleteJobRoleMaster}
        loading={isLoading}
        pageName="Job Role"
      />

      <DeleteDialog
        isOpen={isDuplicateDialogOpen}
        onClose={() => setIsDuplicateDialogOpen(false)}
        onConfirm={handleDuplicateJobRoleMaster}
        loading={isLoading}
        title="Duplicate Job Role?"
        message={`This will create a copy of "${selectedJobRole?.RoleName ?? 'this job role'}".`}
        confirmText="Duplicate"
        variant="info"
      />
    </div>
  );
};

export default JobRoleMaster;
