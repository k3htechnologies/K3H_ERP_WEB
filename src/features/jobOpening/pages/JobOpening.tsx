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
import type { JobDepartmentData } from '@/features/hireSpace/models/JobRoleMasterModel';
import { JobRoleMasterService } from '@/features/hireSpace/services/JobRoleMasterService';
import { JobOpeningDepartmentPanel, JobOpeningRoleList } from '@/features/jobOpening/components';
import { ACTIVE_INACTIVE_OPTIONS } from '@/core/constants';
import { useJobOpeningListState } from '@/features/jobOpening/context/JobOpeningListStateContext';
import type {
  DeleteJobOpeningRequest,
  FilterWithPaginationJobOpeningRequest,
  JobOpeningData,
  JobOpeningStatusFilter,
} from '@/features/jobOpening/models/JobOpeningModel';
import { JobOpeningService } from '@/features/jobOpening/services/JobOpeningService';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Modal } from '@/ui/components/Modal/Modal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { PaginationInfo } from '@/ui/components/Pagination/Pagination';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import { Input } from '@/ui/components/forms';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const JobOpening: React.FC = () => {
  const [departments, setDepartments] = useState<JobDepartmentData[]>([]);
  const [jobOpeningList, setJobOpeningList] = useState<JobOpeningData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const navigate = useNavigate();

  const { pagination, setPagination } = usePagination(20);

  const { addToast } = useToast();

  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});

  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteJobOpeningDetailsData, setDeleteJobOpeningDetailsData] = useState<JobOpeningData | null>(null);

  const { canAction, canExport } = useMenuPermissions('/jobOpenings');

  const { listState, updateListState, resetFilters, setJobOpeningContext } = useJobOpeningListState();
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

  const loadJobOpening = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobOpeningRequest = {
          PageNumber: page,
          PageSize: pagination.pageSize,
          IsCheckPermission: true,
          DepartmentMasterId: departmentId,
          RoleName: filterParams.RoleName?.trim() || undefined,
          DepartmentName: filterParams.Department?.trim() || undefined,
          JobRoleStatus: filterParams.Status === 'active' ? true : filterParams.Status === 'inactive' ? false : undefined,
        };

        const response = await JobOpeningService.apiCallPullJobOpening(params);

        if (E.isRight(response)) {
          const totalRecords = response.right.TotalNumberOfRecord;
          setJobOpeningList(response.right.Data);
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
      'Loading Job Openings'
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
      loadJobOpening(listState.page, { RoleName: String(listState.searchTerm).trim() });
    } else {
      loadJobOpening(listState.page, listState.filters);
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


  const clearSearchJobOpening = () => {
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


  const handleViewJobOpening = useCallback((jobOpening: JobOpeningData) => {
    if (!jobOpening.JobOpeningMasterId) {
      addToast({ type: 'error', title: 'Job opening identifier is missing.' });
      return;
    }

    setJobOpeningContext(
      jobOpening.JobOpeningMasterId,
      jobOpening.JobRoleMasterId,
      jobOpening.JobRoleName || jobOpening.RoleName || '',
    );

    navigate(
      `/jobOpenings/${jobOpening.DepartmentMasterId}/JobApplicationDetails/${jobOpening.JobOpeningMasterId}?jobRoleMasterId=${jobOpening.JobRoleMasterId}`,
      {
        state: {
          departmentName: jobOpening.DepartmentName,
          JobRoleName: jobOpening.JobRoleName || jobOpening.RoleName,
          JobRoleMasterId: jobOpening.JobRoleMasterId,
          JobOpeningMasterId: jobOpening.JobOpeningMasterId,
        },
      },
    );
  }, [addToast, navigate, setJobOpeningContext]);


  const handleAddJobOpening = useCallback(() => {
    navigate('/jobOpenings/add');
  }, [navigate]);

  const handleEditJobOpening = useCallback((jobOpening: JobOpeningData) => {
    setJobOpeningContext(
      jobOpening.JobOpeningMasterId,
      jobOpening.JobRoleMasterId,
      jobOpening.JobRoleName || jobOpening.RoleName || '',
    );
    navigate(`/jobOpenings/add/${jobOpening.JobOpeningMasterId}`);
  }, [navigate, setJobOpeningContext]);


  const handleDepartmentChange = useCallback((department: JobDepartmentData) => {
    setJobOpeningList([]);
    updateListState({
      departmentId: department.DepartmentId,
      departmentName: department.DepartmentName,
      jobOpeningMasterId: 0,
      jobRoleMasterId: 0,
      jobRoleName: '',
      page: 1,
    });
  }, [updateListState]);


  const handleConfirmationDialogBoxOpen = useCallback((jobOpening: JobOpeningData) => {
    setDeleteJobOpeningDetailsData(jobOpening);
    setIsConfirmationDialogBoxOpen(true);
  }, []);


  const applyFilters = () => {
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

  const handleDeleteJobOpening = async () => {
    setIsConfirmationDialogBoxOpen(false);

    if (!deleteJobOpeningDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteJobOpeningRequest = {
          JobOpeningMasterId: deleteJobOpeningDetailsData.JobOpeningMasterId || 0,
          UniqueKey: deleteJobOpeningDetailsData.UniqueKey || '',
        };

        const response = await JobOpeningService.apiCallDeleteJobOpening(params);

        if (E.isRight(response)) {
          const newTotalRecords = pagination.totalRecords - 1;
          const newTotalPages = Math.max(1, Math.ceil(newTotalRecords / pagination.pageSize));
          let pageToShow = pagination.currentPage;

          if (pagination.currentPage > newTotalPages) {
            pageToShow = newTotalPages;
          } else if (jobOpeningList.length === 1 && pagination.currentPage > 1) {
            pageToShow = pagination.currentPage - 1;
          }

          setPagination({
            currentPage: pageToShow,
            totalRecords: newTotalRecords,
            totalPages: Math.ceil(newTotalRecords / pagination.pageSize),
          });

          await loadJobOpening(pageToShow, filters);
          addToast({ type: 'success', title: response.right.SuccessMessage?.[0] });
          setDeleteJobOpeningDetailsData(null);
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Deleting Job Opening'
    );
  };


  const handleExportJobOpening = async (exportType: 'Excel' | 'PDF') => {
    if (!departmentId) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await JobOpeningService.apiCallPullJobOpening({
          PageNumber: 1,
          PageSize: Math.max(pagination.totalRecords, pagination.pageSize),
          IsCheckPermission: true,
          DepartmentMasterId: departmentId,
          RoleName: searchTerm.trim() || filters.RoleName?.trim() || undefined,
          DepartmentName: filters.Department?.trim() || undefined,
          JobRoleStatus: filters.Status === 'active' ? true : filters.Status === 'inactive' ? false : undefined,
          ExportType: exportType,
        });

        handleExportFile(response, exportType, 'Job Opening', addToast);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Exporting Job Openings'
    );
  };
  

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}> <div></div> </Loader>

      <TableActionToolbar
        searchTerm={searchValue}
        searchPlaceholder="Search By Name"
        onSearchChange={(value) => {
          setSearchValue(value);
          debouncedSearch(value);
        }}
        onClearSearch={clearSearchJobOpening}
        filters={{
          RoleName: filters.RoleName ?? '',
          Department: filters.Department ?? '',
          Status: filters.Status ?? '',
        }}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        isShowCustomizeButton={false}
        isShowExportButton={canExport && jobOpeningList.length > 0}
        onExportExcel={() => handleExportJobOpening('Excel')}
        onExportPdf={() => handleExportJobOpening('PDF')}
        exportLoading={isLoading}
      />

      {departments.length === 0 && !isLoading ? (
        <NoDataView message="No Departments Found" />
      ) : selectedDepartment ? (
        <div className="grid grid-cols-1 gap-5 rounded-lg bg-[#FAFBFC] lg:grid-cols-[260px_minmax(0,1fr)]">
          <div>
            <JobOpeningDepartmentPanel
              departments={departments}
              selectedDepartmentId={selectedDepartment.DepartmentId}
              onSelectDepartment={handleDepartmentChange}
            />
          </div>

          <JobOpeningRoleList
            department={selectedDepartment}
            jobOpenings={jobOpeningList}
            pagination={paginationInfo}
            canAction={canAction}
            onAddJobOpening={handleAddJobOpening}
            onViewJobOpening={handleViewJobOpening}
            onEditJobOpening={handleEditJobOpening}
            onDeleteJobOpening={handleConfirmationDialogBoxOpen}
          />
        </div>
      ) : null}

      <Modal
        isOpen={showFilterPopup}
        onClose={() => setShowFilterPopup(false)}
        title="Filter - Job Opening"
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
            label="Department"
            placeholder="Enter Department"
            value={tempFilters.Department ?? ''}
            onChange={(event) => handleFilterChange('Department', event.target.value)}
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
            onChange={(value) => handleFilterChange('Status', String(value || '') as JobOpeningStatusFilter)}
          />
        </div>
      </Modal>

      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpen}
        onClose={() => {
          setIsConfirmationDialogBoxOpen(false);
          setDeleteJobOpeningDetailsData(null);
        }}
        onConfirm={handleDeleteJobOpening}
        loading={isLoading}
        pageName="Job Opening"
      />
    </div>
  );
  //#endregion
};

export default JobOpening;
