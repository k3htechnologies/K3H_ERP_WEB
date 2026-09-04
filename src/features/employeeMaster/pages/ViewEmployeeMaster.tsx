import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { EmployeeMasterData, EmployeeReportingCycle, FilterWithPaginationEmployeeMasterRequest } from '@/features/employeeMaster/models/EmployeeMasterModel';
import { useNavigate } from 'react-router-dom';
import { useEmployeeListState } from '@/features/employeeMaster/context/EmployeeListStateContext';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
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
import { getNameInitials } from '@/core/utils/getNameInitials';
import { BriefcaseBusiness, ChevronDown, Contact, ContactRound, GitBranch, History, Landmark, MapPin, Phone, School, } from 'lucide-react';
import { sendEmail } from '@/core/utils/comman';
import Accordion from '@/ui/components/Card/Accordion';

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <HeaderActionBar
                titleText={'Employee Details : '}
                subTitleText={employeeName}
                subSubTitleText={employeeData?.EmployeeCode}
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
                <>
                    <div className="grid grid-cols-12 gap-6">

                        <div className="col-span-6 space-y-6 pt-5">

                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="relative">
                                            {employeeData.ProfilePhotoURL && employeeData.ProfilePhotoURL !== '—' ? (
                                                <img
                                                    src={employeeData.ProfilePhotoURL}
                                                    alt="Profile"
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {getNameInitials(
                                                        `${employeeData?.FirstName} ${employeeData?.LastName}`
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div>

                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h1 className="text-xl font-bold text-slate-800">
                                                    {employeeData?.FirstName} {employeeData?.MiddleName} {employeeData?.LastName}
                                                </h1>

                                                <span
                                                    className="px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 border bg-[#E0E7FF] text-[#4338CA] border-blue-200" >
                                                    {(safe(employeeData!.EmployeeCode))}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-5">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <FieldItem label="Mobile" value={`+91 ${employeeData!.PersonalMobileNumber || "-"}`} />
                                        <FieldItem
                                            label="Email Id"
                                            value={
                                                <a
                                                    href={`mailto:${employeeData.EmailId}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        sendEmail(employeeData.EmailId || '');
                                                    }}
                                                    className="text-blue-600 text-sm underline truncate"
                                                >
                                                    {employeeData.EmailId ?? '-'}
                                                </a>
                                            }
                                        />

                                        <FieldItem label="DOB" value={employeeData.DateOfBirth ? formatDate_dd_MonthName_yy(employeeData.DateOfBirth) : "-"} />
                                        <FieldItem label="Gender" value={employeeData.Gender || "-"} />
                                        <FieldItem label="Blood Group" value={employeeData.BloodGroup || "-"} />
                                        <FieldItem label="Marital Status" value={employeeData.MaritalStatus || "-"} />
                                    </div>

                                    <div className="border-t border-gray-200 my-3" />

                                    <h3 className="text-md font-medium text-[#1D1D1D80] truncate pb-4">Identity Documents</h3>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Aadhaar :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.AadharCardNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            PAN :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.PanCardNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Passport :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.PassportNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                            Voter ID :
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900">
                                                {employeeData.VoterCardNumber || "-"}
                                            </span>
                                        </div>

                                        <div className="col-span-2 text-sm font-medium text-[#1D1D1D80]">
                                            Driving Licence:
                                            <span className="inline-block ml-2 rounded-lg bg-[#EEF3FF] px-3 py-1 text-md text-gray-900 break-all">
                                                {employeeData.DrivingLicenceNumber || "-"}
                                            </span>
                                        </div>

                                    </div>

                                </div>
                            </section>

                            {/* Address Details */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-[455px] flex flex-col overflow-hidden ">
                                <div className="flex items-center gap-3 mb-5 shrink-0">
                                    <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-[#D97706]" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Address Details
                                    </h2>
                                </div>

                                <div className="flex-1 overflow-y-auto thin-scroll pr-2">
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                                        <FieldItem label="Country" value={employeeData.CountryName || "-"} />
                                        <FieldItem label="State" value={employeeData.StateName || "-"} />
                                        <FieldItem label="District" value={employeeData.DistrictName || "-"} />
                                        <FieldItem label="City" value={employeeData.CityName || "-"} />
                                        <FieldItem label="Village / Area" value={employeeData.VillageName || "-"} />
                                    </div>

                                    <div className="border-t border-gray-200 my-3" />

                                    <div className="grid grid-cols-1 gap-y-3 text-xs pt-2">
                                        <FieldItem label="Permanent Address" value={employeeData.PermanentAddress || "-"} />
                                    </div>

                                    <div className="grid grid-cols-1 gap-y-3 text-xs pt-4">
                                        <FieldItem label="Communication Address" value={employeeData.CommunicationAddress || "-"} />
                                    </div>
                                </div>
                            </section>

                            {/* Emergency Contact */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                                        <Contact className="w-5 h-5 text-emerald-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Emergency Contact
                                    </h2>
                                </div>

                                <div className="mt-3 rounded-lg bg-[#EEF3FF] p-3">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-medium text-[#1D1D1D80]">
                                                Relation :
                                                <span className="ml-1 text-md text-gray-900">
                                                    {employeeData.EmergencyContactPersonRelationship}
                                                </span>
                                            </div>

                                            <div className="mt-1 text-sm font-medium text-[#111C2D]">
                                                +91 {employeeData.EmergencyMobileNumber}
                                            </div>
                                        </div>

                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2563EB33]">
                                            <Phone className="h-4 w-4 text-[#004AC6]" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>

                        <div className="col-span-6 space-y-6 pt-5">

                            {/* Employee Information */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">
                                        <ContactRound className="w-5 h-5 text-emerald-700" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Employee Information
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 gap-y-3 gap-x-4 text-xs pb-4">
                                    <FieldItem label="Company" value={employeeData.CompanyName || "-"} />
                                </div>

                                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                                    <FieldItem label="Branch" value={employeeData.Branch || "-"} />
                                    <FieldItem label="Department" value={employeeData.Department || "-"} />
                                    <FieldItem label="Designation" value={employeeData.Designation || "-"} />
                                    <div className="grid grid-cols-1 gap-y-3 gap-x-4 text-gray-900 pb-0">
                                        <FieldItem
                                            label="Employee Type"
                                            value={
                                                <span className="inline-block font-medium rounded-lg bg-[#EEF3FF] px-2 py-1 text-gray-900 text-sm">
                                                    {employeeData.EmployeeType || "-"}
                                                </span>
                                            }
                                        />
                                    </div>

                                    <FieldItem label="Joining Date" value={formatDate_dd_MonthName_yy(safe(employeeData!.JoiningDate))} />
                                    <FieldItem label="Probation Date" value={formatDate_dd_MonthName_yy(safe(employeeData!.ProbationDate))} />
                                    <FieldItem label="Office Mobile Number" value={`+91 ${employeeData.OfficeMobileNumber || "-"} `} />
                                    <FieldItem
                                        label="Office Email Id"
                                        value={
                                            <a
                                                href={`mailto:${employeeData.OfficeEmailId}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    sendEmail(employeeData.OfficeEmailId || '');
                                                }}
                                                className="text-blue-600 text-sm underline truncate"
                                            >
                                                {employeeData.OfficeEmailId ?? '-'}
                                            </a>
                                        }
                                    />
                                    <FieldItem label="Report Person" value={employeeData.ReportPersonName || "-"} />
                                    <FieldItem label="Id Card Issued Date" value={formatDate_dd_MonthName_yy(safe(employeeData!.IdCardIssuedDate))} />
                                </div>
                            </section>

                            {/* Reporting Structure */}
                            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm p-5 h-[620px]">
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                        <Contact className="w-5 h-5 text-indigo-600" />
                                    </div>

                                    <h2 className="text-[16px] font-semibold text-slate-800">
                                        Reporting Structure
                                    </h2>
                                </div>

                                <div className="h-[600px] overflow-y-auto thin-scroll pr-2">
                                    {employeeReportingCycleList && employeeReportingCycleList.length > 0 ? (
                                        employeeReportingCycleList.map((item, index) => (
                                            <div key={index} className="flex gap-4 relative">

                                                <div className="flex flex-col items-center">

                                                    {(() => {

                                                        const fullName = item?.FullName?.trim();

                                                        const profilePhotoURL = item?.ProfilePhotoURL;

                                                        const hasProfile =
                                                            profilePhotoURL &&
                                                            profilePhotoURL !== "" &&
                                                            profilePhotoURL !== "—";

                                                        return hasProfile ? (
                                                            <img
                                                                src={profilePhotoURL}
                                                                alt={fullName}
                                                                className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                                                onError={(e) => (e.currentTarget.style.display = "none")}
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                                {getNameInitials(fullName)}
                                                            </div>
                                                        );
                                                    })()}

                                                    {index !== employeeReportingCycleList.length - 1 && (
                                                        <div className="w-px bg-gray-500 flex-1 mt-1"></div>
                                                    )}

                                                </div>

                                                <div className="flex-1 pb-4">
                                                    <div className="flex justify-between">
                                                        <span className="font-semibold text-gray-500">{item.FullName || '-'}</span>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            ({item.EmployeeCode || '-'})
                                                        </span>
                                                    </div>

                                                    <div className="text-sm text-gray-500 pt-2">
                                                        {item.Designation || '-'}
                                                    </div>
                                                    <div className="text-sm text-gray-400 pt-2">
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

                        </div>

                    </div>

                    {/* Bank Details */}
                    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm mt-6 p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                                <Landmark className="w-5 h-5 text-indigo-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Bank Details
                            </h2>
                        </div>

                        <div className="grid grid-cols-4 gap-y-3 gap-x-4">
                            <FieldItem label="Bank Name" value={employeeData.BankName || "-"} />
                            <FieldItem
                                label="Account No"
                                value={
                                    <span className="inline-block font-medium rounded-lg bg-[#EEF3FF] px-2 py-1 text-gray-900 text-sm">
                                        {employeeData.AccountNo || "-"}
                                    </span>
                                }
                            />
                            <FieldItem label="Branch" value={employeeData.BankBranchName || "-"} />
                            <FieldItem label="IFSC Code" value={employeeData.IFSCCode || "-"} />
                        </div>
                    </section>


                    <Accordion
                        allowMultipleOpen
                        className="grid grid-cols-3 gap-4 pt-6 items-start "
                        items={[
                            { key: "Education Details", title: "Education Details" },
                            { key: "Experience Details", title: "Experience Details" },
                            { key: "Branch Associations", title: "Branch Associations" },
                        ]}
                        renderItem={(item, isOpen, toggle) => (
                            <section >

                                <div className="flex items-center justify-between p-5 cursor-pointer "
                                    onClick={async () => {
                                        toggle();

                                        if (
                                            item.key === "Education Details" &&
                                            !loadedSections.educationDetails
                                        ) {
                                            await loadEmployeeEducationDetails();
                                            setLoadedSections((prev) => ({
                                                ...prev,
                                                educationDetails: true,
                                            }));
                                        }

                                        if (
                                            item.key === "Experience Details" &&
                                            !loadedSections.experienceDetails
                                        ) {
                                            await loadEmployeeExperienceDetails();
                                            setLoadedSections((prev) => ({
                                                ...prev,
                                                experienceDetails: true,
                                            }));
                                        }

                                        if (
                                            item.key === "Branch Associations" &&
                                            !loadedSections.branchAssociations
                                        ) {
                                            await loadEmployeeBranchAssociations();
                                            setLoadedSections((prev) => ({
                                                ...prev,
                                                branchAssociations: true,
                                            }));
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3">

                                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                                                   ${item.key === "Branch Associations"
                                                ? "bg-violet-50"
                                                : "bg-indigo-50"
                                            }`}
                                        >
                                            {item.key === "Education Details" && (
                                                <School className="w-5 h-5 text-indigo-600" />
                                            )}

                                            {item.key === "Experience Details" && (
                                                <BriefcaseBusiness className="w-5 h-5 text-indigo-600" />
                                            )}

                                            {item.key === "Branch Associations" && (
                                                <GitBranch className="w-5 h-5 text-violet-600" />
                                            )}
                                        </div>

                                        <h2 className="text-[16px] font-semibold text-slate-800">
                                            {item.title}
                                        </h2>
                                    </div>

                                    <ChevronDown
                                        className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </div>

                                {isOpen && (
                                    <div className="px-5 pb-5">

                                        {/* Education */}
                                        {item.key === "Education Details" && (
                                            employeeEducationDetailsDataList.length === 0 ? (
                                                <div className="h-[120px] flex items-center justify-center text-gray-500">
                                                    No Education Details Found
                                                </div>
                                            ) : (
                                                <div className="h-[220px] overflow-y-auto thin-scroll pr-2">
                                                    {employeeEducationDetailsDataList.map((e) => (
                                                        <div
                                                            key={e.Uniquekey}
                                                            className="border-b border-gray-200 mb-4 last:border-0 last:mb-0"
                                                        >
                                                            <div className="pb-3">
                                                                <h3 className="text-sm font-semibold text-slate-800">
                                                                    {e.Qualification}
                                                                </h3>

                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    {e.CollegeName}
                                                                </p>

                                                                <span className="mt-3 inline-flex rounded-full bg-[#FFFBEB] px-3 py-1 text-sm font-medium text-[#D97706]">
                                                                    Passing Year : {e.Passing}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* Experience */}
                                        {item.key === "Experience Details" && (
                                            employeeExperienceDetailsDataList.length === 0 ? (
                                                <div className="h-[120px] flex items-center justify-center text-gray-500">
                                                    No Experience Details Found
                                                </div>
                                            ) : (
                                                <div className="h-[220px] overflow-y-auto thin-scroll pr-2">
                                                    {employeeExperienceDetailsDataList.map((e) => (
                                                        <div
                                                            key={e.Uniquekey}
                                                            className="border-b border-gray-200 mb-4 last:border-0 last:mb-0"
                                                        >
                                                            <div className="pb-3">
                                                                <h3 className="text-sm font-semibold text-slate-800">
                                                                    {e.CompanyName}
                                                                </h3>

                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    {e.Role}
                                                                </p>

                                                                <span className="mt-3 inline-flex rounded-full bg-[#FFFBEB] px-3 py-1 text-sm font-medium text-[#D97706]">
                                                                    {e.Tenure}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )
                                        )}

                                        {/* Branch */}
                                        {item.key === "Branch Associations" && (
                                            branchAssociationsMasterDataList.length === 0 ? (
                                                <div className="h-[120px] flex items-center justify-center text-gray-500">
                                                    No Branch Associations Found
                                                </div>
                                            ) : (
                                                <div className="h-[220px] overflow-y-auto pr-2">
                                                    <div className="flex flex-wrap gap-3">
                                                        {branchAssociationsMasterDataList.map((e) => (
                                                            <div
                                                                key={e.Uniquekey}
                                                                className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                                                            >
                                                                {e.BranchName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </section>
                        )}
                    />

                    {/* Action Details */}
                    <section className="bg-white rounded-3xl border border-gray-200 shadow-sm mt-3 p-5">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center">
                                <History className="w-5 h-5 text-slate-600" />
                            </div>

                            <h2 className="text-[16px] font-semibold text-slate-800">
                                Action Details
                            </h2>
                        </div>

                        <div className="grid grid-cols-4 gap-6">
                            <FieldItem label="Created By" value={employeeData?.CreatedBy} />
                            <FieldItem label="Created Date" value={employeeData?.CreatedDate ? formatDate_dd_MonthName_yy_hh_mm(employeeData?.CreatedDate) : ""} />
                            {employeeData?.ModifiedBy && (
                                <>
                                    <FieldItem label="Modified By" value={employeeData?.ModifiedBy} />
                                    <FieldItem label="Modified Date" value={employeeData?.ModifiedDate ? formatDate_dd_MonthName_yy_hh_mm(employeeData?.ModifiedDate) : ""} />
                                </>
                            )}
                        </div>
                    </section>
                </>
            )}

            {activeTab === 'Document' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-5">

                    {docsWithUrls.length === 0 && (
                        <section className="md:col-span-4 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
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
                <div className="space-y-4 pt-5">
                    {assetMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <NoDataView message="No Assets Found" />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {assetMappingMasterList.map((asset) => (
                                <section
                                    key={asset.AssetCode}
                                    className="relative mb-5 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />

                                    <div className="flex items-center justify-between border-b border-gray-200 bg-[#F8FAFC] px-6 py-4">
                                        <h4 className="text-base font-semibold text-gray-800">
                                            {asset.AssetName}
                                        </h4>

                                        <div className="text-sm font-medium text-gray-500">
                                            Asset Code :
                                            <span className="ml-1 font-semibold text-gray-900">
                                                {asset.AssetCode ?? "-"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
                                        <FieldItem label="Serial Type" value={asset.AssetType} />
                                        <FieldItem label="Asset Brand" value={asset.AssetBrand} />
                                        <FieldItem label="Asset Model" value={asset.AssetModel} />
                                        <FieldItem label="Serial Number" value={asset.SerialNumber} />
                                        <FieldItem
                                            label="Assigned Date"
                                            value={
                                                asset.AssignedDate
                                                    ? formatDate_dd_MonthName_yy(asset.AssignedDate)
                                                    : "-"
                                            }
                                        />
                                        <FieldItem label="Assigned By" value={asset.CreatedBy || "-"} />
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "Project" && (
                <div className="space-y-4 pt-5">
                    {projectMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Project Found' />
                        </section>
                    ) : (
                        <div className="grid grid-cols-4 gap-3">
                            {projectMasterList.map((project) => (
                                <div key={project.ProjectId} className="border border-gray-200 p-3 rounded-xl bg-white flex justify-between">

                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden">
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
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Shift Policy Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {shiftMappingMasterList.map((shiftMappingPolicy) => {

                                return (
                                    <>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-5">

                                            {/* ================= LEFT SIDE (2/3) ================= */}
                                            <div className="lg:col-span-2 space-y-6">
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    {/* Header */}
                                                    <div className="bg-[#E7F2FF] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                                            Basic Information
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Shift Name" value={shiftMappingPolicy!.ShiftName} />
                                                        <FieldItem label="Shift Code" value={shiftMappingPolicy!.ShiftCode} />
                                                    </div>
                                                </section>
                                                {/* ================= SHIFT DURATION ================= */}
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#EAFCFF] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#12A3DD]">
                                                            Time Details
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftBeginTime} />
                                                        <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftEndTime} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Shift Duration Time" value={shiftMappingPolicy!.ShiftDurationTime} />
                                                        <FieldItem label="Shift Work Duration Time" value={shiftMappingPolicy!.ShiftWorkDurationTime} />
                                                    </div>
                                                </section>

                                                {/* ================= HALF DAY AND ABSENCE RULES================= */}
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#FFF6EB] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#C2410C]">
                                                            Advance Setting
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="First Half Up To" value={shiftMappingPolicy!.FirstHalfUpTo} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Calculate Absent if working hours less than" value={shiftMappingPolicy!.AbsentWorkingHours} />
                                                        <FieldItem label="Calculate Half day working hours less than" value={shiftMappingPolicy!.HalfDayWorkingHours} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Mark Half Day if Intime After" value={shiftMappingPolicy!.HalfDayInTimeAfter} />
                                                        <FieldItem label="Mark Half Day if Outtime After" value={shiftMappingPolicy!.HalfDayOutTimeBefore} />
                                                    </div>
                                                </section>
                                            </div>

                                            {/* ================= RIGHT SIDE (1/3) ================= */}
                                            <div className="lg:col-span-1 space-y-6">

                                                {/* ================= BREAK DETAILS ================= */}
                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#FFFFE4] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#7B6B28]">
                                                            Break Details
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Break Begin Time" value={shiftMappingPolicy!.BreakBeginTime} />
                                                        <FieldItem label="Break End Time" value={shiftMappingPolicy!.BreakEndTime} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Break Duration Time" value={shiftMappingPolicy!.BreakDurationTime} />
                                                    </div>
                                                </section>

                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#E6FFE6] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#00A800]">
                                                            Time Allowed for Late Entry
                                                        </h4>
                                                    </div>


                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Grace Time In Minutes" value={shiftMappingPolicy!.GraceTime} />
                                                    </div>
                                                </section>

                                                <section className="border border-[#33333321] rounded-xl overflow-hidden">
                                                    <div className="bg-[#E1E2E4] px-4 py-2 border-b border-[#D0D7DE]">
                                                        <h4 className="text-sm font-semibold text-[#333333]">
                                                            Remarks
                                                        </h4>
                                                    </div>


                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border-b border-[#135bec2e]">
                                                        <FieldItem label="Remarks" value={shiftMappingPolicy!.Remarks} />
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
                <div className="space-y-4 pt-5">
                    {weekOffMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Week Off Policy Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {weekOffMappingMasterList.map((weekOffPolicyMapping) => {
                                return (
                                    <>
                                        {/* ================= BASIC DETAILS ================= */}
                                        <section className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5 overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Policy Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <FieldItem label="Week Off Policy Name" value={weekOffPolicyMapping!.WeekOffPolicyName} />
                                                <FieldItem label="Week Off Policy Code" value={weekOffPolicyMapping!.WeekOffPolicyCode} />
                                                <FieldItem label="Week Days" value={weekOffPolicyMapping!.WeekDays} />
                                                <FieldItem label="Week Days Starts On" value={weekOffPolicyMapping!.WeekDaysStartsOn} />
                                            </div>
                                        </section>

                                        {/* ================= WEEK OFF DETAILS ================= */}
                                        <section className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5 overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Details
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <FieldItem label="Weekly Off" value={weekOffPolicyMapping!.WeeklyOff} />
                                                <FieldItem label="Weekly Off2" value={weekOffPolicyMapping!.WeeklyOff2} />
                                                <FieldItem label="Weekly Off2 Type" value={weekOffPolicyMapping!.WeeklyOff2Type} />
                                                <FieldItem label="Not Applicable For Months" value={weekOffPolicyMapping!.NotApplicableForMonths} />

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