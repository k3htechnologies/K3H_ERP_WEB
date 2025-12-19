import React, { useEffect, useMemo, useState } from 'react';
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
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import TooltipText from '@/ui/components/Tooltip/TooltipText';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';


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

            loadProjectMasterWithEmployee(editProjectData!.ProjectId);
        }

        else if (activeTab === 'Employee') {

            loadProjectMasterWithEmployee(editProjectData!.ProjectId);
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

    const loadProjectMasterWithEmployee = async (ProjectId: number) => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const response = await ProjectMasterService.apiCallPullProjectMasterWithEmployee(ProjectId);

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

    //#region TABLE COLUMN EMPLOYEE MASTER
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

    //#region TABLE COLUMN COMPANY MASTER

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

    //#region TABLE COLUMN BANK DETAILS

    const projectMasterBankDetailsColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'BeneficiaryAccountHolderName',
                label: 'Ac Holder',
                width: '33',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value) => (
                    <div className={`flex items-center justify-start`}>
                        <TooltipText
                            text={value || 'N/A'}
                            maxWidth="250px"
                            tooltipThreshold={25}
                        />

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
        []
    )

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
                    uniquekey: row.Uniquekey
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
                    uniquekey: row.Uniquekey
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
                    uniquekey: row.Uniquekey
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
                titleText={'Project Details'}
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

    );
};

export default ViewProjectMaster;
