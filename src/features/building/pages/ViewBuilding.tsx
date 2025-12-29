import React, { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { BuildingData, BuildingDetailsData, BuildingDocumentData, BuildingKeyContactDetails, FilterWithPaginationBuildingDetailsRequest, FilterWithPaginationBuildingDocumentRequest } from '@/features/building/models/BuildingModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { runApiWithLoader } from '@/core/utils';
import * as E from 'fp-ts/Either';
import { useToast } from '@/core/hooks/useToast';
import { buildingService } from '@/features/building/services/BuildingService';
import type { FilterWithPaginationBuildingRequest } from '../models/BuildingModel';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import Tabs from '@/ui/components/Tab/Tab';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';

export const ViewBuilding: React.FC = () => {

    //#region STATE MANAGEMENT
    const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
    const [buildingDocumentList, setBuildingDocumentList] = useState<BuildingDocumentData[]>([]);
    const [contactDetailsList, setContactDetailsList] = useState<Omit<BuildingKeyContactDetails, 'BuildingId' | 'ProjectId' | 'CreatedById' | 'CreatedBy' | 'CreatedDate' | 'ModifiedById' | 'ModifiedBy' | 'ModifiedDate' | 'LastModifiedBy' | 'LastModifiedDate'>[]>([]);
    const [buildingDetailsList, setBuildingDetailsList] = useState<BuildingDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions();
    // TOAST
    const { addToast } = useToast();

    //LOCATION
    const navigate = useNavigate();

    const location = useLocation() as {
        state?: {
            editBuildingData?: BuildingData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTerm?: string;
                buildingId?: number;
                projectId?: number;
                buildingName?: string;
            };
        };
    };
    const preservedListState = location.state?.listState;

    //#endregion

    //#region PROJECT SELECTION GET ID

    const { projectId } = useProject()

    //#endregion

    //#region Get BUILDING DATA FROM LOCATION STATE
    const incomingBuildingData = (location.state?.editBuildingData ?? null) as BuildingData | null;
    //#endregion

    //#region TAB ACTIVITY
    const buildingTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Details", label: "Details" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(buildingTabList[0].id);

    //#endregion

    //#region INIT
    useEffect(() => {

        if (incomingBuildingData) {

            setBuildingData(incomingBuildingData);

            return;
        }

        if (activeTab === 'Overview') {

            loadBuildingFromServer();

        } else if (activeTab === 'Document') {

            loadBuildingDocumentFromServer();

        }
        else if (activeTab === 'Details') {

            loadBuildingDetailsFromServer();

        }
    }, []);

    //#endregion

    //#region DATA LOAD OVERVIEW
    const loadBuildingFromServer = async () => {
        if (!preservedListState?.filters?.buildingId) return;
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BuildingId: preservedListState.buildingId,
                    IsCheckPermission: false,
                    ProjectId: Number(projectId)
                };

                const response = await buildingService.apiCallPullBuilding(params);

                if (E.isRight(response)) {

                    setBuildingData(response.right.Data?.[0] ?? null);

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
            'Loading Building Data'
        );
    };

    //#endregion 

    //#region DATA LOAD DOCUMENT
    const loadBuildingDocumentFromServer = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    IsCheckPermission: true,
                    ProjectId: Number(projectId),
                    BuildingId: preservedListState?.buildingId
                }

                const response = await buildingService.apiCallPullBuildingDocument(params);

                if (E.isRight(response)) {

                    setBuildingDocumentList(response.right.Data);

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
            'Loading Building Documents'
        );
    };

    const buildingDocumentColumns = useMemo<TableColumn[]>(
        () => [
            {
                key: 'DocumentName',
                label: 'Document Name',
                width: '33',
                sortable: true,
                fixed: 'left',
                align: 'left',
                render: (value) => value || 'N/A'
            },
            {
                key: 'DocumentURL',
                label: 'Document',
                width: '20',
                sortable: false,
                align: 'center',
                render: (value: string) => {
                    const urls = parseDocumentUrls(value);
                    if (urls.length === 0) return '-';
                    return (
                        <MultiImageViewer
                            images={urls}
                            title="Building Document"
                            triggerLabel={`View (${urls.length})`}
                        />
                    );
                }

            },
            {
                key: 'CreatedBy',
                label: 'Last Modified By',
                width: '33',
                sortable: true,
                align: 'center',
                render: (value) => value || 'N/A'
            },
            {
                key: 'CreatedDate',
                label: 'Last Modified Date',
                width: '33',
                sortable: true,
                align: 'center',
                render: (value) => value ? formatDate_dd_MonthName_yy(value) : '-'
            }
        ],

        [canAction]
    )

    //#endregion 

    //#region DATA LOAD Description
    const loadBuildingDetailsFromServer = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingDetailsRequest = {
                    ProjectId: Number(projectId),
                    BuildingId: preservedListState?.buildingId
                }

                const response = await buildingService.apiCallPullBuildingDetails(params);

                if (E.isRight(response)) {

                    setBuildingDetailsList(response.right.Data);

                    const row = response.right.Data?.[0];

                    if (row.BuildingKeyContactDetailsData && row.BuildingKeyContactDetailsData.length > 0) {

                        const contacts = row.BuildingKeyContactDetailsData.map(contact => ({
                            BuildingKeyContactDetailsId: contact.BuildingKeyContactDetailsId ?? 0,
                            Uniquekey: contact.Uniquekey ?? null,
                            ContactType: contact.ContactType ?? '',
                            ContactName: contact.ContactName ?? '',
                            MobileNumber: contact.MobileNumber ?? '',
                            EmailId: contact.EmailId ?? ''
                        }));

                        setContactDetailsList(contacts);

                    } else {

                        setContactDetailsList([]);
                    }


                } else {
                    addToast({
                        type: 'error', title: response.left.message
                    });
                }

                return response;
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Building Details'
        );
    };

    //#endregion 

    //#region EDIT BUILDING

    const handleEditBuilding = (row: BuildingData) => {
        if (!row?.BuildingId) return;
        navigate(`/building/add/${row.BuildingId}`, {
            state: {
                editBuildingData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };

    //#endregion

    //#region EDIT BUILDING DOCUMENT

    const handleViewBuildingDocument = (row: BuildingDocumentData) => {
        navigate('/building/document', {
            state: {
                buildingId: row.BuildingId,
                projectId: row.ProjectId,
                listState: {
                    page: preservedListState?.page,
                    filters: preservedListState?.filters,
                    sortInfo: preservedListState?.sortInfo,
                    searchTerm: preservedListState?.searchTerm,
                    buildingId: row.BuildingId,
                    projectId: row.ProjectId,
                    buildingName: preservedListState?.buildingName,
                }
            }
        });
    };
    //#endregion

    //#region EDIT BUILDING Description

    const handleViewBuildingDescription = (row: BuildingDetailsData) => {
        navigate('/building/description', {
            state: {
                buildingId: row.BuildingId,
                projectId: row.ProjectId,
                listState: {
                    page: preservedListState?.page,
                    filters: preservedListState?.filters,
                    sortInfo: preservedListState?.sortInfo,
                    searchTerm: preservedListState?.searchTerm,
                    buildingId: row.BuildingId,
                    projectId: row.ProjectId,
                    buildingName: preservedListState?.buildingName,
                }
            }
        });
    };

    //#endregion

    //#region BACK BUILDING PAGE
    const handleBackToListBuilding = () => {
        navigate('/building', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={`Building ${activeTab}`}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListBuilding()}
                canAction={canAction}
                onEdit={() => {

                    if (activeTab === "Overview") {

                        if (buildingData) handleEditBuilding(buildingData);
                    }

                    else if (activeTab === "Document") {
                        const doc = buildingDocumentList?.[0];
                        if (buildingDocumentList) handleViewBuildingDocument(doc)
                    }

                    else if (activeTab === "Details") {
                        const details = buildingDetailsList?.[0];
                        if (buildingDetailsList) handleViewBuildingDescription(details)
                    }
                }}

                isLoading={isLoading}
            />

            <div className='pt-3'>

                <Tabs
                    tabs={buildingTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {

                        setActiveTab(t.id);

                        if (t.id === "Overview") {

                            loadBuildingFromServer()
                        }

                        else if (t.id === "Document") {

                            loadBuildingDocumentFromServer()
                        }

                        else if (t.id === "Details") {

                            loadBuildingDetailsFromServer()
                        }

                    }}
                />
            </div>

            {activeTab === 'Overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

                    {/* ================= LEFT SIDE (2/3) ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ================= HEADER / BASIC DETAILS ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Building Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Building Name" value={buildingData?.BuildingName ?? '-'} />
                                <FieldItem label="CTS Number" value={buildingData?.CTSNumber ?? '-'} />
                                <FieldItem label="Road Width" value={buildingData?.RoadWidth ?? '-'} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                <FieldItem label="Land Ownership" value={buildingData?.LandOwnershipType ?? '-'} />

                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 pt-4">
                                <FieldItem label="Google Location" value={buildingData?.GoogleLocation ?? '-'} />
                            </div>
                        </section>

                        {/* ================= PROPERTY INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Property Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                <FieldItem label="Total Plot Area (sq ft)" value={buildingData?.TotalPlotAreaSqFt ?? '-'} />
                                <FieldItem label="Utilized Units Area (sq ft" value={buildingData?.TotalUnitsAreaUtilizedSqFt ?? '-'} />
                                <FieldItem label="Total Units" value={buildingData?.TotalNumberOfUnits ?? '-'} />

                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                <FieldItem label="Number Of Floors" value={buildingData?.NumberOfFloors ?? '-'} />

                            </div>
                        </section>

                        {/* ================= LOCATION DETAILS ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Location Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FieldItem label="Country" value={buildingData?.CountryName ?? '-'} />
                                <FieldItem label="State" value={buildingData?.StateName ?? '-'} />
                                <FieldItem label="District" value={buildingData?.DistrictName ?? '-'} />
                                <FieldItem label="City" value={buildingData?.CityName ?? '-'} />
                            </div>

                        </section>


                    </div>

                    {/* ================= RIGHT SIDE (1/3) ================= */}
                    <div className="lg:col-span-1 space-y-6">

                        

                        {/* ================= GARDERN INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Garden Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Is Garden Structure" value={buildingData?.IsGarden ? 'Yes' : 'No'} />
                                <FieldItem label="Garden Area (sq ft)" value={buildingData?.TotalGardenAreaSqFt ?? '-'} />

                            </div>

                        </section>

                        {/* ================= GARDERN INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Religious Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Is Religious Structure" value={buildingData?.IsReligiousStructure ? 'Yes' : 'No'} />
                                <FieldItem label="Structure Area (sq ft)" value={buildingData?.TotalReligiousStructureAreaSqFt ?? '-'} />

                            </div>

                        </section>

                        {/* ================= FSI / TDR INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                FSI / TDR Information
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="FSI / TDR Utilization (sq ft)" value={buildingData?.FSI_TDR_UtilizationSqFt ?? '-'} />
                                <FieldItem label="Property Age (Years)" value={buildingData?.PropertyAgeYears ?? '-'} />

                            </div>

                        </section>

                        {/* ================= GARDERN INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Litigation
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Is Litigation" value={buildingData?.IsLitigation ? 'Yes' : 'No'} />
                                <FieldItem label="Litigation Remarks" value={buildingData?.LitigationRemarks ?? '-'} />

                            </div>

                        </section>
                        {/* ================= QUICK ACTIONS ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                <FieldItem label="Created By" value={buildingData?.CreatedBy ?? '-'} />
                                <FieldItem
                                    label="Created Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(buildingData?.CreatedDate ?? '-')}
                                />
                                <FieldItem label="Modified By" value={buildingData?.ModifiedBy ?? '-'} />
                                <FieldItem
                                    label="Modified Date"
                                    value={formatDate_dd_MonthName_yy_hh_mm(buildingData?.ModifiedDate ?? '-')}
                                />
                            </div>
                        </section>

                    </div>

                </div>

            )}

            {activeTab === 'Document' && (
                <DataTable
                    data={buildingDocumentList}
                    columns={buildingDocumentColumns}
                    emptyMessage="No Building Documents Data Found"
                    fixedHeight={true}
                    recordsPerPage={20}
                    className="flex-1"
                    loading={isLoading}
                />
            )}

            {activeTab === 'Details' && (

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3 space-y-6">

                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Building Plot Area
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Gross Plot Area SqFt"
                                            value={buildingDetailsList?.[0]?.GrossPlotAreaSqFt ?? 0}
                                        />

                                        <FieldItem
                                            label="Physical Survey Area SqFt"
                                            value={buildingDetailsList?.[0]?.PlotAreaPhysicalSurveySqFt ?? 0}
                                        />

                                        <FieldItem
                                            label="Old Approved Plan Area SqFt"
                                            value={buildingDetailsList?.[0]?.PlotAreaOldApprovedPlanSqFt ?? 0}
                                        />
                                    </div>
                                </div>


                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <FieldItem
                                            label="Conveyance Area SqFt"
                                            value={buildingDetailsList?.[0]?.PlotAreaConveyanceSqFt ?? 0}
                                        />

                                        <FieldItem
                                            label="PR Card Area SqFt"
                                            value={buildingDetailsList?.[0]?.PlotAreaPRCardSqFt ?? 0}
                                        />

                                    </div>
                                </div>

                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Building Construction Details
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Total Built Up Area SqFt" value={buildingDetailsList?.[0]?.TotalBuiltUpAreaSqFt ?? 0} />
                                        <FieldItem label="Total Residential Units" value={buildingDetailsList?.[0]?.TotalResidentialUnits ?? 0} />
                                        <FieldItem label="Residential Carpet Area SqFt" value={buildingDetailsList?.[0]?.TotalResidentialCarpetAreaSqFt ?? 0} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Total Commercial Units" value={buildingDetailsList?.[0]?.TotalCommercialUnits ?? 0} />
                                        <FieldItem label="Commercial Carpet Area SqFt" value={buildingDetailsList?.[0]?.TotalCommercialCarpetAreaSqFt ?? 0} />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f] pt-5">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Building Key Contact Details
                            </h4>

                            <div className="space-y-4">


                                {contactDetailsList.map((contact, index) => (
                                    <div
                                        key={index}
                                        className="border-b border-[#135bec2e] p-4 space-y-3"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                            <FieldItem label="Contact Type" value={contact.ContactType} />
                                            <FieldItem label="Contact Name" value={contact.ContactName} />
                                            <FieldItem label="Mobile Number" value={`+91 ${contact.MobileNumber}`} />
                                            <FieldItem label="Email ID" value={contact.EmailId} />

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

            )}



        </div >
    );
};

export default ViewBuilding;
