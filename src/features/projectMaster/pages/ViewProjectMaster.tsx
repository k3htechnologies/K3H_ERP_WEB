import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useNavigate } from 'react-router-dom';
import { useProjectMasterListState } from '@/features/projectMaster/context/ProjectMasterListStateContext';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import { Tabs, type TabItem } from '@/ui/components/Tab/Tab';
import type { FilterWithPaginationProjectMasterRequest, ProjectMasterData, ProjectWithBankDetails } from '@/features/projectMaster/models/ProjectMasterModel';
import ImageCarousel from '@/ui/components/ImageViewer/ImageCarousel';
import { runApiWithLoader } from '@/core/utils';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel';
import useToast from '@/core/hooks/useToast';
import type { CompanyMasterData } from '@/features/companyMaster/models/CompanyMasterModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { modulesWorkflowApprovalService } from '@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService';
import type { FilterModulesWorkflowApprovalRequest, ModulesWorkflowApprovalData } from '@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel';
import { Mail, Phone } from 'lucide-react';


export const ViewProjectMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    // SINGLE SEARCH TEXT BOX
    const [searchTermForEmployee, setSearchTermForEmployeeName] = useState('')
    const debouncedSearchForEmployeeName = useDebouncedCallback((value: string) => {
        searchEmployeeName(value)
    }, 350)


    const [compantMasterList, setCompanyMasterList] = useState<CompanyMasterData[]>([]);

    const [projectWithBankDetailsList, setProjectWithBankDetailsList] = useState<ProjectWithBankDetails[]>([]);

    const [modulesWorkflowApprovalList, setModulesWorkflowApprovalList] = useState<ModulesWorkflowApprovalData[]>([]);

    const [activeModuleTab, setActiveModuleTab] = useState<string>("");

    const [activeTabForModulesWorkflowApproval, setActiveTabForModulesWorkflowApproval] = useState<TabItem[]>([]);

    // TOAST
    const { addToast } = useToast()

    //LOCATION
    const navigate = useNavigate();
    const { listState } = useProjectMasterListState();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/projectMaster');
    //#endregion

    //#region Get PROJECT MASTER DATA - Will be loaded from API if needed
    const [editProjectData, setEditProjectData] = useState<ProjectMasterData | null>(null);
    //#endregion

    //#region TAB ACTIVITY
    const TabList = [
        { id: "Project Overview", label: 'Project Overview' },
        { id: "Employee", label: 'Employee' },
        { id: "Bank Details", label: 'Bank Details' },
        { id: "Company", label: 'Company' },
        { id: "Approval", label: 'Approval' }
    ];


    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (listState.projectId) {
            loadProjectData();
        }
    }, [listState.projectId]);

    useEffect(() => {
        if (!editProjectData) return;

        if (activeTab === 'Project Overview') {

        }
        else if (activeTab === 'Employee') {
            loadProjectMasterWithEmployee(editProjectData.ProjectId, '');
        }
        else if (activeTab === 'Bank Details') {
            loadProjectMasterWithBankDetails(editProjectData.ProjectId);
        }
        else if (activeTab === 'Company') {
            loadProjectMasterWithCompany(editProjectData.ProjectId);
        }
        else if (activeTab === 'Approval') {
            loadModulesWorkflowApproval(editProjectData.ProjectId);
        }
    }, [activeTab, editProjectData]);

    const loadProjectData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationProjectMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ProjectId: listState.projectId,
                    IsProjectAccess: false
                };
                const response = await projectMasterService.apiCallPullProjectMaster(params);
                if (E.isRight(response)) {
                    setEditProjectData(response.right.Data[0]);
                } else {
                    addToast({ type: 'error', title: response.left?.message || 'Failed to load project data' });
                }
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Project Data'
        );
    };

    //#endregion

    //#region DATA LOAD PROJECT WITH EMPLOYEE | COMPANY | BANK DETAILS

    const loadProjectMasterWithEmployee = async (ProjectId: number, searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithEmployee(ProjectId, searchText);

                if (E.isRight(response)) {

                    setEmployeeMasterList(response.right.Data);


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

    //#region SERACH EMPLOYEE NAME 
    const searchEmployeeName = async (searchValue: string) => {

        setSearchTermForEmployeeName(searchValue);
        await loadProjectMasterWithEmployee(editProjectData!.ProjectId, searchValue);

    }
    //#endregion

    //#region CLEAR SERACH DEPARTMENT 
    const clearsearchForEmployeeName = async () => {
        setSearchTermForEmployeeName('');
        debouncedSearchForEmployeeName.cancel?.();
        await loadProjectMasterWithEmployee(editProjectData!.ProjectId);
    }

    //#endregion

    const loadProjectMasterWithCompany = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithCompany(ProjectId);

                if (E.isRight(response)) {

                    setCompanyMasterList(response.right.Data);

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

    const loadProjectMasterWithBankDetails = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const response = await projectMasterService.apiCallPullProjectMasterWithBankDetails(ProjectId);

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

    const loadModulesWorkflowApproval = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterModulesWorkflowApprovalRequest = {
                    ProjectId: ProjectId,
                };

                const response = await modulesWorkflowApprovalService.apiCallPullModulesWorkflowApproval(params);

                if (E.isRight(response)) {

                    const items = Array.isArray(response?.right.Data) ? response.right.Data : [];

                    setModulesWorkflowApprovalList(items);

                    const tabs: TabItem[] = Array.from(
                        new Map(
                            items
                                .filter(x => x.ModulesMasterId && x.ModuleName)
                                .map(x => [x.ModulesMasterId, x])
                        ).values()
                    ).map(x => ({
                        id: String(x.ModulesMasterId),
                        label: x.ModuleName!,
                    }));

                    setActiveTabForModulesWorkflowApproval(tabs);

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

    //#region BACK VIEW PROJECT PAGE TO TABLE PROJECT MASTER
    const handleBackToListProjectMaster = () => {
        navigate('/projectMaster');
    };
    //#endregion

    //#region EDIT PROJECT
    const handleEditProjectMaster = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate(`/projectMaster/add/${row.ProjectId}`);
    };
    //#endregion

    //#region EDIT PROJECT WITH EMPLOYEE
    const handleEditProjectMasterWithEmployee = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/employee');
    };
    //#endregion

    //#region EDIT PROJECT WITH COMPANY
    const handleEditProjectMasterWithCompany = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/company');
    };
    //#endregion

    //#endregion
    //#region EDIT PROJECT WITH BANK
    const handleEditProjectMasterWithBank = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/bank');
    };
    //#endregion

    //#region EDIT PROJECT WITH EMPLOYEE
    const handleEditApproval = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/approval');
    };
    //#endregion

    //#endregion

    useEffect(() => {
        if (activeTabForModulesWorkflowApproval.length > 0 && !activeModuleTab) {
            setActiveModuleTab(activeTabForModulesWorkflowApproval[0].id);
        }
    }, [activeTabForModulesWorkflowApproval]);

    const filteredApprovalList = modulesWorkflowApprovalList.filter(
        x => String(x.ModulesMasterId) === activeModuleTab
    );

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={'Project Details : '}
                subTitleText={editProjectData?.ProjectName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListProjectMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (activeTab === "Project Overview") {

                        if (editProjectData) handleEditProjectMaster(editProjectData);
                    }

                    else if (activeTab === 'Employee') {

                        if (editProjectData) handleEditProjectMasterWithEmployee(editProjectData);
                    }
                    else if (activeTab === 'Bank Details') {

                        if (editProjectData) handleEditProjectMasterWithBank(editProjectData);

                    }
                    else if (activeTab === 'Company') {

                        if (editProjectData) handleEditProjectMasterWithCompany(editProjectData);
                    }
                    else if (activeTab === 'Approval') {

                        if (editProjectData) handleEditApproval(editProjectData);
                    }
                }}
                isLoading={isLoading}
            />

            <div className='pt-3'>

                <Tabs
                    tabs={TabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {
                        setActiveTab(t.id);

                    }}
                />
                {activeTab === 'Project Overview' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                            {/* ================= LEFT (2/3 WIDTH) ================= */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* ================= BASIC PROJECT DETAILS ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Basic Project Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
                                        <FieldItem label="Redevelopment" value={editProjectData?.IsRedevelopment === true ? 'YES' : 'NO'} />
                                        <FieldItem label="Project Name" value={editProjectData?.ProjectName ?? '-'} />

                                        <FieldItem label="Business Category" value={editProjectData?.BussinessCategory ?? '-'} />
                                        <FieldItem label="File Number" value={editProjectData?.FileNumber ?? '-'} />
                                        <FieldItem label="Architect Name" value={editProjectData?.ArchitectName ?? '-'} />
                                        <FieldItem label="Architect Mobile Number" value={editProjectData?.ArchitectMobileNumber
                                                                                    ? `+91 ${editProjectData?.ArchitectMobileNumber}`
                                                                                    : '-'}
                                                                                />

                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-5">

                                        <FieldItem label="CTS Number" value={editProjectData?.CTSNumber ?? '-'} />
                                    </div>

                                </section>

                                {/* ================= LOCATION DETAILS ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Location Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">

                                        <FieldItem label="Project Location" value={editProjectData?.ProjectLocation ?? '-'} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pt-4 ">
                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Google Location
                                        </div>
                                        {editProjectData?.GoogleLocation !== "" ?
                                            <span className="text-blue-600 underline cursor-pointer break-all whitespace-normal"
                                                onClick={() => window.open(editProjectData?.GoogleLocation, "_blank")}>
                                                {editProjectData?.GoogleLocation}
                                            </span> : "-"}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                        <FieldItem label="Country" value={editProjectData?.CountryName ?? '-'} />
                                        <FieldItem label="State" value={editProjectData?.StateName ?? '-'} />
                                        <FieldItem label="District" value={editProjectData?.DistrictName ?? '-'} />
                                        <FieldItem label="City" value={editProjectData?.CityName ?? '-'} />
                                        <FieldItem label="Village" value={editProjectData?.VillageName ?? '-'} />
                                        <FieldItem label="PIN Code" value={editProjectData?.ZipCode ?? '-'} />
                                    </div>
                                </section>

                                {/* ================= PROJECT SCHEME & SCOPE ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Scheme & Scope Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Project Scope" value={editProjectData?.ProjectScope ?? '-'} />
                                        <FieldItem label="Project Scheme" value={editProjectData?.ProjectScheme ?? '-'} />
                                        <FieldItem label="Project Sub Scheme" value={editProjectData?.ProjectSubScheme ?? '-'} />

                                    </div>
                                </section>

                                {/* ================= PROJECT DOCUMENTATION ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Project Documentation
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="RERA Number" value={editProjectData?.RERANumber ?? '-'} />

                                        <FieldItem
                                            label="RERA Certificate Date"
                                            value={
                                                editProjectData?.RERACertificateDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.RERACertificateDate)
                                                    : '-'
                                            }
                                        />

                                        <FieldItem
                                            label="RERA Completion Date"
                                            value={
                                                editProjectData?.RERAComplitionDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.RERAComplitionDate)
                                                    : '-'
                                            }
                                        />
                                    </div>
                                </section>

                                {/* ================= FINANCIAL DETAILS ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Project Financials
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Project Estimate Cost"
                                            value={editProjectData?.ProjectEstimateCost?.toString() ?? '-'}
                                        />
                                        <FieldItem
                                            label="Ongoing Budget Cost"
                                            value={editProjectData?.OnGoingBudgetCost?.toString() ?? '-'}
                                        />
                                        <FieldItem
                                            label="Project Area (Sq.ft)"
                                            value={editProjectData?.ProjectAreaInSqft?.toString() ?? '-'}
                                        />
                                    </div>
                                </section>

                                {/* ================= PROJECT TIMELINE ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Project Timeline
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Survey Date"
                                            value={
                                                editProjectData?.SurveyDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.SurveyDate)
                                                    : '-'
                                            }
                                        />
                                        <FieldItem
                                            label="Expected Start Date"
                                            value={
                                                editProjectData?.ExpectedStartDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.ExpectedStartDate)
                                                    : '-'
                                            }
                                        />
                                        <FieldItem
                                            label="Execution Start Date"
                                            value={
                                                editProjectData?.ExecutionStartDate
                                                    ? formatDate_dd_MonthName_yy(editProjectData.ExecutionStartDate)
                                                    : '-'
                                            }
                                        />
                                    </div>
                                </section>

                                {/* ================= CONTACT INFORMATION ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Contact Information
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Site Contact Name"
                                            value={editProjectData?.SiteContactName ?? '-'}
                                        />
                                        <FieldItem
                                            label="Site Contact Mobile Number"
                                            value={editProjectData?.SiteContactMobileNumber ?? '-'}
                                        />
                                        <FieldItem
                                            label="Project Status"
                                            value={editProjectData?.ProjectStatus ?? '-'}
                                        />
                                    </div>
                                </section>

                            </div>

                            {/* ================= RIGHT SIDE (1/3 WIDTH) ================= */}
                            <div className="lg:col-span-1 space-y-6">

                                {/* ================= PROJECT IMAGE ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 border-b border-[#135bec2e] pb-2 mb-4">
                                        Project Images
                                    </h4>

                                    <div className="flex justify-center">
                                        <div className="w-full max-w-[300px] rounded-md overflow-hidden">
                                            <ImageCarousel
                                                images={editProjectData?.ProjectPhotoURL ?? ""}
                                                thumbHeight="h-50"
                                                containerStyle={{ width: 220, height: 140 }}
                                            />
                                        </div>
                                    </div>
                                </section>
                                {/* ================= QUICK ACTIONS ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Action Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Created By" value={editProjectData?.CreatedBy ?? '-'} />
                                        <FieldItem
                                            label="Created Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(editProjectData?.CreatedDate ?? '-')}
                                        />
                                        <FieldItem label="Modified By" value={editProjectData?.ModifiedBy ?? '-'} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(editProjectData?.ModifiedDate ?? '-')}
                                        />
                                    </div>
                                </section>

                            </div>

                        </div>

                    </>
                )}

                {activeTab === 'Employee' && (
                    <div className="space-y-4 pt-5">

                        <TableActionToolbar
                            isShowSearchBar
                            searchTerm={searchTermForEmployee}
                            searchPlaceholder="Search By Employee Name or Department"
                            onSearchChange={(v) => {
                                setSearchTermForEmployeeName(v)
                                debouncedSearchForEmployeeName(v)
                            }}
                            onClearSearch={clearsearchForEmployeeName}
                            isShowFilterButton={false}
                            exportLoading={isLoading}
                        />

                        {employeeMasterList?.length ? (
                            employeeMasterList.map(emp => {
                                const fullName = (emp?.FullName ?? '').trim();
                                const initials = fullName
                                    ? fullName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
                                    : 'NA';

                                return (
                                    <section
                                        key={emp.EmployeeCode}
                                        className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f] mb-4"
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-full bg-blue-200 text-gray-800 flex items-center justify-center text-xs font-medium border border-gray-300">
                                                {initials}
                                            </div>

                                            <h4 className="text-lg font-semibold text-gray-900">
                                                {emp.FullName || '-'}
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Employee Code" value={emp.EmployeeCode ?? '-'} />
                                            <FieldItem label="Mobile" value={emp.PersonalMobileNumber ? `+91 ${emp.PersonalMobileNumber}` : '-'} />
                                            <FieldItem label="Email" value={emp.EmailId ?? '-'} />
                                            <FieldItem label="Department" value={emp.Department ?? '-'} />
                                            <FieldItem label="Designation" value={emp.Designation ?? '-'} />
                                            <FieldItem label="Report Person" value={emp.ReportPersonName ?? '-'} />
                                            <FieldItem label="Last Login" value={emp.LastLogin ? formatDate_dd_MonthName_yy_hh_mm(emp.LastLogin) : '-'} />
                                        </div>
                                    </section>
                                );
                            })
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Employee's Found" />
                            </section>
                        )}

                    </div>
                )}

                {activeTab === "Bank Details" && (

                    <div className="space-y-3 pt-5">
                        {projectWithBankDetailsList?.length ? (
                            projectWithBankDetailsList.map((b, i) => (
                                <section
                                    key={i}
                                    className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]"
                                >
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {b.BeneficiaryAccountHolderName ?? "Account Details"}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Account Number" value={b.AccountNumber ?? "-"} />
                                        <FieldItem label="Bank Name" value={b.BankName ?? "-"} />
                                        <FieldItem label="Branch" value={b.Branch ?? "-"} />
                                        <FieldItem label="Account Type" value={b.AcType ?? "-"} />
                                        <FieldItem label="IFSC Code" value={b.IFSCCode ?? "-"} />
                                    </div>
                                </section>
                            ))
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Bank's Found" />
                            </section>
                        )}


                    </div>
                )}

                {activeTab === "Company" && (
                    <div className="space-y-4 pt-5">


                        {compantMasterList?.length ? (
                            compantMasterList.map((c, i) => (
                                <section
                                    key={i}
                                    className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f] mb-4"
                                >
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {c.CompanyName ?? "-"}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Firms Type" value={c.FirmsType ?? "-"} />
                                        <FieldItem label="Contact Person" value={c.ContactPerson ?? "-"} />
                                        <FieldItem label="Mobile Number" value={c.MobileNumber ?? "-"} />
                                        <FieldItem label="E-mail Id" value={c.EmailId ?? "-"} />
                                        <FieldItem label="PAN Number" value={c?.PANNumber ?? '-'} urls={c?.PanCardURL} isIcon />
                                        <FieldItem label="GST Number" value={c?.GSTNumber ?? '-'} urls={c?.GSTCertificateURL} isIcon />
                                        <FieldItem label="CIN Number" value={c?.CINNumber ?? '-'} urls={c?.CINURL} isIcon />
                                        <FieldItem label="TAN Number" value={c?.TANNumber ?? '-'} urls={c?.TANURL} isIcon />
                                        <FieldItem label="City" value={c.CityName ?? "-"} />
                                    </div>
                                </section>
                            ))
                        ) : (
                            <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Company's Found" />
                            </section>
                        )}

                    </div>
                )}

                {activeTab === "Approval" && (
                    <div className="space-y-4 pt-5">

                        <Tabs
                            tabs={activeTabForModulesWorkflowApproval}
                            defaultActive={activeModuleTab}
                            isChips={true}
                            onTabChange={(tab: TabItem) => {
                                setActiveModuleTab(tab.id);
                            }}
                        />

                        {filteredApprovalList?.length ? (

                            filteredApprovalList.map((item, i) => (

                                <section  key={i} className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f] pt-2"  >

                                    {/* Module Name */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
                                        <FieldItem  label="" value={item.SubSubModuleName ?? "-"}    className="text-[18px] font-semibold"/>
                                    </div>

                                    {/* Employee List */}
                                    {item.EmployeeData && item.EmployeeData.length > 0 ? (

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

                                            {item.EmployeeData.map((member, index) => (

                                                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:shadow transition" >

                                                    <div className="flex items-start justify-between gap-2">
                                                        <h5 className="text-sm font-semibold text-gray-900 truncate">
                                                            {member.FullName || '-'}
                                                        </h5>

                                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                                            {member.Designation || '—'}
                                                        </span>
                                                    </div>

                                                    <div className="mt-2 space-y-1">

                                                        <p className="text-xs text-gray-600 flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                                                            <span>
                                                                {member.PersonalMobileNumber
                                                                    ? `+91 ${member.PersonalMobileNumber}`
                                                                    : '-'}
                                                            </span>
                                                        </p>

                                                        <p className="text-xs text-gray-600 flex items-center gap-2 break-all">
                                                            <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                                                            <span>{member.EmailId || '-'}</span>
                                                        </p>

                                                    </div>

                                                </div>

                                            ))}

                                        </div>

                                    ) : (

                                        <div className="text-xs text-gray-500">
                                            No Employee Assigned
                                        </div>

                                    )}

                                </section>

                            ))

                        ) : (

                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <NoDataView message="No Approval Found" />
                            </section>

                        )}

                    </div>
                )}
            </div>
        </div>

    );
};

export default ViewProjectMaster;
