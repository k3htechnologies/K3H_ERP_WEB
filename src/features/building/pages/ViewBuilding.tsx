import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { BuildingData, BuildingDetailsData, BuildingDocumentData, BuildingKeyContactDetails, FilterWithPaginationBuildingDetailsRequest, FilterWithPaginationBuildingDocumentRequest } from '@/features/building/models/BuildingModel';
import { useNavigate } from 'react-router-dom';
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
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import Accordion from '@/ui/components/Card/Accordion';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { useBuildingListState } from '@/features/building/context/BuildingListStateContext';

export const ViewBuilding: React.FC = () => {

    const [buildingData, setBuildingData] = useState<BuildingData | null>(null);
    const [buildingDocumentList, setBuildingDocumentList] = useState<BuildingDocumentData[]>([]);
    const [docFilesMap, setDocFilesMap] = useState<Record<number, BuildingDocumentData[]>>({});

    const accordionItems = buildingDocumentList
        .filter(d => d.UploadedBuildingDocumentCount !== 0)
        .map(d => ({
            key: String(d.BuildingDocumentId),
            title: d.DocumentName ?? "",
            doc: d
        }));

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebouncedCallback((value: string) => {
        searchBuildingDocument(value)
    }, 350)


    const [contactDetailsList, setContactDetailsList] = useState<Omit<BuildingKeyContactDetails, 'BuildingId' | 'ProjectId' | 'CreatedById' | 'CreatedBy' | 'CreatedDate' | 'ModifiedById' | 'ModifiedBy' | 'ModifiedDate' | 'LastModifiedBy' | 'LastModifiedDate'>[]>([]);
    const [buildingDetailsList, setBuildingDetailsList] = useState<BuildingDetailsData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const { canAction } = useMenuPermissions();

    const { addToast } = useToast();

    const navigate = useNavigate();

    const { projectId } = useProject()

    const { listState } = useBuildingListState();
    const { buildingId, buildingName } = listState;

    const buildingTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Details", label: "Details" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(buildingTabList[0].id);

    useEffect(() => {
        if (!projectId || !buildingId) return;

        if (activeTab === 'Overview') {
            loadBuildingFromServer();
        } else if (activeTab === 'Document') {
            loadBuildingDocumentFromServer();
        } else if (activeTab === 'Details') {
            loadBuildingDetailsFromServer();
        }
    }, [projectId, buildingId, activeTab]);

    const loadBuildingFromServer = async () => {
        if (!buildingId) return;
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    BuildingId: buildingId,
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

    const loadBuildingDocumentFromServer = async (searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    IsCheckPermission: true,
                    ProjectId: Number(projectId),
                    BuildingId: buildingId,
                    BuildingDocumentId: 0,
                    DocumentName: searchText,
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

    const loadSingleDocumentDetails = async (doc: BuildingDocumentData) => {

        if (docFilesMap[doc.BuildingDocumentId]) return;

        try {
            const params: FilterWithPaginationBuildingDocumentRequest = {
                PageNumber: 1,
                PageSize: 1000,
                IsCheckPermission: true,
                ProjectId: Number(projectId),
                BuildingId: buildingId,
                BuildingDocumentId: doc.BuildingDocumentId
            };

            const res = await buildingService.apiCallPullBuildingDocument(params);

            if (E.isRight(res)) {
                setDocFilesMap(prev => ({
                    ...prev,
                    [doc.BuildingDocumentId]: res.right.Data ?? []
                }));
            }
        }
        finally {

        }
    };

    const searchBuildingDocument = async (searchValue: string) => {

        setSearchTerm(searchValue);
        await loadBuildingDocumentFromServer(searchValue);

    }

    const clearsearchBuildingDocument = async () => {
        setSearchTerm('');
        debouncedSearch.cancel?.();
        await loadBuildingDocumentFromServer();
    }

    const loadBuildingDetailsFromServer = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationBuildingDetailsRequest = {
                    ProjectId: Number(projectId),
                    BuildingId: buildingId
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
        navigate(`/building/add/${row.BuildingId}`);
    };
    //#endregion

    //#region EDIT BUILDING DOCUMENT
    const handleViewBuildingDocument = () => {
        navigate('/building/document');
    };
    //#endregion

    //#region EDIT BUILDING Description
    const handleViewBuildingDescription = () => {
        navigate('/building/description');
    };
    //#endregion

    //#region BACK BUILDING PAGE
    const handleBackToListBuilding = () => {
        navigate('/building');
    };
    //#endregion

    return (

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={`Building ${activeTab} :`}
                subTitleText={buildingName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListBuilding()}
                canAction={canAction}
                onEdit={() => {

                    if (activeTab === "Overview") {

                        if (buildingData) handleEditBuilding(buildingData);
                    }

                    else if (activeTab === "Document") {
                        handleViewBuildingDocument();
                    }
                    else if (activeTab === "Details") {
                        handleViewBuildingDescription();
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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-3">

                    {/* ================= LEFT SIDE (2/3) ================= */}
                    <div className="lg:col-span-3 space-y-6">

                        {/* ================= HEADER / BASIC DETAILS ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                    Building Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Building Name" value={buildingData?.BuildingName ?? '-'} />
                                    <FieldItem label="CTS Number" value={buildingData?.CTSNumber ?? '-'} />
                                    <FieldItem label="Road Width" value={buildingData?.RoadWidth ?? '-'} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-4">
                                    <FieldItem label="Land Ownership" value={buildingData?.LandOwnershipType ?? '-'} />

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-1 pt-4 ">
                                    <div className="text-sm font-medium text-[#1D1D1D80] truncate">
                                        Google Location
                                    </div>
                                    {buildingData?.GoogleLocation !== "" ?
                                        <span className="text-blue-600 text-sm underline cursor-pointer break-all whitespace-normal"
                                            onClick={() => window.open(buildingData?.GoogleLocation, "_blank")}>
                                            {buildingData?.GoogleLocation}
                                        </span> : "-"}
                                </div>
                            </div>
                        </section>

                        {/* ================= PROPERTY INFORMATION ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#C2410C]">
                                    Property Information
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Total Plot Area (SqMt)" value={buildingData?.TotalPlotAreaSqMt ?? '-'} />
                                    <FieldItem label="Total Plot Area (SqFt)" value={buildingData?.TotalPlotAreaSqFt ?? '-'} />
                                    <FieldItem label="Utilized Units Area (SqFt)" value={buildingData?.TotalUnitsAreaUtilizedSqFt ?? '-'} />


                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                    <FieldItem label="Total Units" value={buildingData?.TotalNumberOfUnits ?? '-'} />
                                    <FieldItem label="Number Of Floors" value={buildingData?.NumberOfFloors ?? '-'} />
                                    <FieldItem label="Number Of Wings" value={buildingData?.NumberOfWings ?? '-'} />

                                </div>
                            </div>
                        </section>

                        {/* ================= LOCATION DETAILS ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#13367A]">
                                    Location Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Country" value={buildingData?.CountryName ?? '-'} />
                                    <FieldItem label="State" value={buildingData?.StateName ?? '-'} />
                                    <FieldItem label="District" value={buildingData?.DistrictName ?? '-'} />

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                                    <FieldItem label="City" value={buildingData?.CityName ?? '-'} />
                                    <FieldItem label="Village" value={buildingData?.VillageName ?? '-'} />
                                    <FieldItem label="Ward" value={buildingData?.WardName ?? '-'} />

                                </div>
                            </div>
                        </section>


                    </div>

                    {/* ================= RIGHT SIDE (1/3) ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ================= FSI / TDR INFORMATION ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#7B6B28]">
                                    FSI / TDR Information
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="FSI / TDR Utilization (SqFt)" value={buildingData?.FSI_TDR_UtilizationSqFt ?? '-'} />
                                    <FieldItem label="Property Age (Years)" value={buildingData?.PropertyAgeYears ?? '-'} />

                                </div>
                            </div>

                        </section>

                        {/* ================= GARDERN INFORMATION ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#13367A]">
                                    Garden Information
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Garden" value={buildingData?.IsGarden ? 'Yes' : 'No'} />
                                    <FieldItem label="Garden Area (SqFt)" value={buildingData?.TotalGardenAreaSqFt ?? '-'} />

                                </div>
                            </div>

                        </section>

                        {/* ================= GARDERN INFORMATION ================= */}

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#EAFCFF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#12A3DD]">
                                    Religious Information
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Religious Structure" value={buildingData?.IsReligiousStructure ? 'Yes' : 'No'} />
                                    <FieldItem label="Structure Area (SqFt)" value={buildingData?.TotalReligiousStructureAreaSqFt ?? '-'} />

                                </div>
                            </div>

                        </section>



                        {/* ================= GARDERN INFORMATION ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#E6FFE6] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#00A800]">
                                    Litigation
                                </h4>
                            </div>
                            <div className="p-4 bg-white">

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Litigation" value={buildingData?.IsLitigation ? 'Yes' : 'No'} />
                                    <FieldItem label="Litigation Remarks" value={buildingData?.LitigationRemarks ?? '-'} />

                                </div>
                            </div>

                        </section>
                        {/* ================= QUICK ACTIONS ================= */}
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">
                            <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#333333]">
                                    Action Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-4">
                                    <FieldItem label="Created By" value={buildingData?.CreatedBy ?? '-'} />
                                    <FieldItem
                                        label="Created Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(buildingData?.CreatedDate ?? '-')}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-4">
                                    <FieldItem label="Modified By" value={buildingData?.ModifiedBy ?? '-'} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(buildingData?.ModifiedDate ?? '-')}
                                    />
                                </div>
                            </div>
                        </section>

                    </div>

                </div>

            )}

            {activeTab === "Document" && (
                <div className="mt-3">
                    <TableActionToolbar
                        isShowSearchBar
                        searchTerm={searchTerm}
                        searchPlaceholder="Search By Document Name"
                        onSearchChange={(v) => {
                            setSearchTerm(v)
                            debouncedSearch(v)
                        }}
                        onClearSearch={clearsearchBuildingDocument}
                        isShowFilterButton={false}
                        exportLoading={isLoading}
                    />

                    <Accordion
                        items={accordionItems}
                        allowMultipleOpen
                        renderItem={(item, isOpen, toggle) => {

                            const doc = buildingDocumentList.find(d => String(d.BuildingDocumentId) === item.key);

                            if (!doc) return null;


                            const details = docFilesMap[doc.BuildingDocumentId] ?? [];

                            return (
                                <div>
                                    <div
                                        className="flex justify-between items-center px-4 py-3"
                                        onClick={async () => {
                                            toggle();
                                            if (!isOpen) await loadSingleDocumentDetails(doc);
                                        }}
                                    >
                                        <h3 className="font-medium">{doc.DocumentName}</h3>
                                        <span>{isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}</span>
                                    </div>

                                    {/* BODY */}
                                    {isOpen && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-3 pt-3">

                                            {details.map(d => {

                                                const urls = parseDocumentUrls(d.DocumentURL ?? "");

                                                return (
                                                    <div key={d.Uniquekey} className="border border-gray-200 rounded-lg mb-3">

                                                        <div className="flex items-start justify-between p-2 gap-2">
                                                            <span className="line-clamp-2 break-words font-medium text-gray-900">
                                                                {d.DocumentName}
                                                            </span>

                                                            <MultiImageViewer
                                                                images={urls}
                                                                title={d.DocumentName ?? "Document"}
                                                                triggerLabel="View"
                                                                isIcon={false}
                                                            />
                                                        </div>

                                                        <div className="bg-gray-50 p-2 mt-auto">
                                                            <FieldItem label="Remark" value={d.DocumentRemark ?? '-'} />
                                                            <FieldItem
                                                                label="Uploaded By / Date"
                                                                value={
                                                                    `${d?.ModifiedBy || d?.CreatedBy || '-'} / ${d?.ModifiedDate
                                                                        ? formatDate_dd_MonthName_yy_hh_mm(d?.ModifiedDate)
                                                                        : d?.CreatedDate
                                                                            ? formatDate_dd_MonthName_yy_hh_mm(d?.CreatedDate)
                                                                            : '-'
                                                                    }`
                                                                }
                                                            />


                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }}
                    />
                </div>
            )}



            {activeTab === 'Details' && (

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
                    <div className="lg:col-span-3 space-y-6">

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                    Building Plot Area
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem
                                                label="Gross Plot Area (SqMt)"
                                                value={buildingDetailsList?.[0]?.GrossPlotAreaSqFt ?? 0}
                                            />

                                            <FieldItem
                                                label="Physical Survey Area (SqMt)"
                                                value={buildingDetailsList?.[0]?.PlotAreaPhysicalSurveySqFt ?? 0}
                                            />

                                            <FieldItem
                                                label="Old Approved Plan Area (SqMt)"
                                                value={buildingDetailsList?.[0]?.PlotAreaOldApprovedPlanSqFt ?? 0}
                                            />
                                        </div>
                                    </div>


                                    <div className="lg:col-span-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                            <FieldItem
                                                label="Conveyance Area (SqMt)"
                                                value={buildingDetailsList?.[0]?.PlotAreaConveyanceSqFt ?? 0}
                                            />

                                            <FieldItem
                                                label="PR Card Area (SqMt)"
                                                value={buildingDetailsList?.[0]?.PlotAreaPRCardSqFt ?? 0}
                                            />

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                    Building Construction Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Total Carpet Area (SqFt)" value={buildingDetailsList?.[0]?.TotalCarpetAreaSqFt ?? 0} />
                                            <FieldItem label="Total Residential Units" value={buildingDetailsList?.[0]?.TotalResidentialUnits ?? 0} />
                                            <FieldItem label="Residential Carpet Area (SqFt)" value={buildingDetailsList?.[0]?.TotalResidentialCarpetAreaSqFt ?? 0} />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Total Commercial Units" value={buildingDetailsList?.[0]?.TotalCommercialUnits ?? 0} />
                                            <FieldItem label="Commercial Carpet Area (SqFt)" value={buildingDetailsList?.[0]?.TotalCommercialCarpetAreaSqFt ?? 0} />
                                            <FieldItem label="Garage Carpet Area (SqFt)" value={buildingDetailsList?.[0]?.TotalGarageCarpetAreaSqFt ?? 0} />
                                        </div>
                                    </div>
                                    <div className="lg:col-span-3 ">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Terrace Carpet Area (SqFt)" value={buildingDetailsList?.[0]?.TotalTerraceCarpetAreaSqFt ?? 0} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                            <div className="bg-[#E7F2FF] px-3 py-2 border-b border-[#D0D7DE]">
                                <h4 className="text-sm font-semibold text-[#1D4ED8]">
                                    Building Key Contact Details
                                </h4>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="space-y-4">


                                    {contactDetailsList.map((contact, index) => (
                                        <div key={index} className={`space-y-3 ${index !== contactDetailsList.length - 1 ? "pb-4 border-b border-[#135bec2e]" : ""}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                                <FieldItem label="Contact Type" value={contact.ContactType} />
                                                <FieldItem label="Contact Name" value={contact.ContactName} />
                                                <FieldItem label="Mobile Number" value={contact?.MobileNumber ? `+91 ${contact.MobileNumber}` : ''} />
                                                <FieldItem label="E-Mail ID" value={contact.EmailId} />

                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

            )}



        </div >
    );
};

export default ViewBuilding;
