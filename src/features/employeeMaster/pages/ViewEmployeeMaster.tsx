import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { EmployeeMasterData, EmployeeReportingCycle, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import { useNavigate } from 'react-router-dom';
import { useEmployeeListState } from '@/features/employeeMaster/context/EmployeeListStateContext';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import Accordion from '@/ui/components/Card/Accordion';
import { Tabs } from '@/ui/components/Tab/Tab';
import { runApiWithLoader } from '@/core/utils';
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from '@/features/assetMappingMaster/models/AssetMappingMasterModel';
import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { EmployeeDocumentData, FilterWithPaginationEmployeeDocumentRequest } from '@/features/employeeMaster/models/EmployeeDocumentModel';
import { employeeDocumentService } from '@/features/employeeMaster/services/EmployeeDocumentService';
import { shiftMappingMasterService } from '@/features/shiftMappingMaster/services/ShiftMappingMasterService'
import type { FilterWithPaginationShiftMappingMasterRequest, ShiftMappingMasterData } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';
import { weekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService'
import type { FilterWithPaginationWeekOffMappingMasterRequest, WeekOffMappingMasterData } from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';
import { employeeMasterService } from '../services/EmployeeMasterService';
import type { FilterWithPaginationProjectMasterRequest, ProjectMasterData } from '@/features/projectMaster/models/ProjectMasterModel';
import { projectMasterService } from '@/features/projectMaster/services/ProjectMasterService';
import type { EmployeeExperienceDetailsData, FilterWithPaginationEmployeeExperienceDetailsRequest } from '@/features/employeeMaster/models/EmployeeExperienceDetailsModal';
import type { EmployeeEducationDetailsData, FilterWithPaginationEmployeeEducationDetailsRequest } from '@/features/employeeMaster/models/EmployeeEducationDetailsModel';
import { employeeExperienceDetailsService } from '@/features/employeeMaster/services/EmployeeExperienceDetailsService';
import { employeeEducationDetailsService } from '@/features/employeeMaster/services/EmployeeEducationDetailsService';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import type { BranchAssociationsMasterData, FilterWithPaginationBranchAssociationsMasterRequest } from '@/features/branchAssociationsMaster/models/BranchAssociationsMasterModel';
import { branchAssociationsService } from '@/features/branchAssociationsMaster/services/BranchAssociationsMasterService';

export const ViewEmployeeMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [employeeMasterList, setEmployeeMasterList] = useState<EmployeeMasterData[]>([]);
    const [employeeReportingCycleList, setEmployeeReportingCycleList] = useState<EmployeeReportingCycle[]>([]);
    const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
    const [employeeDocumentList, setEmployeeDocumentList] = useState<EmployeeDocumentData[]>([]);
    const [shiftMappingMasterList, setShiftMappingMasterList] = useState<ShiftMappingMasterData[]>([]);
    const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
    const [projectMasterList, setProjectMasterList] = useState<ProjectMasterData[]>([]);
    const [employeeEducationDetailsDataList, setEmployeeEducationDetailsDataList] = useState<EmployeeEducationDetailsData[]>([]);
    const [employeeExperienceDetailsDataList, setEmployeeExperienceDetailsDataList] = useState<EmployeeExperienceDetailsData[]>([]);
    const [loadedSections, setLoadedSections] = useState<{
        educationDetails?: boolean;
        experienceDetails?: boolean;
        branchAssociations?: boolean;
    }>({});

    const [branchAssociationsMasterDataList, setBranchAssociationsMasterDataList] = useState<BranchAssociationsMasterData[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions('/employeeMaster');

    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();
    const { listState, updateListState } = useEmployeeListState();

    const employeeName = listState.employeeName || '';

    //#endregion

    //#region TAB ACTIVITY
    const employeeTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
        { id: "Assets", label: "Assets" },
        { id: "Project", label: "Project" },
        { id: "Shift Policy", label: "Shift Policy" },
        { id: "Week Off Policy", label: "Week Off Policy" },
    ];

    const [activeTab, setActiveTab] = useState<string>(employeeTabList[0].id);

    //#endregion

    //#region INIT

    useEffect(() => {

        if (activeTab === "Overview") loadEmployee();

        else if (activeTab === "Document") loadEmployeeDocuments()

        else if (activeTab === "Assets") loadAssetMasterMapping();

        else if (activeTab === 'Project') loadProjects();

        else if (activeTab === 'Shift Policy') loadShiftMappings();

        else if (activeTab === 'Week Off Policy') loadWeekOffMappings();

    }, [activeTab]);

    //#endregion
    //#region DATA LOADING | FETCH |  LOAD | SEARCH  EMPLOYEE LIST
    const loadEmployee = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const filterParams: FilterWithPaginationEmployeeMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    IsCheckPermission: false,
                    EmployeeId: Number(listState.employeeId)
                }

                const response = await employeeMasterService.apiCallPullEmployeeMaster(filterParams);

                if (E.isRight(response)) {

                    const employeeList = Array.isArray(response.right.Data) ? response.right.Data : []

                    setEmployeeMasterList(employeeList);

                    setEmployeeReportingCycleList(employeeList[0]?.EmployeeReportingCycleData || []);


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

    //#region DATA LOAD FOR ASSET MAPPING TO EACH EMPLOYEE

    const loadAssetMasterMapping = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    EmployeeId: listState.employeeId,
                    IsCheckPermission: false

                };

                const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

                if (E.isRight(response)) {

                    setAssetMappingMasterList(response.right.Data);

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
            'Loading Asset'
        );
    };

    //#endregion 

    //#region  LOAD EMPLOYEE DOCUMENT FROM SERVER
    const loadEmployeeDocuments = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {


                const params: FilterWithPaginationEmployeeDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 500,
                    IsCheckPermission: true,
                    EmployeeId: listState.employeeId!,
                    DocumentName: undefined
                }

                const response = await getEmployeeDocuments(params);

                if (E.isRight(response)) {

                    setEmployeeDocumentList(response.right.Data);

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
            'Loading Employee Document'
        )
    }

    const getEmployeeDocuments = async (filterParams: FilterWithPaginationEmployeeDocumentRequest) => {

        return await employeeDocumentService.apiCallPullEmployeeDocument(filterParams);
    }
    //#endregion

    //#region  LOAD EMPLOYEE SHIFT POLICY FROM SERVER
    const loadShiftMappings = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationShiftMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 20,
                    DepartmentName: undefined,
                    EmployeeId: listState.employeeId,
                    IsCheckEmployeeShift: true,
                    IsCheckPermission: false
                }

                const response = await shiftMappingMasterService.apiCallPullShiftMappingMaster(params);

                if (E.isRight(response)) {

                    setShiftMappingMasterList(response.right.Data);


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
            'Loading Shift Mapping Data'
        )
    }
    //#endregion

    //#region LOAD WEEK OFF MAPPING POLICY
    const loadWeekOffMappings = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationWeekOffMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    DepartmentName: undefined,
                    EmployeeId: listState.employeeId,
                    IsCheckEmployeeWeekOffPolicy: true,
                    IsCheckPermission: false
                }

                const response = await weekOffMappingMasterService.apiCallPullWeekOffMappingMaster(params);

                if (E.isRight(response)) {

                    setWeekOffMappingMasterList(response.right.Data);


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
            'Loading Week Off Mapping'
        )
    }
    //#endregion

    //#region PROJECT MASTER
    const loadProjects = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationProjectMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    IsProjectAccess: false,
                    EmployeeId: listState.employeeId,
                }

                const response = await projectMasterService.apiCallPullProjectMaster(params);

                if (E.isRight(response)) {

                    setProjectMasterList(response.right.Data);

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
            'Loading Project'
        )
    }

    //#endregion

    //#region LOAD EMPLOYEE EDUCATION DETAILS
    const loadEmployeeEducationDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEmployeeEducationDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    Qualification: undefined,
                    EmployeeId: listState.employeeId,
                }

                const response = await employeeEducationDetailsService.apiCallPullEmployeeEducationDetails(params);

                if (E.isRight(response)) {

                    setEmployeeEducationDetailsDataList(response.right.Data);


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
            'Loading Employee Education'
        )
    }
    //#endregion

    //#region LOAD EMPLOYEE EXPERIENCE DETAILS
    const loadEmployeeExperienceDetails = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationEmployeeExperienceDetailsRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    CompanyName: undefined,
                    EmployeeId: listState.employeeId,
                }

                const response = await employeeExperienceDetailsService.apiCallPullEmployeeExperienceDetails(params);

                if (E.isRight(response)) {

                    setEmployeeExperienceDetailsDataList(response.right.Data);


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
            'Loading Employee Experience'
        )
    }
    //#endregion

    //#region LOAD EMPLOYEE BRANCH ASSOCIATIONS
    const loadEmployeeBranchAssociations = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBranchAssociationsMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EmployeeId: listState.employeeId,
                    IsCheckPermission: false
                }

                const response = await branchAssociationsService.apiCallPullBranchAssociations(params);

                if (E.isRight(response)) {

                    setBranchAssociationsMasterDataList(response.right.Data);


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
            'Loading Branch Associations'
        )
    }
    //#endregion


    //#region EDIT EMPLOYEE

    const handleEditEmployee = (row: EmployeeMasterData) => {
        if (!row?.EmployeeId) return;
        navigate(`/employeeMaster/add/${row.EmployeeId}`);
    };


    //#endregion

    //#region EDIT EMPLOYEE DOCUMENT

    const handleEditEmployeeDocument = (row: EmployeeMasterData) => {
        if (!row?.EmployeeId) return;
        updateListState({
            pageName: 'EMPLOYEE',
        });
        navigate('/employeeMaster/document');
    };


    //#endregion

    //#region BACK EMPLOYE EMASTER PAGE
    const handleBackToListEmployeeMaster = () => {
        navigate('/employeeMaster');
    };
    //#endregion

    const employeeData = employeeMasterList.length > 0 ? employeeMasterList[0] : null

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    const docsWithUrls = employeeDocumentList.filter(d => {
        const urls = parseDocumentUrls(d.DocumentURL ?? "")
            .filter(x => x?.trim()?.length);

        return urls.length > 0;
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <HeaderActionBar
                titleText={'Employee Details : '}
                subTitleText={employeeName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListEmployeeMaster()}
                canAction={canAction && (activeTab === "Overview" || activeTab === "Document")}
                onEdit={() => {
                    if (activeTab === "Overview") {
                        if (employeeData) handleEditEmployee(employeeData);
                    }
                    else if (activeTab === "Document") {
                        if (employeeData) handleEditEmployeeDocument(employeeData);
                    }
                }}
                isLoading={isLoading}
            />

            <div className='pt-3'>

                <Tabs
                    tabs={employeeTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {

                        setActiveTab(t.id);

                        if (t.id === "Overview") loadEmployee();

                        else if (t.id === "Document") loadEmployeeDocuments()

                        else if (t.id === "Assets") loadAssetMasterMapping();

                        else if (t.id === 'Project') loadProjects();

                        else if (t.id === 'Shift Policy') loadShiftMappings();

                        else if (t.id === 'Week Off Policy') loadWeekOffMappings();

                    }}
                />
            </div>

            {activeTab === 'Overview' && employeeData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">

                    {/* ================= LEFT SIDE (2/3) ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ================== BASIC DETAILS ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Basic Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="First Name" value={safe(employeeData!.FirstName)} />
                                        <FieldItem label="Middle Name" value={safe(employeeData!.MiddleName)} />
                                        <FieldItem label="Last Name" value={safe(employeeData!.LastName)} />
                                    </div>
                                </div>


                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Gender" value={safe(employeeData!.Gender)} />
                                        <FieldItem label="Marital Status" value={safe(employeeData!.MaritalStatus)} />
                                        <FieldItem label="Blood Group" value={safe(employeeData!.BloodGroup)} />
                                    </div>
                                </div>


                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(safe(employeeData!.DateOfBirth))} />
                                        <FieldItem label="Email ID" value={safe(employeeData!.EmailId)} />
                                        <FieldItem label="Personal Mobile No." value={employeeData?.PersonalMobileNumber
                                            ? `+91 ${safe(employeeData?.PersonalMobileNumber)}`
                                            : '-'}
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Communication Address"
                                            value={safe(employeeData!.CommunicationAddress)}
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-3  pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Permanent Address"
                                            value={safe(employeeData!.PermanentAddress)}
                                        />
                                    </div>
                                </div>


                            </div>


                        </section>
                        {/* ================== ADDRESS ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Address
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="Country" value={safe(employeeData!.CountryName)} />
                                        <FieldItem label="State" value={safe(employeeData!.StateName)} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="District" value={safe(employeeData!.DistrictName)} />
                                        <FieldItem label="City" value={safe(employeeData!.CityName)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================== EMPLOYEE INFO ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Employee Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Company Name" value={safe(employeeData!.CompanyName)} />
                                        <FieldItem label="Branch" value={safe(employeeData!.Branch)} />
                                        <FieldItem label="Department" value={safe(employeeData!.Department)} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Designation" value={safe(employeeData!.Designation)} />
                                        <FieldItem
                                            label="Joining Date"
                                            value={formatDate_dd_MonthName_yy(safe(employeeData!.JoiningDate))}
                                        />
                                        <FieldItem label="Reporting Person" value={safe(employeeData!.ReportPersonName)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Employee Type" value={safe(employeeData!.EmployeeType)} />

                                        <FieldItem label="Office Number" value={employeeData?.OfficeMobileNumber
                                            ? `+91 ${safe(employeeData?.OfficeMobileNumber)}`
                                            : '-'} />

                                        <FieldItem label="Office E-mail ID" value={safe(employeeData!.OfficeEmailId)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Probation Date"
                                            value={formatDate_dd_MonthName_yy(safe(employeeData!.ProbationDate))}
                                        />

                                        <FieldItem
                                            label="Id Card Issued Date"
                                            value={formatDate_dd_MonthName_yy(safe(employeeData!.IdCardIssuedDate))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>


                        {/* ================== BANK DETAILS ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900  mb-4">
                                Bank Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Bank Name" value={safe(employeeData!.BankName)} />
                                        <FieldItem label="Account Number" value={safe(employeeData!.AccountNo)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Bank Branch Name" value={safe(employeeData!.BankBranchName)} />
                                        <FieldItem label="IFSC Code" value={safe(employeeData!.IFSCCode)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================== FAMILY DETAILS ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Emergency Contact Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="Relation to Emergency Contact" value={safe(employeeData!.EmergencyContactPersonRelationship)} />
                                        <FieldItem
                                            label="Emergency Contact Number"
                                            value={
                                                employeeData?.EmergencyMobileNumber
                                                    ? `+91 ${safe(employeeData?.EmergencyMobileNumber)}`
                                                    : '-'
                                            }
                                        />


                                    </div>
                                </div>

                            </div>
                        </section>
                        {/* ================== ACTION DETAILS ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Created By" value={safe(employeeData!.CreatedBy)} />
                                        <FieldItem
                                            label="Created Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(safe(employeeData!.CreatedDate))}
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={safe(employeeData!.ModifiedBy)} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(safe(employeeData!.ModifiedDate))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                    {/* ================= RIGHT SIDE (1/3) ================= */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Reporting Structure example block */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Reporting Structure
                            </h4>
                            <div className="space-y-4">
                                {employeeReportingCycleList && employeeReportingCycleList.length > 0 ? (
                                    employeeReportingCycleList.map((item, index) => (
                                        <div key={index} className="flex gap-4 relative">

                                            <div className="flex flex-col items-center">

                                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {item.FullName!.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                                                </div>

                                                {index !== employeeReportingCycleList.length - 1 && (
                                                    <div className="w-px bg-gray-500 flex-1 mt-1"></div>
                                                )}

                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 pb-4">
                                                <div className="font-semibold text-gray-500">
                                                    {item.FullName || '-'}
                                                    <span className="ml-2 text-xs text-gray-300">
                                                        ({item.EmployeeCode || '-'})
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-500">
                                                    {item.Designation || '-'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {item.EmailId || '-'} +91 {item.PersonalMobileNumber || '-'}
                                                </div>

                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <NoDataView message='No Reporting Structure Found' />
                                )}
                            </div>

                        </section>


                        {/* ================= FAMILY / EDUCATION / EXPERIENCE ================= */}

                        <Accordion
                            allowMultipleOpen
                            items={[
                                { key: 'Education Details', title: 'Education Details' },
                                { key: 'Experience Details', title: 'Experience Details' },
                                { key: 'Branch Associations', title: 'Branch Associations' }
                            ]}
                            renderItem={(item, isOpen, toggle) => (
                                <div>

                                    {/* HEADER */}
                                    <div
                                        className="flex justify-between items-center px-4 py-3 cursor-pointer"
                                        onClick={async () => {
                                            toggle();

                                            if (item.key === 'Education Details' && !loadedSections.educationDetails) {
                                                await loadEmployeeEducationDetails();
                                                setLoadedSections(prev => ({ ...prev, education: true }));
                                            }

                                            if (item.key === 'Experience Details' && !loadedSections.experienceDetails) {
                                                await loadEmployeeExperienceDetails();
                                                setLoadedSections(prev => ({ ...prev, experience: true }));
                                            }

                                            if (item.key === 'Branch Associations' && !loadedSections.branchAssociations) {
                                                await loadEmployeeBranchAssociations();
                                                setLoadedSections(prev => ({ ...prev, branchAssociations: true }));
                                            }
                                        }}
                                    >
                                        <h4 className="font-semibold">{item.title}</h4>
                                    </div>

                                    {/* BODY */}
                                    {isOpen && (
                                        <div className="p-4">

                                            {item.key === 'Education Details' && (
                                                employeeEducationDetailsDataList.length === 0
                                                    ? <NoDataView message="No Education Details Found" />
                                                    : employeeEducationDetailsDataList.map(e => (
                                                        <div key={e.Uniquekey} className="mb-3 border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                                            <FieldItem label="Qualification" value={e.Qualification} isRow />
                                                            <FieldItem label="College" value={e.CollegeName} isRow />
                                                            <FieldItem label="Passing Year" value={e.Passing} isRow />
                                                        </div>
                                                    ))
                                            )}

                                            {item.key === 'Experience Details' && (
                                                employeeExperienceDetailsDataList.length === 0
                                                    ? <NoDataView message="No Experience Details Found" />
                                                    : employeeExperienceDetailsDataList.map(e => (
                                                        <div key={e.Uniquekey} className="mb-3 border-b border-gray-200 pb-2 last:border-b-0 last:pb-0">
                                                            <FieldItem label="Company Name" value={e.CompanyName} isRow />
                                                            <FieldItem label="Role" value={e.Role} isRow />
                                                            <FieldItem label="Tenure" value={e.Tenure} isRow />
                                                        </div>
                                                    ))
                                            )}

                                            {item.key === 'Branch Associations' && (
                                                branchAssociationsMasterDataList.length === 0 ? (
                                                    <NoDataView message="No Branch Associations Details Found" />
                                                ) : (
                                                    <div className="flex flex-wrap gap-3">
                                                        {branchAssociationsMasterDataList.map(e => (
                                                            <div key={e.Uniquekey} className="px-5 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-pointer">
                                                                <span className="font-medium text-gray-900 whitespace-nowrap">
                                                                    {e.BranchName}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            )}


                                        </div>
                                    )}

                                </div>
                            )}
                        />

                    </div>

                </div>
            )}

            {activeTab === 'Document' && (

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {docsWithUrls.length === 0 && (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                            <NoDataView message="No Documents Found" />
                        </section>
                    )}

                    {docsWithUrls.map(d => {
                        const urls = parseDocumentUrls(d.DocumentURL ?? "")
                            .filter(x => x?.trim()?.length);

                        return (
                            <div className="border border-gray-200 rounded-lg shadow-sm flex flex-col h-full">

                                <div className="flex items-start justify-between p-2 gap-2">
                                    <div className="flex flex-col">

                                        <span className="line-clamp-2 break-words font-medium text-gray-900">
                                            {d.DocumentName}
                                        </span>
                                        <span className="text-sm text-gray-500 mt-1">
                                            Document Count : {urls.length}
                                        </span>
                                    </div>

                                    <MultiImageViewer
                                        images={urls}
                                        title={d.DocumentName ?? "Document"}
                                        triggerLabel="View"
                                        isIcon={false}
                                    />


                                </div>


                                <div className="flex-grow" />

                                <div className="bg-gray-50 p-2 mt-auto">
                                    <FieldItem
                                        label="Uploaded By / Date"
                                        value={`${d?.ModifiedBy || d?.CreatedBy || '-'} / ${d?.ModifiedDate
                                            ? formatDate_dd_MonthName_yy_hh_mm(d?.ModifiedDate)
                                            : d?.CreatedDate
                                                ? formatDate_dd_MonthName_yy_hh_mm(d?.CreatedDate)
                                                : '-'
                                            }`}
                                    />
                                </div>

                            </div>

                        );
                    })}

                </div>

            )}



            {activeTab === 'Assets' && assetMappingMasterList && (
                <div className="space-y-4">
                    {assetMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3" >
                            <NoDataView message='No Assets Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {assetMappingMasterList.map((asset) => {

                                return (
                                    <>

                                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3" >
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Asset Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Asset Name" value={asset.AssetName} />
                                                        <FieldItem label="Asset Code" value={asset.AssetCode} />
                                                        <FieldItem label="Serial Type" value={asset.AssetType} />

                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Asset Brand" value={asset.AssetBrand} />
                                                        <FieldItem label="Asset Model" value={asset.AssetModel} />
                                                        <FieldItem label="Serial Number" value={asset.SerialNumber} />

                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Assigned Date" value={formatDate_dd_MonthName_yy(asset.AssignedDate || "-")} />
                                                        <FieldItem label="Assigned By" value={asset.CreatedBy || "-"} />
                                                    </div>
                                                </div>
                                            </div>



                                        </section>
                                    </>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Project" && (
                <div className="space-y-4">
                    {projectMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3" >
                            <NoDataView message='No Project Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {projectMasterList.map((project) => (
                                <div key={project.ProjectId} className="border border-gray-200 p-3 rounded bg-white flex justify-between mt-3">

                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-full overflow-hidden">
                                            <img
                                                src={project.ProjectPhotoURL}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div>
                                            <div className="font-semibold">{project.ProjectName}</div>
                                            <div className="text-xs text-gray-500">{project.ProjectLocation}</div>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Shift Policy' && shiftMappingMasterList && (
                <div className="space-y-4">
                    {shiftMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3" >
                            <NoDataView message='No Shift Policy Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {shiftMappingMasterList.map((shiftMappingPolicy) => {

                                return (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">

                                            {/* ================= LEFT SIDE (2/3) ================= */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Basic Shift Details
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                        <div className="lg:col-span-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftName} />
                                                                <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftCode} />

                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>
                                                {/* ================= SHIFT DURATION ================= */}
                                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Time Details
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftBeginTime} />
                                                                <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftEndTime} />
                                                                <FieldItem label="Shift Duration Time" value={shiftMappingPolicy!.ShiftDurationTime} />

                                                            </div>
                                                        </div>
                                                        <div className="lg:col-span-3 pt-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                <FieldItem label="Shift Work Duration Time" value={shiftMappingPolicy!.ShiftWorkDurationTime} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* ================= HALF DAY AND ABSENCE RULES================= */}
                                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Advance Setting
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                                <FieldItem label="First Half Up To" value={shiftMappingPolicy!.FirstHalfUpTo} />
                                                            </div>
                                                        </div>
                                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                                <FieldItem label="Calculate Absent if working hours less than" value={shiftMappingPolicy!.AbsentWorkingHours} />
                                                                <FieldItem label="Calculate Half day working hours less than" value={shiftMappingPolicy!.HalfDayWorkingHours} />
                                                            </div>
                                                        </div>

                                                        <div className="lg:col-span-3 pt-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                                                <FieldItem label="Mark Half Day if Intime After" value={shiftMappingPolicy!.HalfDayInTimeAfter} />
                                                                <FieldItem label="Mark Half Day if Outtime After" value={shiftMappingPolicy!.HalfDayOutTimeBefore} />

                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>



                                            </div>

                                            {/* ================= RIGHT SIDE (1/3) ================= */}
                                            <div className="lg:col-span-1 space-y-6">

                                                {/* ================= BREAK DETAILS ================= */}
                                                <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">

                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Break Details
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                                <FieldItem label="Break Begin Time" value={shiftMappingPolicy!.BreakBeginTime} />
                                                                <FieldItem label="Break End Time" value={shiftMappingPolicy!.BreakEndTime} />
                                                            </div>
                                                        </div>

                                                        <div className="lg:col-span-3 pt-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                                                <FieldItem label="Break Duration Time" value={shiftMappingPolicy!.BreakDurationTime} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>


                                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Time Allowed for Late Entry
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                        <div className="lg:col-span-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                                <FieldItem label="Grace Time In Minutes" value={shiftMappingPolicy!.GraceTime} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                        Remarks
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                        <div className="lg:col-span-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                                <FieldItem label="Remarks" value={shiftMappingPolicy!.Remarks} />

                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                            </div>

                                        </div>
                                    </>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'Week Off Policy' && weekOffMappingMasterList && (
                <div className="space-y-4">
                    {weekOffMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3" >
                            <NoDataView message='No Week Off Policy Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {weekOffMappingMasterList.map((weekOffPolicyMapping) => {

                                return (
                                    <>
                                        {/* ================= BASIC DETAILS ================= */}
                                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f] mt-3">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Policy Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Week Off Policy Name" value={weekOffPolicyMapping!.WeekOffPolicyName} />
                                                        <FieldItem label="Week Off Policy Code" value={weekOffPolicyMapping!.WeekOffPolicyCode} />
                                                        <FieldItem label="Week Days" value={weekOffPolicyMapping!.WeekDays} />

                                                    </div>
                                                </div>
                                                <div className="lg:col-span-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Week Days Starts On" value={weekOffPolicyMapping!.WeekDaysStartsOn} />
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {/* ================= WEEK OFF DETAILS ================= */}
                                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Weekly Off" value={weekOffPolicyMapping!.WeeklyOff} />
                                                        <FieldItem label="Weekly Off2" value={weekOffPolicyMapping!.WeeklyOff2} />
                                                        <FieldItem label="Weekly Off2 Type" value={weekOffPolicyMapping!.WeeklyOff2Type} />

                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                                        <FieldItem label="Not Applicable For Months" value={weekOffPolicyMapping!.NotApplicableForMonths} />

                                                    </div>
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}


        </div >
    );
};

export default ViewEmployeeMaster;
