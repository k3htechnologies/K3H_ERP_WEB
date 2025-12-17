import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Tabs } from '@/ui/components/Tab/Tab';
import { Edit, Search, Trash2 } from 'lucide-react';
import { Button, Input } from '@/ui/components/forms';
import type { AddUpdateProjectMasterWithBankDetailsRequest, AddUpdateProjectMasterWithCompanyRequest, AddUpdateProjectMasterWithEmployeeRequest, DeleteProjectMasterWithBankDetailsRequest, DeleteProjectMasterWithEmployeeRequest, ProjectMasterData, ProjectWithBankDetails } from '@/features/projectMaster/models/ProjectMasterModel';
import ImageCarousel from '@/ui/components/ImageViewer/ImageCarousel';
import { runApiWithLoader } from '@/core/utils';
import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import type { EmployeeMasterData, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import useToast from '@/core/hooks/useToast';
import type { CompanyMasterData, FilterWithPaginationCompanyMasterRequest } from '@/features/companyMaster/models/CompanyMasterModel';
import { Modal } from '@/ui/components/Modal/Modal';
import usePagination from '@/core/hooks/usePagination';
import { employeeMasterService } from '@/features/employeeMaster/services/EmployeeMasterService';
import Checkbox from '@/ui/components/forms/Checkbox';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import ConfirmationDialogBox from '@/core/utils/confirmationDialogBox';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { DataTable, type FilterInfo, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { CompanyMasterService } from '@/features/companyMaster/services/CompanyMasterService';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import SingleSelectDropdownWithPagination from '@/ui/components/DropDown/SingleSelectDropdownWithPagination';
import { fetchBankListMasterDropdown } from '@/features/bankListMaster/bankListMasterDropDown';
import { createDropdownInitialValue } from '@/core/utils/createDropdownInitialValue';
import { filterIFSC, filterNumbers, isValidIFSC } from '@/core/utils/fileValidation';
import { BANK_ACCOUNT_TYPE } from '@/core/constants';
import { SinglePageSelection } from '@/ui/components/DropDown/SinglePageSelection';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';

const initialFormState = (): AddUpdateProjectMasterWithBankDetailsRequest => ({

    ProjectWithBankDetailsId: 0,
    Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    ProjectId: 0,
    BeneficiaryAccountHolderName: '',
    BankListMasterId: 0,
    AccountNumber: '',
    Branch: '',
    IFSCCode: '',
    AcType: ''
});

export const ViewProjectMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    const [compantMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);
    const [projectWithBankDetailsList, setProjectWithBankDetailsList] = useState<ProjectWithBankDetails[]>([]);

    // TOAST
    const { addToast } = useToast()

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editProjectMasterData?: ProjectMasterData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTermForEmployee?: string;
            };
        };
    };
    const preservedListState = location.state?.listState;

    //FILTER STATES
    const [filters, setFilters] = useState<FilterInfo>({});

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/projectMaster');
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

    //#region PROJECT MASTER WITH Company MODULE
    const [isOpenAddProjectMasterWithCompany, setIsOpenAddProjectMasterWithCompany] = useState(false);

    const { pagination: companyPagination, setPagination: setCompanyPagination } = usePagination(20);

    const [isFetchingMoreCompany, setIsFetchingMoreCompany] = useState(false);

    const [companyMasterForProject, setCompanyMasterForProject] = useState<CompanyMasterData[]>([]);

    const [selectedCompanyIds, setSelectedCompanyIds] = useState<number[]>([]);

    const toggleCompanySelection = (id?: number) => {
        if (!id) return;
        setSelectedCompanyIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            return [...prev, id];
        });

    };

    const visibleCompanyIds = companyMasterForProject.map(e => e.CompanyId).filter(Boolean) as number[];

    const isAllCompanyVisibleSelected = visibleCompanyIds.length > 0 && visibleCompanyIds.every(id => selectedCompanyIds.includes(id));


    const toggleCompanySelectAllVisible = () => {
        setSelectedCompanyIds(prev => {
            if (isAllCompanyVisibleSelected) {

                return prev.filter(id => !visibleCompanyIds.includes(id));
            } else {

                const set = new Set<number>([...prev, ...visibleCompanyIds]);
                return Array.from(set);
            }
        });
    };

    // SINGLE SEARCH TEXT BOX
    const [searchTermForCompany, setSearchTermForCompany] = useState('')
    const debouncedCompanySearch = useDebouncedCallback((value: string) => {
        searchCompany(value)
    }, 350)


    //#endregion

    //#region PROJECT MASTER WITH BANK DETAILS MODULE

    //ADD UPDATE PROJECT MASTER WITH BANK DETAILS

    //SET DROP DOWN 
    const [dropdownLabels, setDropdownLabels] = useState<{
        bankName?: string;
    }>({});

    const [formDataForBankDetails, setFormDataForBankDetails] = useState<AddUpdateProjectMasterWithBankDetailsRequest>(() => initialFormState());

    //ERROR SET UP
    const [errorsForBankDetails, setErrorsForBankDetails] = useState<{ [k: string]: string }>({});

    // EDIT PROJECT MASTER WITH BANK DETAILS
    const [editingProjectMasterWithBankDetailsData, setEditingProjectMasterWithBankDetailsData] = useState<ProjectWithBankDetails | null>(null);
    const [isAddUpdateModalOpenForBankDetails, setIsAddUpdateModalOpenForBankDetails] = useState(false);

    const [isConfirmationDialogBoxOpenForBankDetails, setIsConfirmationDialogBoxOpenForBankDetails] = useState(false)

    const [deleteProjectMasterWithBankDetailsData, setDeleteProjectMasterWithBankDetailsData] = useState<ProjectWithBankDetails | null>(null)
    //#endregion
    //#endregion

    //#region Get PROJECT MASTER DATA FROM LOCATION STATE
    const editProjectData = (location.state?.editProjectMasterData ?? null) as ProjectMasterData | null;
    //#endregion

    //#region TAB ACTIVITY
    const TabList = [
        { id: "Employee", label: 'Employee' },
        { id: "Bank Details", label: 'Bank Details' },
        { id: "Company", label: 'Company' },
        { id: "Set Approval", label: "Set Approval" },
    ];


    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (activeTab === 'Employee') {

            loadProjectMasterWithEmployee(editProjectData!.ProjectId);
        }
        else if (activeTab === 'Bank Details') {

            loadProjectMasterWithBankDetails(editProjectData!.ProjectId);

        }
        else if (activeTab === 'Company') {

            loadProjectMasterWithCompany(editProjectData!.ProjectId);

        }

    }, [activeTab]);


    useEffect(() => {
        return () => {
            debouncedEmployeeSearch.cancel?.()
            debouncedCompanySearch.cancel?.();
        }
    }, [debouncedEmployeeSearch, debouncedCompanySearch])


    useEffect(() => {
        if (isAddUpdateModalOpenForBankDetails) {
            if (editingProjectMasterWithBankDetailsData) {

                setFormDataForBankDetails({
                    ProjectWithBankDetailsId: editingProjectMasterWithBankDetailsData.ProjectWithBankDetailsId,
                    Uniquekey: editingProjectMasterWithBankDetailsData.Uniquekey || initialFormState().Uniquekey,
                    BeneficiaryAccountHolderName: editingProjectMasterWithBankDetailsData.BeneficiaryAccountHolderName || "",
                    ProjectId: editingProjectMasterWithBankDetailsData.ProjectId,
                    BankListMasterId: editingProjectMasterWithBankDetailsData.BankListMasterId || 0,
                    AccountNumber: editingProjectMasterWithBankDetailsData.AccountNumber || "",
                    Branch: editingProjectMasterWithBankDetailsData.Branch || "",
                    IFSCCode: editingProjectMasterWithBankDetailsData.IFSCCode || "",
                    AcType: editingProjectMasterWithBankDetailsData.AcType || ""
                });

                setDropdownLabels({
                    bankName: editingProjectMasterWithBankDetailsData.BankName || ""
                });

            } else {
                setFormDataForBankDetails(initialFormState());
            }
            setErrorsForBankDetails({});
        }
    }, [isAddUpdateModalOpenForBankDetails, editingProjectMasterWithBankDetailsData]);

    //#endregion

    //#region DATA LOAD PROJECT WITH EMPLOYEE | COMPANY | BANK DETAILS

    const loadProjectMasterWithEmployee = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
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


    const loadProjectMasterWithCompany = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithCompany(ProjectId);

                if (E.isRight(response)) {

                    syncCompanySelection(response.right.Data);

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
            'Loading Company'
        );
    };

    const syncCompanySelection = (data: CompanyMasterData[] = []) => {

        setCompanyMasterList(data);

        const assignedIds = data.map(e => e.CompanyId).filter(Boolean) as number[];

        setSelectedCompanyIds(assignedIds);
    };


    const loadProjectMasterWithBankDetails = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithBankDetails(ProjectId);

                if (E.isRight(response)) {

                    setProjectWithBankDetailsList(response.right.Data);

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
            'Loading Bank Details'
        );
    };

    //#endregion 

    //#region EDIT PROJECT
    const handleEditProjectMaster = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate(`/projectMaster/add/${row.ProjectId}`, {
            state: {
                editProjectMasterData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTermForEmployee: '' }
            }
        });
    };
    //#endregion

    //#region BACK VIEW PROJECT PAGE TO TABLE PROJECT MASTER
    const handleBackToListProjectMaster = () => {
        navigate('/projectMaster', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTermForEmployee: '' } }
        });
    };
    //#endregion

    //#region PROJECT WITH EMPLOYEE 

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
        []

    );
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
            setIsLoadingMessage,
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

    //#region ADD UPDATE EMPLOYEE IN PROJECT
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

    //#region ADD UPDATE PROJECT MASTER WITH EMPLOYEE

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================

    const PushProjectMasterWithEmployeeData = (): AddUpdateProjectMasterWithEmployeeRequest => {
        return {
            ProjectId: editProjectData!.ProjectId,
            Uniquekey: editProjectData!.Uniquekey,
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

            setIsLoadingMessage,
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

    //#region CONFIRMATION DIALOG BOX IN PROJECT MASTER WITH EMPLOYEE

    const handleConfirmationDialogBoxOpenForEmployee = useCallback((row: EmployeeMasterData) => {
        setDeleteProjectMasterWithEmployeeData(row)
        setIsConfirmationDialogBoxOpenForEmployee(true)
    }, [])

    //#endregion

    //#region DELETE PROJECT MASTER WITH EMPLOYEE
    const handleDeleteProjectMasterWithEmployee = async () => {

        setIsConfirmationDialogBoxOpenForEmployee(false);

        if (!deleteProjectMasterWithEmployeeData) return

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,

            async () => {

                const params: DeleteProjectMasterWithEmployeeRequest = {
                    ProjectId: editProjectData!.ProjectId,
                    Uniquekey: editProjectData!.Uniquekey,
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
    //#endregion

    //#region PROJECT WITH COMPANY 

    //#region TABLE COLUMN

    const projectMasterWithCompanyColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'CompanyName',
                label: 'Company Name',
                width: '33',
                sortable: false,
                align: 'center',
                fixed: 'left',
                render: (value) => value || ''
            },
            {
                key: 'CompanyType',
                label: 'Company Type',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'ContactPerson',
                label: 'Contact Person',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'MobileNumber',
                label: 'Mobile Number',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'CityName',
                label: 'City',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },

        ],
        []
    )

    //#endregion

    //#region PROJECT MASTER WITH EMPLOYEE LIST SCROLL EVENT
    const handleCompanyListScrollInProjectMasterWithCompany = (e: React.UIEvent<HTMLDivElement>) => {

        const el = e.currentTarget;
        const threshold = 60; // how close to bottom before loading next page

        if (el.scrollHeight - el.scrollTop <= el.clientHeight + threshold) {

            if (companyPagination.currentPage < (companyPagination.totalPages || 0) && !isFetchingMoreCompany) {
                const nextPage = companyPagination.currentPage + 1;
                setIsFetchingMoreCompany(true);
                fetchCompanyList(nextPage).finally(() => setIsFetchingMoreCompany(false));
            }
        }
    };
    //#endregion

    //#region DATA LOADING | FETCH | FOR ADD COMPANY IN PROJECT 

    const fetchCompanyList = async (page: number = 1) => {
        return loadCompanys(page, filters);
    };


    const loadCompanys = async (page: number, filterParams: FilterInfo) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationCompanyMasterRequest = {
                    PageNumber: page,
                    PageSize: companyPagination.pageSize,
                    IsCheckPermission: false,
                    CompanyName: filterParams.CompanyName?.trim() || undefined,
                }

                const response = await CompanyMasterService.apiCallPullCompanyMaster(params);

                if (E.isRight(response)) {

                    setCompanyMasterForProject(prev =>
                        page === 1
                            ? response.right.Data
                            : [...prev, ...(Array.isArray(response.right.Data) ? response.right.Data : [])]
                    );

                    setCompanyPagination({
                        currentPage: page,
                        totalRecords: response.right.TotalNumberOfRecord,
                        totalPages: Math.ceil(response.right.TotalNumberOfRecord / companyPagination.pageSize),
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
            'Loading Company'
        )
    }
    //#endregion

    //#region ADD UPDATE COMPANY IN PROJECT
    const handleAddUpdateProjectMasterWithCompanyModal = () => {

        setCompanyMasterForProject([]);

        setSearchTermForCompany("");

        setCompanyPagination({
            currentPage: 1,
            pageSize: companyPagination.pageSize,
            totalRecords: 0,
            totalPages: 0,
        });


        const assignedIds = (compantMasterList || [])
            .map(e => e.CompanyId)
            .filter(Boolean) as number[];
        setSelectedCompanyIds(assignedIds);

        fetchCompanyList(1);

        setIsOpenAddProjectMasterWithCompany(true);

    }
    //#endregion

    //#region ADD UPDATE PROJECT MASTER WITH COMPANY

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================

    const PushProjectMasterWithCompanyData = (): AddUpdateProjectMasterWithCompanyRequest => {
        return {
            ProjectId: editProjectData!.ProjectId,
            Uniquekey: editProjectData!.Uniquekey,
            CompanyId: selectedCompanyIds.join(',')
        };

    };

    const handleAddUpdateProjectMasterWithCompany = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedCompanyIds.join(',') === "") {

            addToast({ type: "error", title: "At least one company is required" });
            return
        }

        await runApiWithLoader(
            setIsLoading,

            setIsLoadingMessage,
            async () => {

                const payload = PushProjectMasterWithCompanyData();

                const response = await ProjectMasterService.apiCallAddUpdateProjectMasterWithCompany(payload);

                if (E.isRight(response)) {

                    syncCompanySelection(response.right.Data);

                    setIsOpenAddProjectMasterWithCompany(false);

                    setSelectedCompanyIds([]);

                    setSearchTermForCompany("");

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

            "Add Project Master With Company"
        )

    };

    //#endregion

    //#region SERACH COMPANY  
    const searchCompany = async (searchValue: string) => {
        setSearchTermForCompany(searchValue);

        if (searchValue.trim() === '') {
            const emptyFilters: FilterInfo = {};
            setFilters(emptyFilters);
            await loadCompanys(1, emptyFilters);
            return;
        }

        const filterParams: FilterInfo = {
            CompanyName: searchValue.trim(),
        };

        setFilters(filterParams);
        await loadCompanys(1, filterParams);
    };

    //#endregion

    //#endregion

    //#region PROJECT MASTER WITH BANK DETAILS

    const handleEditProjectMasterBankDetails = useCallback((row: ProjectWithBankDetails) => {
        setEditingProjectMasterWithBankDetailsData({
            ...row,
            BeneficiaryAccountHolderName: row.BeneficiaryAccountHolderName || '',
            AcType: row.AcType || '',
            Branch: row.Branch || '',
            BankListMasterId: row.BankListMasterId || 0,
            AccountNumber: row.AccountNumber || '',
            IFSCCode: row.IFSCCode || ''
        })
        setIsAddUpdateModalOpenForBankDetails(true);

    }, [])

    const handleConfirmationDialogBoxOpenForProjectMasterBankDetails = useCallback((row: ProjectWithBankDetails) => {
        setDeleteProjectMasterWithBankDetailsData(row)
        setIsConfirmationDialogBoxOpenForBankDetails(true)
    }, [])

    //#region TABLE COLUMN

    const projectMasterBankDetailsColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'BeneficiaryAccountHolderName',
                label: 'Ac Holder',
                width: '33',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value, row) => (
                    <div className={`flex items-center justify-start`}>
                        <TooltipText
                            text={value || 'N/A'}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />
                        <div className="flex items-center justify-end ml-2 w-20">
                            {canAction ?
                                <>
                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleEditProjectMasterBankDetails(row)
                                        }}
                                        color='transparent'
                                        fullWidth
                                        isborderRadius
                                        size='sm'
                                        title="Edit Bank Account"
                                        style={{
                                            color: '#0B3251',
                                            padding: '0px 8px'
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#1A4D73')} // lighter on hover
                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#0B3251')} // revert
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>

                                    <Button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleConfirmationDialogBoxOpenForProjectMasterBankDetails(row)
                                        }}
                                        color='transparent'
                                        fullWidth
                                        isborderRadius
                                        size='sm'
                                        style={{
                                            color: 'red',
                                            padding: '0px 8px'
                                        }}
                                        title="Delete Bank Account"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </>
                                : ""}
                        </div>
                    </div>
                )
            },
            {
                key: 'AccountNumber',
                label: 'Ac Number',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'BankName',
                label: 'Bank Name',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'Branch',
                label: 'Branch',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'AcType',
                label: 'Ac Type',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },
            {
                key: 'IFSCCode',
                label: 'IFSC',
                width: '33',
                sortable: false,
                align: 'center',
                render: (value) => value || ''
            },

        ],
        [handleEditProjectMasterBankDetails, handleConfirmationDialogBoxOpenForProjectMasterBankDetails]
    )

    //#endregion

    //#region ADD UPDATE EDIT PROJECT MASTER WITH BANK DETAILS

    const handleFieldChange = (field: keyof AddUpdateProjectMasterWithBankDetailsRequest, value: any) => {

        setFormDataForBankDetails((prev) => ({ ...prev, [field]: value }));

        if (errorsForBankDetails[field]) {
            setErrorsForBankDetails((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleAddProjectMasterWithBankDetailsModal = () => {
        setEditingProjectMasterWithBankDetailsData(null);
        setFormDataForBankDetails(initialFormState());
        setErrorsForBankDetails({});
        setIsAddUpdateModalOpenForBankDetails(true);
    }

    // ============================================================= [VALIDATION FUNCTION] =============================================================================================
    const validateAddProjectMasterWithBankDetailsForm = (): {

        isValid: boolean

        errorsForBankDetails: { [key: string]: string }

    } => {

        const newErrors: { [key: string]: string } = {}

        if (formDataForBankDetails.BeneficiaryAccountHolderName.trim() === "") {

            newErrors.BeneficiaryAccountHolderName = "Beneficiary Account Holder Name is required"
        }

        if (formDataForBankDetails.AcType.trim() === "") {
            newErrors.AcType = "Account type is required";
        }


        if (!formDataForBankDetails.BankListMasterId) {
            newErrors.BankListMasterId = "Bank Name is required";
        }

        if (!formDataForBankDetails.Branch?.trim()) {
            newErrors.Branch = 'Bank Branch Name is required.'
        } else if (formDataForBankDetails.Branch.trim().length > 50) {
            newErrors.Branch = 'Bank Branch Name must be at most 50 characters'
        }

        if (!formDataForBankDetails.AccountNumber?.trim()) {
            newErrors.AccountNumber = 'Account Number is required.'
        } else if (formDataForBankDetails.AccountNumber.trim().length > 18) {
            newErrors.AccountNumber = 'Account Number must be at most 50 characters'
        }

        if (!formDataForBankDetails.IFSCCode?.trim()) {
            newErrors.IFSCCode = 'IFSC Code is required.'
        }
        else if (formDataForBankDetails.IFSCCode.trim().length > 12) {
            newErrors.IFSCCode = 'IFSC Code must be at most 50 characters'
        }
        else if (!isValidIFSC(formDataForBankDetails.IFSCCode.trim())) {
            newErrors.IFSCCode = 'Enter a valid IFSC Code'
        }

        return {
            isValid: Object.keys(newErrors).length === 0,
            errorsForBankDetails: newErrors
        }
    }

    const PushProjectMasterWithBankDetailsFormData = (): AddUpdateProjectMasterWithBankDetailsRequest => {
        return {
            ProjectWithBankDetailsId: formDataForBankDetails.ProjectWithBankDetailsId,
            Uniquekey: formDataForBankDetails.Uniquekey,
            ProjectId: editProjectData?.ProjectId ?? 0,
            BeneficiaryAccountHolderName: formDataForBankDetails.BeneficiaryAccountHolderName,
            BankListMasterId: formDataForBankDetails.BankListMasterId,
            AccountNumber: formDataForBankDetails.AccountNumber,
            Branch: formDataForBankDetails.Branch,
            IFSCCode: formDataForBankDetails.IFSCCode,
            AcType: formDataForBankDetails.AcType,
        };

    };

    const handleAddUpdateProjectMasterWithBankDetails = async (e: React.FormEvent) => {

        e.preventDefault();

        setErrorsForBankDetails({})

        const validation = validateAddProjectMasterWithBankDetailsForm()

        if (!validation.isValid) {

            setErrorsForBankDetails(validation.errorsForBankDetails)

            return
        }

        await runApiWithLoader(
            setIsLoading,

            setIsLoadingMessage,
            async () => {

                const payload = PushProjectMasterWithBankDetailsFormData();

                const response = await ProjectMasterService.apiCallAddUpdateProjectMasterWithBankDetails(payload);

                if (E.isRight(response)) {

                    setIsAddUpdateModalOpenForBankDetails(false);

                    const isAdd = formDataForBankDetails.ProjectWithBankDetailsId === 0;

                    if (isAdd) {

                        const newRecord = response.right.Data[0] as ProjectWithBankDetails

                        setProjectWithBankDetailsList(prevData => [newRecord, ...prevData]);

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    } else {

                        const updatedRecord = response.right.Data[0] as ProjectWithBankDetails;

                        setProjectWithBankDetailsList(prevData =>
                            prevData.map(item =>
                                item.ProjectWithBankDetailsId === formDataForBankDetails.ProjectWithBankDetailsId
                                    ? updatedRecord
                                    : item
                            )
                        )

                        addToast({ type: 'success', title: response.right.SuccessMessage[0] })
                    }

                    setEditingProjectMasterWithBankDetailsData(null);

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

            Number(formDataForBankDetails.ProjectWithBankDetailsId) === 0 ? 'Add Bank Details' : 'Update Bank Details'
        )

    };

    //#endregion

    //#region DELETE PROJECT MASTER WITH BANK DETAILS

    const handleDeleteProjectMasterWithBankDetails = async () => {

        setIsConfirmationDialogBoxOpenForBankDetails(false);

        if (!deleteProjectMasterWithBankDetailsData) return

        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,

            async () => {

                const params: DeleteProjectMasterWithBankDetailsRequest = {
                    ProjectWithBankDetailsId: deleteProjectMasterWithBankDetailsData.ProjectWithBankDetailsId,
                    Uniquekey: deleteProjectMasterWithBankDetailsData.Uniquekey,
                    ProjectId: deleteProjectMasterWithBankDetailsData.ProjectId
                }

                const response = await ProjectMasterService.apiCallDeleteProjectMasterWithBankDetails(params);

                if (E.isRight(response)) {

                    setProjectWithBankDetailsList(prevData => prevData.filter(item => item.ProjectWithBankDetailsId !== deleteProjectMasterWithBankDetailsData.ProjectWithBankDetailsId));


                    addToast({ type: 'success', title: response.right.SuccessMessage[0] })

                    setIsConfirmationDialogBoxOpenForBankDetails(false);

                    setDeleteProjectMasterWithBankDetailsData(null);

                } else {
                    addToast({ type: 'error', title: response.left.message });

                    setIsConfirmationDialogBoxOpenForBankDetails(false);
                }

                return response
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message })
            },
            undefined,
            'Delete department master data...'
        )
    }
    //#endregion

    //#endregion
    return (
       
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <Loader loading={isLoading} title={loadingMessage}>
                    <div></div>
                </Loader>


                <div className="space-y-6">
                    <div className="flex flex-wrap items-start gap-8">

                        {/* LEFT: IMAGE + BUTTONS */}
                        <div className="shrink-0">
                            <div className="px-4 pt-4">
                                <div className="w-full max-w-[300px] mx-auto bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
                                    <ImageCarousel
                                        images={editProjectData?.ProjectPhotoURL ?? ""}
                                        thumbHeight="h-50"
                                        containerStyle={{ width: 220, height: 140 }}
                                    />
                                </div>
                            </div>

                            {/* BUTTONS BELOW IMAGE */}
                            <div className="flex gap-2 mt-3 px-2">
                                <Button
                                    type="button"
                                    color="transparent"
                                    variant="transparent_border"
                                    size="sm"
                                    onClick={handleBackToListProjectMaster}
                                >
                                    Back
                                </Button>
                                {canAction ?
                                    <Button
                                        type="button"
                                        color="blue"
                                        size="sm"
                                        onClick={() => handleEditProjectMaster(editProjectData!)}
                                    >
                                        Edit
                                    </Button> : ""
                                }
                            </div>
                        </div>

                        {/* RIGHT: DETAILS */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">

                            <FieldItem
                                label="Project Name"
                                value={editProjectData?.ProjectName ?? "—"}
                                isRow={false}
                            />

                            <FieldItem
                                label="CTS Number"
                                value={editProjectData?.CTSNumber || "-"}
                                isRow={false}
                            />

                            <FieldItem
                                label="Business Category"
                                value={editProjectData?.BussinessCategory || "-"}
                                isRow={false}
                            />

                            <FieldItem
                                label="Project Area in Sq.ft"
                                value={editProjectData?.ProjectAreaInSqft?.toString() || "0.00"}
                                isRow={false}
                            />

                            <FieldItem
                                label="Project Location"
                                value={editProjectData?.ProjectLocation || "-"}
                                isRow={false}
                            />

                        </div>
                    </div>
                    {/* Quick meta */}


                    {/* Main grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        <div className="space-y-4">

                            {/* Location */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Location Details
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Country" value={editProjectData?.CountryName ?? '-'} isRow />
                                    <FieldItem label="State" value={editProjectData?.StateName ?? '-'} isRow />
                                    <FieldItem label="District" value={editProjectData?.DistrictName ?? '-'} isRow />
                                    <FieldItem label="City" value={editProjectData?.CityName ?? '-'} isRow />
                                    <FieldItem label="PIN Code" value={editProjectData?.ZipCode ?? '-'} isRow />
                                </div>
                            </div>

                            {/* Documentation */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project Documentation
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="RERA Number" value={editProjectData?.RERANumber ?? '-'} isRow />
                                    <FieldItem label="RERA Certificate Date" value={editProjectData?.RERACertificateDate ? formatDate_dd_MonthName_yy(editProjectData!.RERACertificateDate) : '-'} isRow />
                                    <FieldItem label="RERA Completion Date" value={editProjectData?.RERAComplitionDate ? formatDate_dd_MonthName_yy(editProjectData!.RERAComplitionDate) : '-'} isRow />
                                </div>
                            </div>


                        </div>

                        {/* Right: Meta & Partners */}
                        <div className="space-y-4">

                            {/* Financials */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project Financials
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Project Estimate Cost" value={editProjectData?.ProjectEstimateCost?.toString() ?? '-'} isRow />
                                    <FieldItem label="On Going Budget Cost" value={editProjectData?.OnGoingBudgetCost?.toString() ?? '-'} isRow />
                                    <FieldItem label="Project Area in Sqft" value={editProjectData?.ProjectAreaInSqft?.toString() ?? '-'} isRow />
                                </div>
                            </div>
                            {/* Timeline */}
                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Project TimeLine
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Survey Date" value={editProjectData?.SurveyDate ? formatDate_dd_MonthName_yy(editProjectData!.SurveyDate) : '-'} isRow />
                                    <FieldItem label="Expected Start Date" value={editProjectData?.ExpectedStartDate ? formatDate_dd_MonthName_yy(editProjectData!.ExpectedStartDate) : '-'} isRow />
                                    <FieldItem label="Execution Start Date" value={editProjectData?.ExecutionStartDate ? formatDate_dd_MonthName_yy(editProjectData!.ExecutionStartDate) : '-'} isRow />
                                </div>
                            </div>

                            {/* Contact */}

                            <div className="mt-6 rounded border border-gray-200">

                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                                    <h4 className="font-semibold text-sm text-gray-800">
                                        Contact Information
                                    </h4>
                                </div>


                                <div className="p-4">
                                    <FieldItem label="Site Contact Name" value={editProjectData?.SiteContactName ?? '-'} isRow />
                                    <FieldItem label="Site Contact Mobile Number" value={editProjectData?.SiteContactMobileNumber ?? '-'} isRow />
                                </div>
                            </div>

                        </div>
                    </div>


                    <div className="mt-6 rounded border border-gray-200">

                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                            <h4 className="font-semibold text-sm text-gray-800">
                                Setting
                            </h4>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <Tabs
                                tabs={TabList}
                                defaultActive={activeTab}
                                islarge={true}
                                onTabChange={(t) => {
                                    setActiveTab(t.id);

                                }}
                            />

                            {canAction && activeTab !== 'Set Approval' && (
                                <Button
                                    color='blue'
                                    size='sm'
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (activeTab === "Employee") {

                                            handleAddUpdateProjectMasterWithEmployeeModal()
                                        }
                                        else if (activeTab === "Bank Details") {

                                            handleAddProjectMasterWithBankDetailsModal()
                                        }
                                        else if (activeTab === "Company") {

                                            handleAddUpdateProjectMasterWithCompanyModal()
                                        }
                                    }}
                                >
                                    Add
                                </Button>
                            )}
                        </div>
                        <div className="mt-1">
                            {activeTab === 'Employee' && (
                                <div className="space-y-4 p-4">

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
                            )}

                            {activeTab === "Bank Details" && (

                                <div className="space-y-3 p-4">
                                    <DataTable
                                        data={projectWithBankDetailsList}
                                        columns={projectMasterBankDetailsColumns}
                                        emptyMessage="No Bank Data Found"
                                        fixedHeight={true}
                                        maxHeight="calc(100vh - 255px)"
                                        recordsPerPage={20}
                                        className="flex-1"
                                        loading={isLoading}
                                    />

                                </div>
                            )}

                            {activeTab === "Company" && (
                                <div className="space-y-4 p-4">


                                    <DataTable
                                        data={compantMasterList}
                                        columns={projectMasterWithCompanyColumns}
                                        emptyMessage="No Company Data Found"
                                        fixedHeight={true}
                                        maxHeight="calc(100vh - 255px)"
                                        recordsPerPage={20}
                                        className="flex-1"
                                        loading={isLoading}
                                    />
                                </div>
                            )}

                        </div>

                    </div>
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

                {/* IN PROJECT MASTER WTTH COMPANY MODAL */}
                <Modal
                    isOpen={isOpenAddProjectMasterWithCompany}
                    onClose={() => setIsOpenAddProjectMasterWithCompany(false)}
                    title="Add Company"
                    onSubmit={handleAddUpdateProjectMasterWithCompany}
                    saveText="Save"
                    resetText=""
                    size="large-half"
                >
                    <div className="space-y-4">

                        <div className="px-2 py-2 border-b">
                            <div className="flex items-center gap-3 w-full">

                                {/* Select ALL */}
                                <Checkbox

                                    id="select-all-company"
                                    checked={isAllCompanyVisibleSelected}
                                    onChange={() => toggleCompanySelectAllVisible()}
                                />
                                <div className="relative min-w-0 w-[526px]">
                                    <Input
                                        type="text"
                                        value={searchTermForCompany}
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setSearchTermForCompany(v);
                                            debouncedCompanySearch(v);
                                        }}
                                        placeholder="Search By Company"
                                        leftIcon={<Search className="h-4 w-4 text-gray-400" />}

                                    />
                                </div>


                                <span className="text-sm text-gray-600 whitespace-nowrap right">
                                    {selectedCompanyIds.length} selected
                                </span>

                            </div>
                        </div>


                        <div className="space-y-4">
                            <div
                                className="flex-1 min-h-0 overflow-auto thin-scroll divide-y divide-gray-200"
                                onScroll={handleCompanyListScrollInProjectMasterWithCompany}
                                style={{ maxHeight: '55vh' }}>
                                {companyMasterForProject.length > 0 ? (

                                    companyMasterForProject.map((n, i) => {

                                        const id = n.CompanyId ?? i;
                                        const checked = selectedCompanyIds.includes(id);

                                        return (
                                            <div key={id}
                                                className="flex items-start gap-3 py-3 hover:bg-gray-50 transition-colors duration-150 cursor-pointer px-2"
                                                onClick={(ev) => {
                                                    if ((ev.target as HTMLElement).tagName.toLowerCase() === 'input') return;
                                                    toggleCompanySelection(id);
                                                }}>
                                                <div className="flex items-center">

                                                    <Checkbox
                                                        checked={checked}
                                                        onChange={() => toggleCompanySelection(id)}
                                                        onClick={(ev) => ev.stopPropagation()}
                                                        aria-label={`Select ${n.CompanyName}`}
                                                    />

                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-3 mt-1">
                                                        <p className="text-sm text-gray-800 whitespace-normal break-words">
                                                            {n.CompanyName}
                                                        </p>

                                                        <div className="text-xs text-gray-500">
                                                            {n.ContactPerson}
                                                        </div>
                                                    </div>


                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <NoDataView />
                                )}

                                {isFetchingMoreCompany && (

                                    <div className="py-3 text-center text-gray-400 text-sm">Loading more...</div>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal>

                {/* DELETE CONFIRMATION PROJECT MASTER WTTH EMPLOYEE MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpenForEmployee}
                    onClose={() => {
                        setIsConfirmationDialogBoxOpenForEmployee(false)
                        setDeleteProjectMasterWithEmployeeData(null)
                    }}
                    onConfirm={handleDeleteProjectMasterWithEmployee}
                    title="You are about to delete a employee?"
                    message="Deleting this employee will permanently remove its contents."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />

                {/*  ADD EDIT UPDATE PROJECT MASTER WITH BANK DETAILS MODAL */}
                <Modal
                    isOpen={isAddUpdateModalOpenForBankDetails}
                    onClose={() => {
                        setIsAddUpdateModalOpenForBankDetails(false);
                        setEditingProjectMasterWithBankDetailsData(null);
                        setFormDataForBankDetails(initialFormState());
                        setErrorsForBankDetails({});
                    }}
                    onCancel={() => {
                        setIsAddUpdateModalOpenForBankDetails(false);
                        setEditingProjectMasterWithBankDetailsData(null);
                        setFormDataForBankDetails(initialFormState());
                        setErrorsForBankDetails({});
                    }}
                    title={editingProjectMasterWithBankDetailsData ? 'Update Bank Details' : 'Add Bank Details'}
                    onSubmit={handleAddUpdateProjectMasterWithBankDetails}
                    saveText={editingProjectMasterWithBankDetailsData ? 'Update Bank Details' : 'Save Bank Details'}
                    resetText='Reset'
                    loading={isLoading}
                    size='half-screen'
                >
                    <div className="space-y-10 p-6 bg-blue-100">
                        <div className="space-y-4" >
                            <div>
                                <Input
                                    label='Beneficiary Account Holder Name'
                                    required
                                    error={errorsForBankDetails.BeneficiaryAccountHolderName}
                                    type="text"
                                    value={formDataForBankDetails.BeneficiaryAccountHolderName}
                                    maxLength={250}
                                    onChange={(e) => handleFieldChange('BeneficiaryAccountHolderName', e.target.value)}
                                    placeholder="Enter Account Holder Name"
                                />

                            </div>
                            <div>
                                <SingleSelectDropdownWithPagination
                                    label="Bank"
                                    required
                                    title="Select Bank"
                                    size="lg"
                                    dataFetchCallBack={fetchBankListMasterDropdown}
                                    onSelected={(item) => { handleFieldChange("BankListMasterId", Number(item?.value || 0)); }}
                                    initialValue={createDropdownInitialValue(formDataForBankDetails.BankListMasterId, dropdownLabels.bankName)}
                                    error={errorsForBankDetails.BankListMasterId}
                                />
                            </div>
                        </div>
                        <div className=" grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">

                            <div>
                                <SinglePageSelection
                                    label="Account Type"
                                    required
                                    value={formDataForBankDetails.AcType}
                                    onChange={(e) => handleFieldChange('AcType', String(e))}
                                    options={BANK_ACCOUNT_TYPE.map((opt) => ({ label: opt.name, value: opt.id }))}
                                    error={errorsForBankDetails.AcType}
                                />

                            </div>

                            <div>
                                <Input
                                    label='Branch Name'
                                    required
                                    error={errorsForBankDetails.Branch}
                                    type="text"
                                    value={formDataForBankDetails.Branch}
                                    maxLength={100}
                                    onChange={(e) => handleFieldChange('Branch', e.target.value)}
                                    placeholder="Enter Branch"
                                />

                            </div>
                            <div>
                                <Input
                                    label="Account Number"
                                    required value={formDataForBankDetails.AccountNumber}
                                    maxLength={18}
                                    onChange={(e) => handleFieldChange("AccountNumber", filterNumbers(e.target.value))}
                                    error={errorsForBankDetails.AccountNumber} />
                            </div>
                            <div>
                                <Input label="IFSC Code"
                                    required
                                    value={formDataForBankDetails.IFSCCode}
                                    maxLength={10}
                                    onChange={(e) => handleFieldChange("IFSCCode", filterIFSC(e.target.value))}
                                    error={errorsForBankDetails.IFSCCode} />
                            </div>
                        </div>
                    </div>

                </Modal>
                {/* DELETE CONFIRMATION  PROJECT MASTER WTTH BANK DETAILS MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpenForBankDetails}
                    onClose={() => {
                        setIsConfirmationDialogBoxOpenForBankDetails(false)
                        setDeleteProjectMasterWithBankDetailsData(null)
                    }}
                    onConfirm={handleDeleteProjectMasterWithBankDetails}
                    title="You are about to delete a bank details?"
                    message="Deleting this bank details will permanently remove its contents."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />
            </div>
    );
};

export default ViewProjectMaster;
