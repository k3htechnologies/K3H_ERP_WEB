import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Braces, ClipboardCheck, FileText, ListChecks, Plus } from 'lucide-react';
import * as E from 'fp-ts/Either';
import { useDebouncedCallback } from '@/core/hooks/useDebouncedCallback';
import { usePagination } from '@/core/hooks/usePagination';
import { useToast } from '@/core/hooks/useToast';
import { runApiWithLoader } from '@/core/utils';
import { handleExportFile } from '@/core/utils/exportFile';
import { Loader } from '@/core/utils/loader';
import { fetchJobOpeningDepartmentDropdown } from '@/features/hireSpace/jobOpening/jobOpeningDropDown';
import { useJobRoleMasterListState } from '@/features/hireSpace/JobRoleMaster/context/JobRoleMasterListStateContext';
import type {
  DeleteJobRoleMasterRequest,
  FilterWithPaginationJobRoleMasterRequest,
  JobRoleMasterData,
  AddUpdateJobRoleMasterRequest,
} from '@/features/hireSpace/JobRoleMaster/models/JobRoleMasterModel';
import { jobRoleMasterService } from '@/features/hireSpace/JobRoleMaster/services/JobRoleMasterService';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import Tabs, { type TabItem } from '@/ui/components/Tab/Tab';
import { Breadcrumb } from '@/ui/components/Breadcrumb';
import { Button } from '@/ui/components/forms';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';


const INITIAL_FORM_STATE: AddUpdateJobRoleMasterRequest = {
  JobRoleId: 0,
  UniqueKey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  DepartmentId: 0,
  RoleName: '',
  RoleDescription: '',
  RoleQualification: '',
  RoleResponsibility: '',
  JobRequirement: '',
  RoleSkills: '',
  IsCopy: '0',
}

export const JobRoleMaster: React.FC = () => {

  const [departmentTabList, setDepartmentTabList] = useState<TabItem[]>([]);
  const [jobRoleMasterList, setJobRoleMasterList] = useState<JobRoleMasterData[]>([]);
  const [selectedJobRole, setSelectedJobRole] = useState<JobRoleMasterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isFetchingMoreJobRoleMaster, setIsFetchingMoreJobRoleMaster] = useState(false);

  const navigate = useNavigate();
  const { pagination, setPagination } = usePagination(20);
  const { addToast } = useToast();
  const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
  const [deleteJobRoleMasterDetailsData, setDeleteJobRoleMasterDetailsData] = useState<JobRoleMasterData | null>(null);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const { listState, updateListState } = useJobRoleMasterListState();
  const { searchTerm, departmentId, departmentName } = listState;

  const { canAction, canExport } = useMenuPermissions('/jobRoleMaster');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    searchJobRoleMaster(value);
  }, 350);

  const loadJobRoleMaster = async (pageNumber: number, roleName?: string) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationJobRoleMasterRequest = {
          PageNumber: pageNumber,
          PageSize: pagination.pageSize,
          DepartmentId: departmentId,
          JobRoleName: roleName,
        };

        const response = await jobRoleMasterService.apiCallPullJobRoleMaster(params);

        if (E.isRight(response)) {

          setJobRoleMasterList((prev) =>
            pageNumber === 1
              ? response.right.Data
              : [...prev, ...(Array.isArray(response.right.Data) ? response.right.Data : [])],
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
      'Loading Job Role Master',
    );
  };

  const fetchJobRoleMasterList = async (page: number = 1) => {
    if (searchTerm.trim()) {
      return loadJobRoleMaster(page, searchTerm.trim());
    }
    return loadJobRoleMaster(page);
  };

  const handleJobRoleMasterListScroll = (e: React.UIEvent<HTMLDivElement>) => {

    const el = e.currentTarget;

    const threshold = 60;

    if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {

      if (pagination.currentPage < pagination.totalPages && !isFetchingMoreJobRoleMaster) {

        const nextPage = pagination.currentPage + 1;

        setIsFetchingMoreJobRoleMaster(true);

        fetchJobRoleMasterList(nextPage).finally(() => setIsFetchingMoreJobRoleMaster(false));
      }
    }
  };

  const loadDepartments = async () => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await fetchJobOpeningDepartmentDropdown();
        const departmentList = response.itemList;
        const initialDepartment =
          departmentList.find((tab) => Number(tab.id) === departmentId) ?? departmentList[0];

        setDepartmentTabList(departmentList);

        if (initialDepartment) {
          updateListState({
            departmentId: Number(initialDepartment.id),
            departmentName: initialDepartment.label || '',
          });
        }

        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Loading Departments',
    );
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      loadJobRoleMaster(1, searchTerm.trim());
    } else {
      loadJobRoleMaster(1);
    }
  }, [departmentId]);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  const searchJobRoleMaster = async (searchValue: string) => {
    updateListState({ searchTerm: searchValue });

    if (searchValue.trim() === '') {
      await loadJobRoleMaster(1);
      return;
    }

    await loadJobRoleMaster(1, searchValue.trim());
  };

  const clearSearchJobRoleMaster = () => {
    debouncedSearch.cancel?.();
    updateListState({ searchTerm: '' });
    loadJobRoleMaster(1);
  };

  const handleBackToListJobRoleMaster = () => {
    setSelectedJobRole(null);
  };
  
  const handleViewJobRoleMaster = (jobRole: JobRoleMasterData) => {
    setSelectedJobRole(jobRole);
  };

  const handleEditJobRoleMaster = (jobRole: JobRoleMasterData) => {
    navigate(`/jobRoleMaster/add/${jobRole.JobRoleId}`);
  };

  const handleDepartmentChange = (tab: TabItem) => {
    setJobRoleMasterList([]);
    setSelectedJobRole(null);
    updateListState({
      departmentId: Number(tab.id),
      departmentName: tab.label,
    });
  };

  const handleAddJobRole = () => {
    navigate('/jobRoleMaster/add');
  };

  const handleConfirmationDialogBoxOpen = (jobRole: JobRoleMasterData) => {
    setDeleteJobRoleMasterDetailsData(jobRole);
    setIsConfirmationDialogBoxOpen(true);
  };

  const handleDeleteJobRoleMaster = async () => {

    setIsConfirmationDialogBoxOpen(false);

    if (!deleteJobRoleMasterDetailsData) return;

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteJobRoleMasterRequest = {
          JobRoleId: deleteJobRoleMasterDetailsData.JobRoleId,
          UniqueKey: deleteJobRoleMasterDetailsData.UniqueKey,
        };

        const response = await jobRoleMasterService.apiCallDeleteJobRoleMaster(params);

        if (E.isRight(response)) {

          if (selectedJobRole?.JobRoleId === deleteJobRoleMasterDetailsData.JobRoleId) {
            setSelectedJobRole(null);
          }
          
          
          setPagination({
            currentPage: pagination.currentPage,
            totalRecords: pagination.totalRecords - 1,
            totalPages: Math.ceil((pagination.totalRecords - 1) / pagination.pageSize),
          });
          
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          
          setDeleteJobRoleMasterDetailsData(null);
          
          await loadJobRoleMaster(1);
          await loadDepartments();

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
      'Delete Job Role',
    );
  };

  const handleDuplicateJobRoleMaster = async (jobRole: JobRoleMasterData) => {

    setIsDuplicateDialogOpen(false);

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: AddUpdateJobRoleMasterRequest = {
          JobRoleId: 0,
          UniqueKey: INITIAL_FORM_STATE.UniqueKey,
          DepartmentId: jobRole.DepartmentId,
          RoleName: jobRole.RoleName,
          RoleDescription: jobRole.RoleDescription,
          RoleQualification: jobRole.RoleQualification,
          RoleResponsibility: jobRole.RoleResponsibility,
          JobRequirement: jobRole.JobRequirement,
          RoleSkills: jobRole.RoleSkills,
          IsCopy: '1',
        }

        const response = await jobRoleMasterService.apiCallAddUpdateJobRoleMaster(params);

        if (E.isRight(response)) {
          addToast({ type: 'success', title: response.right.SuccessMessage[0] });
          setSelectedJobRole(null);
          await fetchJobRoleMasterList(1);
          await loadDepartments();
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
      'Duplicate Job Role',
    );
  };

  const detailBreadcrumbItems = [
    { id: 'job-roles', label: 'Job Roles', onClick: handleBackToListJobRoleMaster },
    {
      id: 'department',
      label: selectedJobRole?.DepartmentName || departmentName || '-',
    },
  ];


  const handleExportJobRoleMaster = async (exportType: 'Excel' | 'PDF') => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {
        const response = await jobRoleMasterService.apiCallPullJobRoleMaster({
          PageNumber: 1,
          PageSize: pagination.totalRecords,
          DepartmentId: departmentId,
          JobRoleName: searchTerm,
          ExportType: exportType,
        });

        handleExportFile(response, exportType, 'Job Role Master', addToast);
        return response;
      },
      undefined,
      (error: any) => addToast({ type: 'error', title: error.message }),
      undefined,
      'Exporting Job Role Master',
    );
  };

  
  return (
    <div className="bg-[#F9FAFB] rounded-lg shadow-sm border border-gray-200 p-5">
    <Loader loading={isLoading} title={loadingMessage}> <div /></Loader>

       <TableActionToolbar
         isShowSearchBar
         searchTerm={searchTerm}
         searchPlaceholder="Search By JobRole"
         onSearchChange={(v) => {
           updateListState({ searchTerm: v });
           debouncedSearch(v);  
         }}
          onClearSearch={clearSearchJobRoleMaster}
          isShowFilterButton={false}
          isShowCustomizeButton={false}
          isShowAddButton={false}
          isShowExportButton={canExport}
          onExportExcel={() => handleExportJobRoleMaster('Excel')}
          onExportPdf={() => handleExportJobRoleMaster('PDF')}
      />

        {departmentTabList.length === 0 && !isLoading ? (
          <NoDataView message="No Departments Found" />
        ) : (
        <div className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-4">
          <div className="min-w-0 lg:col-span-1">
            <aside className="flex flex-col rounded-lg border border-gray-200 p-4">
              <h2 className="shrink-0 pb-3 text-base font-semibold text-gray-900">Department</h2>
              <Tabs
                tabs={departmentTabList}
                defaultActive={String(departmentId)}
                isvertical
                onTabChange={handleDepartmentChange}
              />
              
            </aside>
          </div>

          <div className="min-w-0 lg:col-span-3">
            {selectedJobRole ? (
              <>
                <Breadcrumb isinline items={detailBreadcrumbItems} className="mb-3" />
                  <div
                    className="thin-scroll min-h-0 flex-1 overflow-y-auto pr-1"
                    style={{ maxHeight: '65vh' }}
                  >
                    <h1 className="mb-4 text-lg font-semibold text-gray-900">
                      {selectedJobRole.RoleName || '-'}
                    </h1>

                    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
                      <div className="min-w-0 lg:col-span-2">
                        <section className="min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                          <div className="border-b border-gray-200 px-4 py-4 sm:px-5 sm:py-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <ListChecks className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <FieldItem label="Description" value={selectedJobRole.RoleDescription} />
                              </div>
                            </div>
                          </div>

                          <div className="border-b border-gray-200 px-4 py-4 sm:px-5 sm:py-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                                <ClipboardCheck className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <FieldItem label="Responsibilities" value={selectedJobRole.RoleResponsibility} />
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-4 sm:px-5 sm:py-5">
                            <div className="mb-4 flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50">
                                <FileText className="h-4 w-4 text-orange-500" />
                              </div>
                              <h3 className="text-sm font-medium text-gray-500">Requirements &amp; Qualifications</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                              <FieldItem label="Education" value={selectedJobRole.RoleQualification} />
                              <FieldItem label="Technical" value={selectedJobRole.JobRequirement} />
                            </div>
                          </div>
                        </section>
                      </div>

                      <div className="min-w-0 lg:col-span-1">
                        <aside className="flex min-w-0 w-full flex-col gap-4">
                          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
                            <div className="mb-4 flex items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <Braces className="h-4 w-4 text-blue-600" />
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900">Tech Stack</h3>
                            </div>

                              <div>
                                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                  Technical Skills
                                </p>
                                <div className="flex flex-wrap gap-2">
                                
                                    <span
                                  
                                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600"
                                    >
                                      {selectedJobRole.RoleSkills}
                                    </span>
                                
                                </div>
                              </div>
                           
                          </div>

                        
                            <div className="rounded-lg bg-gray-900 px-4 py-4 text-center text-white">
                              <p className="mb-3 text-xs leading-4 text-gray-400">
                                Need to duplicate this role for another department?
                              </p>
                              <Button
                                onClick={() => setIsDuplicateDialogOpen(true)}
                                loading={isLoading}
                                loadingText="Duplicating..."
                                color="black"
                                colorMode="light"
                                size="sm"
                                fullWidth
                              >
                                Duplicate Job Role
                              </Button>
                            </div>
                        </aside>
                      </div>
                    </div>
                  </div>
              </>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    {
                      (departmentId > 0 && departmentName.trim().length > 0) && (
                        <Breadcrumb isinline items={[
                          {
                            id: 'department',
                            label: departmentName,
                          },
                        ]} />
                      )
                    }
                  </div>
                  {canAction && (
                    <Button
                      onClick={handleAddJobRole}
                      color="blue"
                      size="sm"
                      title="Add Role"
                      leftIcon={<Plus className="h-4 w-4" />}
                    >
                     Add Role
                    </Button>
                  )}
                </div>
             {   jobRoleMasterList.length === 0 && !isLoading ? (
                  <NoDataView message="No Job Roles Found" />
                ) :    <div
                  className="thin-scroll min-h-0 space-y-3 overflow-y-auto pr-1"
                  onScroll={handleJobRoleMasterListScroll}
                  style={{ maxHeight: '65vh' }}
                >
                  {jobRoleMasterList.map((jobRole) => {

                    return (
                        <div
                          key={jobRole.JobRoleId}
                          className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-blue-300 hover:bg-gray-50"
                        >
                          <div className="min-w-0 flex-1">
                            <TooltipText
                              text={jobRole.RoleName}
                              maxWidth="560px"
                              tooltipThreshold={48}
                              onClick={() => handleViewJobRoleMaster(jobRole)}
                            />
                          </div>

                          <div className="flex shrink-0 items-center justify-end gap-2">
                         

                              <div className="flex items-center gap-2">
                                <Button
                                  color="transparent"
                                  size="sm"
                                  isborderRadius
                                  title="Edit"
                                  onClick={() => handleEditJobRoleMaster(jobRole)}
                                >
                                  <Edit className="h-4 w-4 text-blue-700" />
                                </Button>
                                <Button
                                  color="transparent"
                                  size="sm"
                                  isborderRadius
                                  title="Delete"
                                  onClick={() => handleConfirmationDialogBoxOpen(jobRole)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                          </div>
                        </div>
                      );
                    })}

                  {isFetchingMoreJobRoleMaster && (
                    <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
                  )}
                </div>}
              </>
            )}
          </div>
        </div>
        )}
      

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
        onConfirm={() => handleDuplicateJobRoleMaster(selectedJobRole!)}
        loading={isLoading}
        title="Duplicate Job Role?"
        message={`This will create a copy of "${selectedJobRole?.RoleName}".`}
        confirmText="Duplicate"
        variant="info"
      />
    </div>
  );
};

export default JobRoleMaster;
