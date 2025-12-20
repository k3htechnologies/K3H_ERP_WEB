import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { EmployeeMasterData } from '@/features/employeeMaster/models/EmployeeMasterModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import Accordion from '@/ui/components/Card/Accordion';
import { Tabs } from '@/ui/components/Tab/Tab';
import { runApiWithLoader } from '@/core/utils';
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from '@/features/assetMappingMaster/models/AssetMappingMasterModel';
import { assetMappingMasterService } from '@/features/assetMappingMaster/services/AssetMappingMasterService';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { LocalStorageHelper } from '@/core/utils/localStorageHelper';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { EmployeeDocumentData, FilterWithPaginationEmployeeDocumentRequest } from '@/features/employeeMaster/models/EmployeeDocumentModel';
import { employeeDocumentService } from '@/features/employeeMaster/services/EmployeeDocumentService';
import { ShiftMappingMasterService } from '@/features/shiftMappingMaster/services/ShiftMappingMasterService'
import type { FilterWithPaginationShiftMappingMasterRequest, ShiftMappingMasterData } from '@/features/shiftMappingMaster/models/ShiftMappingMasterModel';
import { WeekOffMappingMasterService } from '@/features/weekOffMappingMaster/services/WeekOffMappingMasterService'
import type { FilterWithPaginationWeekOffMappingMasterRequest, WeekOffMappingMasterData } from '@/features/weekOffMappingMaster/models/WeekOffMappingMasterModel';

export const ViewEmployeeMaster: React.FC = () => {

    //#region STATE MANAGEMENT
    const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
    const [employeeDocumentList, setEmployeeDocumentList] = useState<EmployeeDocumentData[]>([]);
    const [shiftMappingMasterList, setShiftMappingMasterList] = useState<ShiftMappingMasterData[]>([]);
    const [weekOffMappingMasterList, setWeekOffMappingMasterList] = useState<WeekOffMappingMasterData[]>([]);
    const [projectList, setProjectList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions('/employeeMaster');

    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editEmployeeMasterData?: EmployeeMasterData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTerm?: string;
                employeeId: number;
                employeeName: string;
            };
        };
    };
    const preservedListState = location.state?.listState;

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

        if (activeTab === "Overview") {

        }

        else if (activeTab === "Document") {

            loadEmployeeDocuments()
        }

        else if (activeTab === "Assets") {

            loadAssetMasterMapping();
        }
        else if (activeTab === 'Project') {
            const stored = LocalStorageHelper.getStoredEmployeeData();
            setProjectList(stored?.ProjectData || []);
        }

        else if (activeTab === 'Shift Policy') {
            loadShiftMappings();
        }
        else if (activeTab === 'Week Off Policy') {

            loadWeekOffMappings();
        }

    }, []);

    //#endregion
    //#region Get EMPLOYEE DATA FROM LOCATION STATE
    const editEmployeeData = (location.state?.editEmployeeMasterData ?? null) as EmployeeMasterData | null;
    const employeeReportingCycleData = editEmployeeData!.EmployeeReportingCycleData;
    //#endregion

    //#region DATA LOAD FOR ASSET MAPPING TO EACH EMPLOYEE

    const loadAssetMasterMapping = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    EmployeeName: `${editEmployeeData!.FirstName.trim()} ${editEmployeeData!.LastName.trim()}`,

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
            setIsLoadingMessage,
            async () => {


                const params: FilterWithPaginationEmployeeDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 500,
                    IsCheckPermission: true,
                    EmployeeId: editEmployeeData!.EmployeeId!,
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
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationShiftMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    DepartmentName: undefined,
                    EmployeeName: `${editEmployeeData!.FirstName.trim()} ${editEmployeeData!.LastName.trim()}`,
                }

                const response = await ShiftMappingMasterService.apiCallPullShiftMappingMaster(params);

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
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationWeekOffMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    DepartmentName: undefined,
                    EmployeeName: `${editEmployeeData!.FirstName.trim()} ${editEmployeeData!.LastName.trim()}`,
                }

                const response = await WeekOffMappingMasterService.apiCallPullWeekOffMappingMaster(params);

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
    //#region EDIT EMPLOYEE

    const handleEditEmployee = (row: EmployeeMasterData) => {
        if (!row?.EmployeeId) return;
        navigate(`/employeeMaster/add/${row.EmployeeId}`, {
            state: {
                editEmployeeMasterData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };


    //#endregion

    //#region EDIT EMPLOYEE DOCUMENT

    const handleEditEmployeeDocument = (row: EmployeeMasterData) => {
        navigate('/employeeMaster/document', {
            state: {
                employeeId: row.EmployeeId!,
                employeeName: row.FullName,
                listState: {
                    page: preservedListState?.page,
                    filters: preservedListState?.filters,
                    sortInfo: preservedListState?.sortInfo,
                    searchTerm: preservedListState?.searchTerm,
                    employeeId: row.EmployeeId!,
                    employeeName: row.FullName
                }
            }
        });
    };


    //#endregion

    //#region BACK EMPLOYE EMASTER PAGE
    const handleBackToListEmployeeMaster = () => {
        navigate('/employeeMaster', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    const safe = (value?: any) => (value === null || value === undefined || value === '' ? '-' : value)

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>
            <HeaderActionBar
                titleText={'Employee Details'}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListEmployeeMaster()}
                canAction={canAction}
                onEdit={() => {
                    if (activeTab === "Overview") {
                        if (editEmployeeData) handleEditEmployee(editEmployeeData);
                    }
                    else if (activeTab === "Document") {
                        if (editEmployeeData) handleEditEmployeeDocument(editEmployeeData);
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
                        if (t.id === "Overview") {
                        }

                        else if (t.id === "Document") {

                            loadEmployeeDocuments()
                        }

                        else if (t.id === "Assets") {

                            loadAssetMasterMapping();
                        }
                        else if (t.id === 'Project') {
                            const stored = LocalStorageHelper.getStoredEmployeeData();
                            setProjectList(stored?.ProjectData || []);
                        }
                        else if (t.id === 'Shift Policy') {

                            loadShiftMappings();
                        }
                        else if (t.id === 'Week Off Policy') {

                            loadWeekOffMappings();
                        }

                    }}
                />
            </div>

            {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

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
                                        <FieldItem label="First Name" value={safe(editEmployeeData!.FirstName)} />
                                        <FieldItem label="Middle Name" value={safe(editEmployeeData!.MiddleName)} />
                                        <FieldItem label="Last Name" value={safe(editEmployeeData!.LastName)} />
                                    </div>
                                </div>


                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Gender" value={safe(editEmployeeData!.Gender)} />
                                        <FieldItem label="Marital Status" value={safe(editEmployeeData!.MaritalStatus)} />
                                        <FieldItem label="Blood Group" value={safe(editEmployeeData!.BloodGroup)} />
                                    </div>
                                </div>


                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="DOB" value={formatDate_dd_MonthName_yy(safe(editEmployeeData!.DateOfBirth))} />
                                        <FieldItem label="Email ID" value={safe(editEmployeeData!.EmailId)} />
                                        <FieldItem label="Personal Mobile No." value={editEmployeeData?.PersonalMobileNumber
                                            ? `+91 ${safe(editEmployeeData?.PersonalMobileNumber)}`
                                            : '-'}
                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Communication Address"
                                            value={safe(editEmployeeData!.CommunicationAddress)}
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-3  pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Permanent Address"
                                            value={safe(editEmployeeData!.PermanentAddress)}
                                        />
                                    </div>
                                </div>


                            </div>


                        </section>

                        {/* ================== EMPLOYEE INFO ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Employee Infoformation
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Company Name" value={safe(editEmployeeData!.CompanyName)} />
                                        <FieldItem label="Branch" value={safe(editEmployeeData!.Branch)} />
                                        <FieldItem label="Department" value={safe(editEmployeeData!.Department)} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Designation" value={safe(editEmployeeData!.Designation)} />
                                        <FieldItem
                                            label="Joining Date"
                                            value={formatDate_dd_MonthName_yy(safe(editEmployeeData!.JoiningDate))}
                                        />
                                        <FieldItem label="Reporting Person" value={safe(editEmployeeData!.ReportPersonName)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Employment Type" value={safe(editEmployeeData!.EmployeeType)} />

                                        <FieldItem label="Office Number" value={editEmployeeData?.OfficeMobileNumber
                                            ? `+91 ${safe(editEmployeeData?.OfficeMobileNumber)}`
                                            : '-'} />

                                        <FieldItem label="Office E-mail ID" value={safe(editEmployeeData!.OfficeEmailId)} />
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

                                        <FieldItem label="Country" value={safe(editEmployeeData!.CountryName)} />
                                        <FieldItem label="State" value={safe(editEmployeeData!.StateName)} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="District" value={safe(editEmployeeData!.DistrictName)} />
                                        <FieldItem label="City" value={safe(editEmployeeData!.CityName)} />
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
                                        <FieldItem label="Bank Name" value={safe(editEmployeeData!.BankName)} />
                                        <FieldItem label="Account Number" value={safe(editEmployeeData!.AccountNo)} />
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Bank Branch Name" value={safe(editEmployeeData!.BankBranchName)} />
                                        <FieldItem label="IFSC Code" value={safe(editEmployeeData!.IFSCCode)} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================== FAMILY DETAILS ================== */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Family Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="Relation to Emergency Contact" value={safe(editEmployeeData!.EmergencyContactPersonRelationship)} />
                                        <FieldItem
                                            label="Emergency Contact Number"
                                            value={
                                                editEmployeeData?.EmergencyMobileNumber
                                                    ? `+91 ${safe(editEmployeeData?.EmergencyMobileNumber)}`
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
                                        <FieldItem label="Created By" value={safe(editEmployeeData!.CreatedBy)} />
                                        <FieldItem
                                            label="Created Date"
                                            value={formatDate_dd_MonthName_yy(safe(editEmployeeData!.CreatedDate))}
                                        />
                                    </div>
                                </div>
                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={safe(editEmployeeData!.ModifiedBy)} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(safe(editEmployeeData!.ModifiedDate))}
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
                                {employeeReportingCycleData && employeeReportingCycleData.length > 0 ? (
                                    employeeReportingCycleData.map((item, index) => (
                                        <div key={index} className="flex gap-4 relative">

                                            <div className="flex flex-col items-center">

                                                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-sm">
                                                    {item.FullName!.trim().split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                                                </div>

                                                {index !== employeeReportingCycleData.length - 1 && (

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

                        {/* Documents example block */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Documents
                            </h4>
                            <div>Documents Listing Here</div>
                        </section>

                        {/* ================= FAMILY / EDUCATION / EXPERIENCE ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                            <Accordion
                                items={[
                                    { key: 'education', title: 'Education Details', content: <div /> },
                                    { key: 'experience', title: 'Experience', content: <div /> },

                                ]}
                            />
                        </section>

                    </div>

                </div>
            )}

            {activeTab === 'Document' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-5">

                    {employeeDocumentList?.filter(doc => doc?.DocumentURL)?.length > 0 ? (
                        employeeDocumentList
                            .filter(doc => doc?.DocumentURL)
                            .map((doc, index) => (
                                <section
                                    key={index}
                                    className="bg-white rounded-xl shadow-sm p-2 border border-gray-200"
                                >
                                    <div className="flex items-center justify-between rounded-lg transition">
                                        <FieldItem
                                            label={doc?.DocumentName || ''}
                                            urls={doc?.DocumentURL}
                                            isIcon
                                            isRow
                                            isSetValue={false}
                                        />
                                    </div>
                                </section>
                            ))
                    ) : (
                        <section className="md:col-span-2 bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <NoDataView message="No Documents Found" />
                        </section>
                    )}

                </div>

            )}


            {activeTab === 'Assets' && (
                <div className="space-y-4">
                    {assetMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Assets Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {assetMappingMasterList.map((asset) => {

                                return (
                                    <>

                                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
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
                                                        <FieldItem label="Status" value={asset.Status} />
                                                    </div>
                                                </div>
                                            </div>

                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Purchase Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem
                                                            label="Purchase Date"
                                                            value={
                                                                asset.PurchaseDate
                                                                    ? formatDate_dd_MonthName_yy(asset.PurchaseDate)
                                                                    : "-"
                                                            }

                                                        />
                                                        <FieldItem
                                                            label="Warranty Expiry Date"
                                                            value={
                                                                asset.WarrantyExpiryDate
                                                                    ? formatDate_dd_MonthName_yy(asset.WarrantyExpiryDate)
                                                                    : "-"
                                                            }

                                                        />
                                                        <FieldItem label="Supplier Name" value={asset.SupplierName} />

                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Asset Cost" value={asset.AssetCost} />
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
                    {projectList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Project Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {projectList.map((project) => (
                                <div key={project.ProjectId} className="border border-gray-200 p-3 rounded bg-white flex justify-between">

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

            {activeTab === 'Shift Policy' && (
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

                                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Shift Policy Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Department Name" value={shiftMappingPolicy!.DepartmentName} className='font-medium text-blue-900 ' />
                                                        <FieldItem label="Employee Name" value={shiftMappingPolicy!.EmployeeName} />
                                                        <FieldItem label="Shift Name" value={shiftMappingPolicy!.ShiftName} />
                                                        <FieldItem label="Shift Code" value={shiftMappingPolicy!.ShiftCode} />
                                                        <FieldItem label="Shift Begin Time" value={shiftMappingPolicy!.ShiftBeginTime} />
                                                        <FieldItem label="Shift End Time" value={shiftMappingPolicy!.ShiftEndTime} />
                                                        <FieldItem label="Shift Duration Time" value={shiftMappingPolicy!.ShiftDurationTime} />
                                                        <FieldItem label="Shift Work Duration Time" value={shiftMappingPolicy!.ShiftWorkDurationTime} />
                                                        <FieldItem label="Remarks" value={shiftMappingPolicy!.Remarks} />

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

            {activeTab === 'Week Off Policy' && (
                <div className="space-y-4">
                    {weekOffMappingMasterList.length === 0 ? (
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                            <NoDataView message='No Week Off Policy Found' />
                        </section>
                    ) : (
                        <div className="space-y-3">
                            {weekOffMappingMasterList.map((weekOffPolicyMapping) => {

                                return (
                                    <>

                                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]" >
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                                Week Off Policy Details
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Week Off Policy Name" value={weekOffPolicyMapping!.WeekOffPolicyName} className='font-medium text-blue-900 ' />
                                                        <FieldItem label="Week Off Policy Code" value={weekOffPolicyMapping!.WeekOffPolicyCode} />
                                                        <FieldItem label="Department Name" value={weekOffPolicyMapping!.DepartmentName} />
                                                        <FieldItem label="Employee Name" value={weekOffPolicyMapping!.EmployeeName} />
                                                        <FieldItem label="Week Days" value={weekOffPolicyMapping!.WeekDays} />
                                                        <FieldItem label="Week Days Starts On" value={weekOffPolicyMapping!.WeekDaysStartsOn} />
                                                        <FieldItem label="Weekly Off" value={weekOffPolicyMapping!.WeeklyOff} />
                                                        <FieldItem label="Weekly Off2" value={weekOffPolicyMapping!.WeeklyOff2} />
                                                        <FieldItem label="Weekly Off2 Type" value={weekOffPolicyMapping!.WeeklyOff2Type} />
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
