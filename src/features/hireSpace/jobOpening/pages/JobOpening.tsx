import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as E from 'fp-ts/Either';
import { Briefcase, Clock3, Edit, MapPin, Trash2 } from 'lucide-react';

import { ACTIVE_INACTIVE_OPTIONS, EMPLOYMENT_TYPE_OPTIONS, WORK_MODE_OPTIONS } from '@/core/constants';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { usePagination } from '@/core/hooks/usePagination';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { handleExportFile } from '@/core/utils/exportFile';
import { updateFilter } from '@/core/utils/filterHelper';
import { Loader } from '@/core/utils/loader';
import { fetchJobOpeningDepartmentDropdown } from '@/features/hireSpace/jobOpening/jobOpeningDropDown';
import { useJobOpeningListState } from '@/features/hireSpace/jobOpening/context/JobOpeningListStateContext';
import type {
  DeleteJobOpeningRequest,
  FilterWithPaginationJobOpeningRequest,
  JobOpeningData,
} from '@/features/hireSpace/jobOpening/models/JobOpeningModel';
import { JobOpeningService } from '@/features/hireSpace/jobOpening/services/JobOpeningService';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import type { FilterInfo } from '@/ui/components/DataTable/DataTable';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { Modal } from '@/ui/components/Modal/Modal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { Button, Input } from '@/ui/components/forms';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

export const JobOpening: React.FC = () => {

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { pagination, setPagination } = usePagination(20);
  const { canAction, canExport } = useMenuPermissions('/jobOpenings');
  const { listState, updateListState } = useJobOpeningListState();
  const { searchTerm, filters, departmentId } = listState;

  const [departmentTabList, setDepartmentTabList] = useState<TabItem[]>([]);
  const [jobOpeningList, setJobOpeningList] = useState<JobOpeningData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isFetchingMoreJobOpening, setIsFetchingMoreJobOpening] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterInfo>({});
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteJobOpeningDetailsData, setDeleteJobOpeningDetailsData] = useState<JobOpeningData | null>(null);

  const loadJobOpening = async (pageNumber: number, filterParams: FilterInfo, searchtext?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobOpeningRequest = {
          PageNumber: pageNumber,
          PageSize: pagination.pageSize,
          DepartmentMasterId: departmentId,
          WorkMode: filterParams.WorkMode?.trim() || undefined,
          EmploymentType: filterParams.EmploymentType?.trim() || undefined,
          RoleName: searchtext ?? filterParams.RoleName?.trim() ?? undefined,
          ExperienceYears:filterParams.ExperienceYears ? Number(filterParams.ExperienceYears) : undefined,
          JobRoleStatus:filterParams.Status === 'Active'?true:false
        };

        const response = await JobOpeningService.apiCallPullJobOpening(params);

        if (E.isRight(response)) {
          setJobOpeningList((prev) =>
            pageNumber === 1
              ? response.right.Data
              : [...prev, ...response.right.Data],
          );

          setPagination({
            currentPage: pageNumber,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / pagination.pageSize),
          });
        } else {
          addToast({ type: 'error', title: response.left.message });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Job Openings',
    );
  };

  const loadDepartments = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await fetchJobOpeningDepartmentDropdown();

        setDepartmentTabList([{ id: '0', label: 'All' }, ...response.itemList]);

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Departments',
    );
  };

  const handleJobOpeningListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const threshold = 60;

    if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {
      if (pagination.currentPage < pagination.totalPages && !isFetchingMoreJobOpening) {
        const nextPage = pagination.currentPage + 1;

        setIsFetchingMoreJobOpening(true);

        if (searchTerm.trim()) {
          loadJobOpening(nextPage, filters, searchTerm.trim()).finally(() => setIsFetchingMoreJobOpening(false));
        } else {
          loadJobOpening(nextPage, filters).finally(() => setIsFetchingMoreJobOpening(false));
        }
      }
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      loadJobOpening(1, filters, searchTerm.trim());
    } else {
      loadJobOpening(1, filters);
    }
  }, [departmentId, filters, searchTerm]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchJobOpening(value);
  }, 350);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  const searchJobOpening = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });
  };

  const clearSearchJobOpening = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: '', filters: {} });
    setTempFilters({});
  };

  const handleViewJobOpening = (jobOpening: JobOpeningData) => {
    updateListState({
      departmentId: jobOpening.DepartmentMasterId,
      departmentName: jobOpening.DepartmentName,
      jobOpeningMasterId: jobOpening.JobOpeningMasterId,
      jobRoleMasterId: jobOpening.JobRoleMasterId,
      jobRoleName: jobOpening.JobRoleName,
    });
    navigate('/jobOpenings/JobApplicationDetails');
  };

  const handleAddJobOpening = () => {
    navigate('/jobOpenings/add');
  };

  const handleEditJobOpening = (jobOpening: JobOpeningData) => {
    navigate(`/jobOpenings/add/${jobOpening.JobOpeningMasterId}`);
  };

  const handleDepartmentChange = (tab: TabItem) => {
    updateListState({
      departmentId: Number(tab.id),
      departmentName: tab.label,
      jobOpeningMasterId: 0,
      jobRoleMasterId: 0,
      jobRoleName: '',
    });
  };

  const handleConfirmationDialogBoxOpen = (jobOpening: JobOpeningData) => {
    setDeleteJobOpeningDetailsData(jobOpening);
    setIsConfirmationDialogBoxOpen(true);
  };

  const applyFilters = () => {
    updateListState({ filters: tempFilters });
    loadJobOpening(1, tempFilters);
    setShowFilterPopup(false);
  };

  const clearFilters = () => {
    setTempFilters({});
    updateListState({ filters: {} });
    loadJobOpening(1, {});
  };

  const handleFilterChange = (key: string, value: string) => {
    setTempFilters((prev) => updateFilter(prev, key, value));
  };

  const handleDeleteJobOpening = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: DeleteJobOpeningRequest = {
          JobOpeningMasterId: deleteJobOpeningDetailsData!.JobOpeningMasterId,
          UniqueKey: deleteJobOpeningDetailsData!.UniqueKey,
        };

        const response = await JobOpeningService.apiCallDeleteJobOpening(params);

        if (E.isRight(response)) {
          setJobOpeningList((prevData) =>
            prevData.filter((item) => item.JobOpeningMasterId !== deleteJobOpeningDetailsData!.JobOpeningMasterId),
          );

          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize),
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] });

          setIsConfirmationDialogBoxOpen(false);

          setDeleteJobOpeningDetailsData(null);

          await loadDepartments();
        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpen(false);
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Delete Job Opening',
    );
  };

  const handleExportJobOpening = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const params: FilterWithPaginationJobOpeningRequest = {
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          DepartmentMasterId: departmentId,
          WorkMode: filters.WorkMode?.trim() || undefined,
          EmploymentType: filters.EmploymentType?.trim() || undefined,
          RoleName: searchTerm.trim() || filters.RoleName?.trim() || undefined,
          ExportType: exportType,
          ExperienceYears:filters.ExperienceYears ? Number(filters.ExperienceYears) : undefined,
          JobRoleStatus:filters.Status === 'Active'?true:false
        };


        const response = await JobOpeningService.apiCallPullJobOpening(params);

        handleExportFile(response, exportType, 'Job Opening', addToast);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Exporting Job Openings',
    );
  };

  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
      <Loader loading={isLoading} title={loadingMessage}>
        <div />
      </Loader>

      <TableActionToolbar
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          updateListState({ searchTerm: v });
          debouncedSearch(v);
        }}
        onClearSearch={clearSearchJobOpening}
        filters={{
          RoleName: filters.RoleName || '',
          WorkMode: filters.WorkMode || '',
          EmploymentType: filters.EmploymentType || '',
          ExperienceYears: filters.ExperienceYears || '',
          Status: filters.Status || '',
        }}
        onOpenFilter={() => {
          setTempFilters(filters);
          setShowFilterPopup(true);
        }}
        addTitle="Add"
        onAdd={handleAddJobOpening}
        isShowAddButton={canAction}
        isShowExportButton={canExport}
        onExportExcel={() => handleExportJobOpening('Excel')}
        onExportPdf={() => handleExportJobOpening('PDF')}
        exportLoading={isLoading}
      />

      {departmentTabList.length === 0 && !isLoading? (
        <NoDataView message="No Departments Found" />
      ):(departmentTabList.length > 0 || isLoading) && (
        <div className="min-w-0">
          <div className="mb-4 min-w-0 overflow-x-hidden thin-scroll ">
            <div
              className="flex flex-nowrap min-w-max items-center gap-2 [&>*]:flex-shrink-0 [&>*]:flex-row [&_div]:flex-nowrap"
              style={{ display: 'flex', flexWrap: 'nowrap', whiteSpace: 'wrap' }}
            >
              <Tabs
                tabs={departmentTabList}
                defaultActive={String(departmentId)}
                onTabChange={handleDepartmentChange}
              />
            </div>
          </div>

          <div
            className="thin-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-1"
            onScroll={handleJobOpeningListScroll}
            style={{ maxHeight: '65vh' }}
          >
            {jobOpeningList.length === 0 && !isLoading ? (
              <NoDataView message="No Job Openings Found" />
            ) : (
              jobOpeningList.map((jobOpening) => {
                return (
                  <div
                    key={jobOpening.JobOpeningMasterId}
                    className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 mb-4 transition hover:shadow"
                    onClick={() => handleViewJobOpening(jobOpening)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <div className="min-w-0 w-fit max-w-[560px]">
                            <TooltipText
                              text={jobOpening.JobRoleName}
                              maxWidth="560px"
                              tooltipThreshold={48}
                              onClick={() => handleViewJobOpening(jobOpening)}
                            />
                          </div>
                          <span className="inline-block shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium whitespace-nowrap text-blue-800">
                            {jobOpening.DepartmentName}
                          </span>
                          <span
                            className={`inline-block shrink-0 rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${
                              jobOpening.JobRoleStatus
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {jobOpening.JobRoleStatus ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        {canAction && (
                          <div className="flex shrink-0 items-center gap-2">
                            <Button
                              color="transparent"
                              size="sm"
                              isborderRadius
                              title="Edit"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleEditJobOpening(jobOpening);
                              }}
                            >
                              <Edit className="h-4 w-4 text-blue-700" />
                            </Button>
                            <Button
                              color="transparent"
                              size="sm"
                              isborderRadius
                              title="Delete"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleConfirmationDialogBoxOpen(jobOpening);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-gray-600">
                        Total Openings : {jobOpening.NumberOfOpenings}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 shrink-0 text-gray-400" />
                            {jobOpening.ExperienceYears ? `${jobOpening.ExperienceYears} Year`: "-"}
                          </span>
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            {jobOpening.WorkMode}
                          </span>
                          <span className="flex items-center gap-2">
                            <Clock3 className="h-4 w-4 shrink-0 text-gray-400" />
                            {jobOpening.EmploymentType}
                          </span>
                        </div>

                        <Button
                          color="transparent"
                          size="sm"
                          isborderRadius
                          onClick={(event) => {
                            event.stopPropagation();
                            handleViewJobOpening(jobOpening);
                          }}
                        >
                          {jobOpening.TotalApplications} Applications
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isFetchingMoreJobOpening && (
              <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
            )}
          </div>
        </div>
      )}

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
        onCancel={() => clearFilters()}
        size="small-half"
      >
        <div className="space-y-6">

          <Input
            label="Role Name"
            placeholder="Enter Role Name"
            value={tempFilters.RoleName || ''}
            onChange={(event) => handleFilterChange('RoleName', event.target.value)}
          />

          <SinglePageSelection
            label="Work Mode"
            placeholder="Select Work Mode"
            value={tempFilters.WorkMode || ''}
            searchable={false}
            options={WORK_MODE_OPTIONS.map((opt) => ({
              label: opt.name,
              value: opt.id,
            }))}
            onChange={(value) => handleFilterChange('WorkMode', String(value))}
          />

          <SinglePageSelection
            label="Employment Type"
            placeholder="Select Employment Type"
            value={tempFilters.EmploymentType || ''}
            searchable={false}
            options={EMPLOYMENT_TYPE_OPTIONS.map((opt) => ({
              label: opt.name,
              value: opt.id,
            }))}
            onChange={(value) => handleFilterChange('EmploymentType', String(value))}
          />

          <Input
            label="Experience Years"
            placeholder="Enter Experience Years"
            type="number"
            value={tempFilters.ExperienceYears || ''}
            onChange={(event) => handleFilterChange('ExperienceYears', event.target.value)}
          />

          <SinglePageSelection
            label="Status"
            placeholder="Select Status"
            value={tempFilters.Status || ''}
            searchable={false}
            options={ACTIVE_INACTIVE_OPTIONS.map((opt) => ({
              label: opt.name,
              value: opt.id,
            }))}
            onChange={(value) => handleFilterChange('Status', String(value))}
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
};

export default JobOpening;
