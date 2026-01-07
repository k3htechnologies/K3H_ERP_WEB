import React, { useEffect,  useState } from 'react';
import { Loader } from '@/core/utils/loader';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy } from '@/core/utils/dateFormat';
import { Tabs } from '@/ui/components/Tab/Tab';
import type { ProjectMasterData, ProjectWithBankDetails } from '@/features/projectMaster/models/ProjectMasterModel';
import ImageCarousel from '@/ui/components/ImageViewer/ImageCarousel';
import { runApiWithLoader } from '@/core/utils';
import { ProjectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import * as E from 'fp-ts/Either';
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel';
import useToast from '@/core/hooks/useToast';
import type { CompanyMasterData } from '@/features/companyMaster/models/CompanyMasterModel';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';


export const ViewProjectMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    // SINGLE SEARCH TEXT BOX
    const [searchTermForEmployee, setSearchTermForEmployeeName] = useState('')
    const debouncedSearchForEmployeeName = useDebouncedCallback((value: string) => {
        searchEmployeeName(value)
    }, 350)


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

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/projectMaster');
    //#endregion


    //#region Get PROJECT MASTER DATA FROM LOCATION STATE
    const editProjectData = (location.state?.editProjectMasterData ?? null) as ProjectMasterData | null;
    //#endregion

    //#region TAB ACTIVITY
    const TabList = [
        { id: "Project Overview", label: 'Project Overview' },
        { id: "Employee", label: 'Employee' },
        { id: "Bank Details", label: 'Bank Details' },
        { id: "Company", label: 'Company' }
    ];


    const [activeTab, setActiveTab] = useState<string>(TabList[0].id);
    //#endregion

    //#region INIT
    useEffect(() => {
        if (activeTab === 'Project Overview') {

        }

        else if (activeTab === 'Employee') {

            loadProjectMasterWithEmployee(editProjectData!.ProjectId,'');
        }
        else if (activeTab === 'Bank Details') {

            loadProjectMasterWithBankDetails(editProjectData!.ProjectId);

        }
        else if (activeTab === 'Company') {

            loadProjectMasterWithCompany(editProjectData!.ProjectId);

        }

    }, [activeTab]);

    //#endregion

    //#region DATA LOAD PROJECT WITH EMPLOYEE | COMPANY | BANK DETAILS

    const loadProjectMasterWithEmployee = async (ProjectId: number, searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithEmployee(ProjectId,searchText);

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
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithCompany(ProjectId);

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

    //#region BACK VIEW PROJECT PAGE TO TABLE PROJECT MASTER
    const handleBackToListProjectMaster = () => {
        navigate('/projectMaster', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTermForEmployee: '' } }
        });
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

    //#region EDIT PROJECT WITH EMPLOYEE
    const handleEditProjectMasterWithEmployee = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;
        navigate('/projectMaster/employee', {
            state: {
                projectId: row.ProjectId,
                listState: {
                    page: preservedListState?.page,
                    filters: preservedListState?.filters,
                    sortInfo: preservedListState?.sortInfo,
                    projectId: row.ProjectId,
                    uniquekey: row.Uniquekey,
                    projectName:row.ProjectName
                }
            }

        });
    };
    //#endregion

    //#region EDIT PROJECT WITH COMPANY
    const handleEditProjectMasterWithCompany = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;

        navigate('/projectMaster/company', {
            state: {
                projectId: row.ProjectId,
                listState: {
                    page: preservedListState?.page,
                    filters: preservedListState?.filters,
                    sortInfo: preservedListState?.sortInfo,
                    projectId: row.ProjectId,
                    uniquekey: row.Uniquekey,
                    projectName:row.ProjectName
                }
            }
        });
    };
    //#endregion

    //#endregion
    //#region EDIT PROJECT WITH BANK
    const handleEditProjectMasterWithBank = (row: ProjectMasterData) => {
        if (!row?.ProjectId) return;

        navigate('/projectMaster/bank', {
            state: {
                projectId: row.ProjectId,
                listState: {
                    page: preservedListState?.page,
                    filters: preservedListState?.filters,
                    sortInfo: preservedListState?.sortInfo,
                    projectId: row.ProjectId,
                    uniquekey: row.Uniquekey,
                    projectName:row.ProjectName
                }
            }
        });
    };
    //#endregion

    //#endregion


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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                            {/* ================= LEFT (2/3 WIDTH) ================= */}
                            <div className="lg:col-span-2 space-y-6">

                                {/* ================= BASIC PROJECT DETAILS ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Basic Project Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">

                                        <FieldItem label="Project Name" value={editProjectData?.ProjectName ?? '-'} />
                                        <FieldItem label="CTS Number" value={editProjectData?.CTSNumber ?? '-'} />
                                        <FieldItem label="Business Category" value={editProjectData?.BussinessCategory ?? '-'} />

                                        <FieldItem
                                            label="Project Area (Sq.ft)"
                                            value={editProjectData?.ProjectAreaInSqft?.toString() ?? '0.00'}
                                        />
                                        <FieldItem label="Project Location" value={editProjectData?.ProjectLocation ?? '-'} />

                                    </div>
                                </section>

                                {/* ================= LOCATION DETAILS ================= */}
                                <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        Location Details
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Country" value={editProjectData?.CountryName ?? '-'} />
                                        <FieldItem label="State" value={editProjectData?.StateName ?? '-'} />
                                        <FieldItem label="District" value={editProjectData?.DistrictName ?? '-'} />
                                        <FieldItem label="City" value={editProjectData?.CityName ?? '-'} />
                                        <FieldItem label="PIN Code" value={editProjectData?.ZipCode ?? '-'} />
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

                            </div>

                        </div>

                    </>
                )}

                {activeTab === 'Employee' && (
                    <div className="space-y-4 p-4">

                        <TableActionToolbar
                            isShowSearchBar
                            searchTerm={searchTermForEmployee}
                            searchPlaceholder="Search By Employee Name"
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
                                                {emp.FullName || 'N/A'}
                                            </h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Employee Code" value={emp.EmployeeCode ?? '-'} />
                                            <FieldItem label="Mobile" value={emp.PersonalMobileNumber ? `+91 ${emp.PersonalMobileNumber}` : '-'} />
                                            <FieldItem label="Email" value={emp.EmailId ?? '-'} />
                                            <FieldItem label="Department" value={emp.Department ?? '-'} />
                                            <FieldItem label="Designation" value={emp.Designation ?? '-'} />
                                            <FieldItem label="Report Person" value={emp.ReportPersonName ?? '-'} />
                                            <FieldItem
                                                label="Joining Date"
                                                value={emp.JoiningDate ? formatDate_dd_MonthName_yy(emp.JoiningDate) : '-'}
                                            />
                                            <FieldItem
                                                label="Last Login"
                                                value={emp.LastLogin ? formatDate_dd_MonthName_yy(emp.LastLogin) : '-'}
                                            />
                                        </div>
                                    </section>
                                );
                            })
                        ) : (
                            <p className="text-center text-gray-500 py-6">
                                <NoDataView />
                            </p>
                        )}

                    </div>
                )}

                {activeTab === "Bank Details" && (

                    <div className="space-y-3 p-4">
                        {projectWithBankDetailsList?.length ? (
                            projectWithBankDetailsList.map((b, i) => (
                                <section
                                    key={i}
                                    className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f] mb-4"
                                >
                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                        {b.BeneficiaryAccountHolderName ?? "Account Details"}
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Account Holder" value={b.BeneficiaryAccountHolderName ?? "-"} />
                                        <FieldItem label="Account Number" value={b.AccountNumber ?? "-"} />
                                        <FieldItem label="Bank Name" value={b.BankName ?? "-"} />
                                        <FieldItem label="Branch" value={b.Branch ?? "-"} />
                                        <FieldItem label="Account Type" value={b.AcType ?? "-"} />
                                        <FieldItem label="IFSC Code" value={b.IFSCCode ?? "-"} />
                                    </div>
                                </section>
                            ))
                        ) : (
                            <NoDataView />
                        )}


                    </div>
                )}

                {activeTab === "Company" && (
                    <div className="space-y-4 p-4">


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
                                        <FieldItem label="Company Type" value={c.CompanyType ?? "-"} />
                                        <FieldItem label="Contact Person" value={c.ContactPerson ?? "-"} />
                                        <FieldItem label="Mobile Number" value={c.MobileNumber ?? "-"} />
                                        <FieldItem label="E-mail Id" value={c.EmailId ?? "-"} />
                                        <FieldItem label="PAN Number" value={c?.PANNumber ?? '-'} urls={c?.PanCardURL} isIcon />
                                        <FieldItem label="GST Number" value={c?.GSTNumber ?? '-'} urls={c?.GSTCertificateURL} isIcon />
                                        <FieldItem label="CIN Number" value={c?.CINNumber ?? '-'} urls={c?.CINURL} isIcon />
                                        <FieldItem label="RERA Number" value={c?.RERANumber ?? '-'} />
                                        <FieldItem label="City" value={c.CityName ?? "-"} />
                                    </div>
                                </section>
                            ))
                        ) : (
                            <NoDataView />
                        )}

                    </div>
                )}
            </div>
        </div>

    );
};

export default ViewProjectMaster;
