import useToast from '@/core/hooks/useToast';
import { Loader } from '@/core/utils/loader';
import type { EmployeeMasterData, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import { DataTable, type FilterInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { Button, Input } from '@/ui/components/forms';
import Checkbox from '@/ui/components/forms/Checkbox';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { Modal } from '@/ui/components/Modal/Modal';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import type { AddUpdateProjectMasterWithEmployeeRequest, DeleteProjectMasterWithEmployeeRequest } from '@/features/projectMaster/models/ProjectMasterModel';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import usePagination from '@/core/hooks/usePagination';
import { runApiWithLoader } from '@/core/utils';
import { Search, Trash2 } from 'lucide-react';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { useProjectMasterListState } from '@/features/projectMaster/context/ProjectMasterListStateContext';
import { DeleteDialog } from '@/ui/components/forms/DeleteDialog';

const Employee: React.FC = () => {
  //#region STATE MANAGEMENT
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);

  // TOAST
  const { addToast } = useToast()

  //LOCATION
  const navigate = useNavigate();

  const { listState } = useProjectMasterListState();
  const projectId = listState.projectId;
  const projectName = listState.projectName;
  const uniquekey = listState.uniquekey;

  //FILTER STATES
  const [filters, setFilters] = useState<FilterInfo>({});

  //#endregion

  //#region MENU PERMISSIONS
  const { canAction } = useMenuPermissions('/projectMaster');
  //#endregion


  //#region INIT
  useEffect(() => {

    loadProjectMasterWithEmployee(projectId);

  }, []);
  //#endregion


  //#region PROJECT MASTER WITH EMPLOYEE MODULE
  const [isOpenAddProjectMasterWithEmployee, setIsOpenAddProjectMasterWithEmployee] = useState(false);

  const { pagination: employeePagination, setPagination: setEmployeePagination } = usePagination(20);


  const [isFetchingMoreEmployee, setIsFetchingMoreEmployee] = useState(false);
  const [employeeForProject, setEmployeeForProject] = useState<EmployeeMasterData[]>([]);

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([]);

  const toggleEmployeeSelection = (id?: number) => {
    if (!id) return;
    setSelectedEmployeeIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });

  };

  const visibleEmployeeIds = employeeForProject.map(e => e.EmployeeId).filter(Boolean) as number[];

  const isAllEmployeeVisibleSelected = visibleEmployeeIds.length > 0 && visibleEmployeeIds.every(id => selectedEmployeeIds.includes(id));


  const toggleEmployeeSelectAllVisible = () => {
    setSelectedEmployeeIds(prev => {
      if (isAllEmployeeVisibleSelected) {

        return prev.filter(id => !visibleEmployeeIds.includes(id));
      } else {

        const set = new Set<number>([...prev, ...visibleEmployeeIds]);
        return Array.from(set);
      }
    });
  };

  //DELETE CONFIRMATION BOX 
  const [isConfirmationDialogBoxOpenForEmployee, setIsConfirmationDialogBoxOpenForEmployee] = useState(false)

  const [deleteProjectMasterWithEmployeeData, setDeleteProjectMasterWithEmployeeData] = useState<EmployeeMasterData | null>(null)

  // SINGLE SEARCH TEXT BOX
  const [searchTermForEmployee, setSearchTermForEmployee] = useState('')
  const debouncedEmployeeSearch = useDebouncedCallback((value: string) => {
    searchEmployee(value)
  }, 350)

  //#endregion

  //#region SERACH EMPLOYEE  
  const searchEmployee = async (searchValue: string) => {
    setSearchTermForEmployee(searchValue);

    if (searchValue.trim() === '') {
      const emptyFilters: FilterInfo = {};
      setFilters(emptyFilters);
      await loadEmployees(1, emptyFilters);
      return;
    }

    const filterParams: FilterInfo = {
      EmployeeName: searchValue.trim(),
    };

    setFilters(filterParams);
    await loadEmployees(1, filterParams);
  };

  //#endregion

  //#region DATA LOAD PROJECT WITH EMPLOYEE | COMPANY | BANK DETAILS

  const loadProjectMasterWithEmployee = async (ProjectId: number) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const response = await ProjectMasterService.apiCallPullProjectMasterWithEmployee(ProjectId);

        if (E.isRight(response)) {

          syncEmployeeSelection(response.right.Data);


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
      'Loading Employee'
    );
  };


  const syncEmployeeSelection = (data: EmployeeMasterData[] = []) => {

    setEmployeeMasterList(data);

    const assignedIds = data.map(e => e.EmployeeId).filter(Boolean) as number[];

    setSelectedEmployeeIds(assignedIds);
  };

  //#endregion 


  //#region CONFIRMATION DIALOG BOX IN PROJECT MASTER WITH EMPLOYEE

  const handleConfirmationDialogBoxOpenForEmployee = useCallback((row: EmployeeMasterData) => {
    setDeleteProjectMasterWithEmployeeData(row)
    setIsConfirmationDialogBoxOpenForEmployee(true)
  }, [])

  //#endregion

  //#region TABLE COLUMN
  const projectMasterWithEmployeeColumns = useMemo<TableColumn[]>(
    () => [
      {
        key: 'EmployeeCode',
        label: 'Employee Code',
        width: '14',
        sortable: false,
        align: 'center',
        render: value => (
          <TooltipText
            text={value || 'N/A'}
            maxWidth="140px"
            tooltipThreshold={14}
            tooltipClassName="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 overflow-hidden text-ellipsis whitespace-nowrap"
          />
        )
      },
      {
        key: 'FullName',
        label: 'Full Name',
        width: '22',
        sortable: false,
        fixed: 'left',
        align: 'left',
        render: (value, row) => {
          const fullName = (row?.FullName ?? '').trim();
          const initials = fullName
            ? fullName
              .split(/\s+/)
              .map((w: string) => (w && w.length ? w[0] : ''))
              .join('')
              .toUpperCase()
              .slice(0, 2)
            : 'NA';

          return (
            <div className={`flex items-center justify-between gap-3`}>
              {/* left: avatar + name */}
              <div className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-full
                       bg-blue-200 
                       flex items-center justify-center
                       text-gray-800 font-medium text-xs
                       border border-gray-300"
                  title={fullName || 'N/A'}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <TooltipText
                    text={value || row.FirstName || 'N/A'}
                    maxWidth="260px"
                    tooltipThreshold={26}

                  />
                </div>

              </div>

              <div className="flex items-center justify-end ml-2 w-20">
                {canAction ?
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setIsOpenAddProjectMasterWithEmployee(false)
                      handleConfirmationDialogBoxOpenForEmployee(row)
                    }}
                    color='transparent'
                    fullWidth
                    isborderRadius
                    size='sm'
                    style={{
                      color: 'red',
                      padding: '0px 8px'
                    }}
                    title="Delete Employee"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  : ""}
              </div>
            </div>

          );
        }
      },


      {
        key: 'PersonalMobileNumber',
        label: 'Personal Mobile Number',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value ? `+91 ${value}` : '-'

      },
      {
        key: 'EmailId',
        label: 'Email Id',
        width: '14',
        sortable: false,
        align: 'left',
        render: value => value || 'N/A'
      },
      {
        key: 'Department',
        label: 'Department',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },
      {
        key: 'Designation',
        label: 'Designation',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },

      {
        key: 'ReportPersonName',
        label: 'Report Person Name',
        width: '14',
        sortable: true,
        align: 'left',
        render: value => (
          <TooltipText text={value || 'N/A'} maxWidth="160px" tooltipThreshold={16} />
        )
      },
      {
        key: 'JoiningDate',
        label: 'Joining Date',
        width: '14',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : 'N/A')
      },

      {
        key: 'LastLogin',
        label: 'Last Login',
        width: '16',
        sortable: true,
        align: 'center',
        render: value => (value ? formatDate_dd_MonthName_yy(value) : '-')
      }
    ],
    [handleConfirmationDialogBoxOpenForEmployee]

  );
  //#endregion

  //#region  BACK TO PROJECT MASTER PAGE
  const handleBackToListProjectMaster = () => {
    navigate("/projectMaster");
  };
  //#endregion

  //#region ADD UPDATE EMPLOYEE MODAL IN PROJECT

  const handleAddUpdateProjectMasterWithEmployeeModal = () => {

    setEmployeeForProject([]);

    setSearchTermForEmployee("");

    setEmployeePagination({
      currentPage: 1,
      pageSize: employeePagination.pageSize,
      totalRecords: 0,
      totalPages: 0,
    });


    const assignedIds = (employeeMasterList || [])
      .map(e => e.EmployeeId)
      .filter(Boolean) as number[];
    setSelectedEmployeeIds(assignedIds);


    fetchEmployeeList(1);

    setIsOpenAddProjectMasterWithEmployee(true);

  }
  //#endregion

  //#region PROJECT MASTER WITH EMPLOYEE LIST SCROLL EVENT

  const handleEmployeeListScrollInProjectMasterWithEmployee = (e: React.UIEvent<HTMLDivElement>) => {

    const el = e.currentTarget;
    const threshold = 60; // how close to bottom before loading next page

    if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {

      if (employeePagination.currentPage < (employeePagination.totalPages || 0) && !isFetchingMoreEmployee) {
        const nextPage = employeePagination.currentPage + 1;
        setIsFetchingMoreEmployee(true);
        fetchEmployeeList(nextPage).finally(() => setIsFetchingMoreEmployee(false));
      }
    }
  };
  //#endregion

  //#region DATA LOADING | FETCH | FOR ADD EMPLOYEE IN PROJECT 

  const fetchEmployeeList = async (page: number = 1) => {
    return loadEmployees(page, filters);
  };


  const loadEmployees = async (page: number, filterParams: FilterInfo) => {
    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,
      async () => {

        const params: FilterWithPaginationEmployeeMasterRequest = {
          PageNumber: page,
          PageSize: employeePagination.pageSize,
          EmployeeName: filterParams.EmployeeName?.trim() || undefined,
        }

        const response = await employeeMasterService.apiCallPullEmployeeMaster(params);

        if (E.isRight(response)) {

          setEmployeeForProject(prev =>
            page === 1
              ? response.right.Data
              : [...prev, ...(Array.isArray(response.right.Data) ? response.right.Data : [])]
          );

          setEmployeePagination({
            currentPage: page,
            totalRecords: response.right.TotalNumberOfRecord,
            totalPages: Math.ceil(response.right.TotalNumberOfRecord / employeePagination.pageSize),
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
      'Loading Employee'
    )
  }
  //#endregion

  //#region DELETE PROJECT MASTER WITH EMPLOYEE
  const handleDeleteProjectMasterWithEmployee = async () => {

    setIsConfirmationDialogBoxOpenForEmployee(false);

    if (!deleteProjectMasterWithEmployeeData) return

    await runApiWithLoader(
      setIsLoading,
      setLoadingMessage,

      async () => {

        const params: DeleteProjectMasterWithEmployeeRequest = {
          ProjectId: projectId,
          Uniquekey: uniquekey,
          EmployeeId: String(deleteProjectMasterWithEmployeeData.EmployeeId)
        }

        const response = await ProjectMasterService.apiCallDeleteProjectMasterWithEmployee(params);

        if (E.isRight(response)) {

          setEmployeeMasterList(prevData => prevData.filter(item => item.EmployeeId !== deleteProjectMasterWithEmployeeData.EmployeeId));

          setEmployeePagination({
            currentPage: employeePagination.currentPage,
            totalRecords: employeePagination.totalRecords - 1,
            totalPages: Math.ceil((employeePagination.totalRecords - 1) / employeePagination.pageSize)
          });

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

          setIsConfirmationDialogBoxOpenForEmployee(false);

          setDeleteProjectMasterWithEmployeeData(null);

        } else {
          addToast({ type: 'error', title: response.left.message });

          setIsConfirmationDialogBoxOpenForEmployee(false);
        }

        return response
      },
      undefined,
      (error: any) => {
        addToast({ type: 'error', title: error.message })
      },
      undefined,
      'Delete Employee'
    )
  }

  //#endregion

  //#region ADD UPDATE PROJECT MASTER WITH EMPLOYEE

  //============================================================= [VALIDATION FUNCTION] =============================================================================================

  const PushProjectMasterWithEmployeeData = (): AddUpdateProjectMasterWithEmployeeRequest => {
    return {
      ProjectId: projectId,
      Uniquekey: uniquekey,
      EmployeeId: selectedEmployeeIds.join(',')
    };

  };

  const handleAddUpdateProjectMasterWithEmployee = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedEmployeeIds.join(',') === "") {

      addToast({ type: "error", title: "At least one employee is required" });
      return
    }

    await runApiWithLoader(
      setIsLoading,

      setLoadingMessage,
      async () => {

        const payload = PushProjectMasterWithEmployeeData();

        const response = await ProjectMasterService.apiCallAddUpdateProjectMasterWithEmployee(payload);

        if (E.isRight(response)) {

          syncEmployeeSelection(response.right.Data);

          setIsOpenAddProjectMasterWithEmployee(false);

          setSelectedEmployeeIds([]);

          setSearchTermForEmployee("");

          addToast({ type: 'success', title: response.right.SuccessMessage[0] })

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

      "Add Project Master With Employee"
    )

  };

  //#endregion


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" >
      <Loader loading={isLoading} title={loadingMessage}>
        <div></div>
      </Loader>

      <HeaderActionBar
        titleText={'Employee Details : '}
        subTitleText={projectName}
        cancelText="Cancel"
        EditText="Add"
        onCancel={() => handleBackToListProjectMaster()}
        canAction={canAction}
        onEdit={() => {
          handleAddUpdateProjectMasterWithEmployeeModal();

        }}
        isLoading={isLoading}
      />
      <div className='pt-5'>
        <DataTable
          data={employeeMasterList}
          columns={projectMasterWithEmployeeColumns}
          emptyMessage="No Employee Data Found"
          fixedHeight={true}
          maxHeight="calc(100vh - 255px)"
          recordsPerPage={20}
          className="flex-1"
          loading={isLoading}
        />
      </div>

      {/* IN PROJECT MASTER WTTH EMPLOYEE MODAL */}
      <Modal
        isOpen={isOpenAddProjectMasterWithEmployee}
        onClose={() => setIsOpenAddProjectMasterWithEmployee(false)}
        title="Add Employee"
        onSubmit={handleAddUpdateProjectMasterWithEmployee}
        saveText="Save"
        resetText=""
        size="large75"
      >
        <div className="space-y-4">

          <div className="px-2 py-2 border-b">
            <div className="flex items-center gap-3 w-full">

              {/* Select ALL */}
              <Checkbox

                id="select-all-employees"
                checked={isAllEmployeeVisibleSelected}
                onChange={() => toggleEmployeeSelectAllVisible()}
              />
              <div className="relative min-w-0 w-[526px]">
                <Input
                  type="text"
                  value={searchTermForEmployee}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSearchTermForEmployee(v);
                    debouncedEmployeeSearch(v);
                  }}
                  placeholder="Search By Employee"
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}

                />
              </div>


              <span className="text-sm text-gray-600 whitespace-nowrap right">
                {selectedEmployeeIds.length} selected
              </span>

            </div>
          </div>


          <div className="space-y-4">
            <div
              className="flex-1 min-h-0 overflow-auto thin-scroll divide-y divide-gray-200"
              onScroll={handleEmployeeListScrollInProjectMasterWithEmployee}
              style={{ maxHeight: '55vh' }}>
              {employeeForProject.length > 0 ? (

                employeeForProject.map((n, i) => {

                  const id = n.EmployeeId ?? i;
                  const checked = selectedEmployeeIds.includes(id);

                  return (
                    <div key={id}
                      className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer px-2"
                      onClick={(ev) => {
                        if ((ev.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                        toggleEmployeeSelection(id);
                      }}>
                      <div className="flex items-center">

                        <Checkbox
                          checked={checked}
                          onChange={() => toggleEmployeeSelection(id)}
                          onClick={(ev) => ev.stopPropagation()}
                          aria-label={`Select ${n.FullName}`}
                        />

                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mt-1">
                          <p className="text-sm text-gray-800 whitespace-normal break-words">
                            {n.FullName}
                          </p>

                          <div className="text-xs text-gray-500">
                            {n.EmployeeCode ? n.EmployeeCode : null}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-1">
                          <p className="text-xs text-gray-500 flex-1 whitespace-normal break-words">
                            Department : {n.Department}
                          </p>

                        </div>

                      </div>
                    </div>
                  );
                })
              ) : (
                <NoDataView />
              )}

              {isFetchingMoreEmployee && (

                <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION PROJECT MASTER WTTH EMPLOYEE MODAL */}
      <DeleteDialog
        isOpen={isConfirmationDialogBoxOpenForEmployee}
        onClose={() => {
          setIsConfirmationDialogBoxOpenForEmployee(false)
          setDeleteProjectMasterWithEmployeeData(null)
        }}
        onConfirm={handleDeleteProjectMasterWithEmployee}
        loading={isLoading}
        pageName='employee'
      />

    </div>
  )
}

export default Employee
