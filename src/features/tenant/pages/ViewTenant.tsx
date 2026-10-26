import React, { useEffect, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { FilterWithPaginationTenantDocumentRequest, TenantData, TenantDocumentData } from '@/features/tenant/models/TenantModel';
import { useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { runApiWithLoader } from '@/core/utils';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { tenantService } from '@/features/tenant/services/TenantService';
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast';
import { formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import Tabs from '@/ui/components/Tab/Tab';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { useTenantListState } from '@/features/tenant/context/TenantListStateContext';
import TableActionToolbar from '@/ui/components/TableAction/TableActionToolbar';
import useDebouncedCallback from '@/core/hooks/useDebouncedCallback';
import { getSafeString } from '@/core/utils/comman';
export const ViewTenant: React.FC = () => {

    const [tenantDocumentList, setTenantDocumentList] = useState<TenantDocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [applicantList, setApplicantList] = useState<any[]>([]);
    const [inventoryFlatList, setInventoryFlatList] = useState<any[]>([]);

    const { canAction } = useMenuPermissions();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const { projectId } = useProject()
    const [searchTermForTenantDocument, setSearchTermForTenantDocument] = useState('')
    const debouncedSearchForTenantDocument = useDebouncedCallback((value: string) => {
        searchTenantDocument(value)
    }, 350)
    const { listState } = useTenantListState();
    const { tenantId, buildingId, applicantName, buildingName } = listState;

    const tenantTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(tenantTabList[0].id);

    const [editTenantData, setEditTenantData] = useState<TenantData | null>(null);

    useEffect(() => {
        if (!projectId || !tenantId) return;

        if (activeTab === 'Overview') {
            loadTenantData();
        } else if (activeTab === 'Document') {
            loadTenantDocumentFromServer('');
        }
    }, [projectId, tenantId, activeTab]);

    const loadTenantData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params = {
                    TenantId: tenantId,
                    ProjectId: Number(projectId),
                    BuildingId: buildingId
                };

                const response = await tenantService.apiCallPullTenantById(params);

                if (E.isRight(response)) {
                    const tenant = response.right.Data?.[0];
                    if (tenant) {
                        setEditTenantData(tenant);
                        setApplicantList(tenant.TenantApplicantData || []);
                        setInventoryFlatList(tenant.InventoryFlatData || []);
                    }
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
            'Loading Tenant Data'
        );
    };

    const handleEditTenant = (row: TenantData) => {
        if (!row?.TenantId) return;
        navigate(`/tenant/add/${row.TenantId}`);
    };

    const handleBackToListTenant = () => {
        navigate('/tenant');
    };

    const handleViewTenantDocument = () => {
        navigate('/tenant/document');
    };

    const searchTenantDocument = async (searchValue: string) => {

        setSearchTermForTenantDocument(searchValue);

        await loadTenantDocumentFromServer(searchValue);

    }

    const loadTenantDocumentFromServer = async (searchText = "") => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationTenantDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    IsCheckPermission: true,
                    ProjectId: Number(projectId),
                    DocumentName: searchText,
                    BuildingId: buildingId,
                    TenantId: tenantId
                }

                const response = await tenantService.apiCallPullTenantDocument(params);

                if (E.isRight(response)) {

                    setTenantDocumentList(response.right.Data);

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

    const clearsearchForTenantDocument = async () => {
        setSearchTermForTenantDocument('');
        debouncedSearchForTenantDocument.cancel?.();
        await loadTenantDocumentFromServer('');
    }


    const docsWithUrls = tenantDocumentList.filter(d => {
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
                titleText={`Tenant ${activeTab} :`}
                subTitleText={`${buildingName}`}
                subSubTitleText={`${applicantName}`}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListTenant()}
                canAction={canAction && !(activeTab === "Overview" && !editTenantData?.FlatIsEditDelete)}
                onEdit={() => {

                    if (activeTab === "Overview") {
                        if (!editTenantData?.FlatIsEditDelete) return;

                        if (editTenantData) {
                            handleEditTenant(editTenantData);
                        }
                    } else if (activeTab === "Document") {
                        handleViewTenantDocument();
                    }
                }}
                isLoading={isLoading}
            />

            <div className='pt-3'>

                <Tabs
                    tabs={tenantTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {

                        setActiveTab(t.id);

                        if (t.id === "Overview") {
                            loadTenantData();
                        }
                        else if (t.id === "Document") {
                            loadTenantDocumentFromServer()
                        }



                    }}
                />
            </div>

            {activeTab === 'Overview' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-3">
                        <div className="lg:col-span-3 space-y-6">

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                <div className="bg-[#FFF6EB] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#C2410C]">
                                        Applicant Details
                                    </h4>
                                </div>
                                <div className="p-4 bg-white">
                                    <div className="space-y-5">
                                        {applicantList.length > 0 ? (
                                            applicantList.map((tenantData, i) => {

                                                return (
                                                    <div key={tenantData.TenantApplicantId ?? i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        {/* SECTION 1 */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                            <FieldItem label="Type" value={tenantData.ApplicantType} className='text-blue-900 bold' />
                                                            <FieldItem label="Applicant Name" value={tenantData.ApplicantName} urls={tenantData?.PhotoURL} isIcon />
                                                            <FieldItem label="Mobile Number" value={`${getSafeString(tenantData?.ApplicantMobileNumberCountryCode ?? "+91")}  ${getSafeString(tenantData?.ApplicantMobileNumber)}`} />
                                                            <FieldItem label="E-Mail ID" value={tenantData?.ApplicantEmailId} />

                                                            <FieldItem label="Aadhaar Card No." value={tenantData?.AadharCardNumber} urls={tenantData?.AadharCardURL} isIcon />
                                                            <FieldItem label="PAN No." value={tenantData?.PanNumber} urls={tenantData?.PanCardURL} isIcon />
                                                            <FieldItem label="Passport No." value={tenantData?.PassportNumber} urls={tenantData?.PassportURL} isIcon />
                                                            <FieldItem label="Driving License" value={tenantData?.DrivingLicenseNumber} urls={tenantData?.DrivingLicenseURL} isIcon />
                                                            <FieldItem label="Voting ID No." value={tenantData?.VotingIdNumber} urls={tenantData?.VotingIdURL} isIcon />
                                                            <FieldItem label="GST No." value={tenantData?.GSTNumber} urls={tenantData?.GSTNumberURL} isIcon />

                                                            <FieldItem label="Bank Name" value={tenantData?.BankName} />
                                                            <FieldItem label="Account No." value={tenantData?.AccountNumber} urls={tenantData?.ChequeURL} isIcon />
                                                            <FieldItem label="IFSC" value={tenantData?.IFSCCode} />
                                                        </div>

                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="py-6 text-center text-gray-500 text-sm">
                                                <NoDataView message="No Applicant Data Found" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                        <div className="lg:col-span-2 space-y-6">

                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#13367A]">
                                        Existing Unit Details
                                    </h4>
                                </div>
                                <div className="p-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Tenant Code" value={editTenantData?.SystemGeneratedCode} />
                                                <FieldItem label="Unit / Annexure / Survey Number" value={editTenantData?.UnitAnnexureSurveyNumber} />
                                                <FieldItem label="Unit Type" value={editTenantData?.UnitType} />
                                            </div>
                                        </div>

                                        <div className="lg:col-span-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {editTenantData?.UnitType?.toUpperCase() !== "GYM"
                                                    ?
                                                    <FieldItem label="Unit Configuration" value={editTenantData?.UnitConfiguration} />
                                                    : <FieldItem label="Unit Carpet Area (SqFt)" value={editTenantData?.UnitCarpetAreaSqFt} />
                                                }

                                                {editTenantData?.UnitType?.toUpperCase() !== "GYM"
                                                    ?
                                                    <FieldItem label="Unit Carpet Area (SqFt)" value={editTenantData?.UnitCarpetAreaSqFt} />
                                                    : ""
                                                }
                                                <FieldItem label="Unit Facing" value={editTenantData?.UnitFacing} />

                                            </div>
                                        </div>


                                    </div>

                                </div>
                            </section>


                        </div>
                        {/* ================= RIGHT SIDE (1/3) ================= */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* ================= QUICK ACTIONS ================= */}
                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden">

                                <div className="bg-[#E1E2E4] px-3 py-2 border-b border-[#D0D7DE]">
                                    <h4 className="text-sm font-semibold text-[#333333]">
                                        Action Details
                                    </h4>
                                </div>
                                <div className="p-4 bg-white">

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 border-b border-[#135bec2e] pb-3">
                                        <FieldItem label="Created By" value={editTenantData?.CreatedBy ?? '-'} />
                                        <FieldItem
                                            label="Created Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(editTenantData?.CreatedDate ?? '-')}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pt-3">
                                        <FieldItem label="Modified By" value={editTenantData?.ModifiedBy ?? '-'} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={formatDate_dd_MonthName_yy_hh_mm(editTenantData?.ModifiedDate ?? '-')}
                                        />
                                    </div>
                                </div>
                            </section>
                        </div>

                    </div>

                    <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-6">

                        <div className="bg-[#FFFFE4] px-3 py-2 border-b border-[#D0D7DE]">
                            <h4 className="text-sm font-semibold text-[#7B6B28]">
                                Eligibility Details in Carpet Area (SqFt)
                            </h4>
                        </div>
                        <div className="p-4 bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Extra Free Carpet Area Offered (%)" value={editTenantData?.ExtraFreeCarpetAreaOfferedPercent} />
                                        <FieldItem label="Free MOFA Carpet Area (SqFt)" value={editTenantData?.FreeMOFACarpetAreaSqFt} />

                                    </div>
                                </div>


                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Existing Terrace Area (SqFt)" value={editTenantData?.ExistingTerraceAreaSqFt} />
                                        <FieldItem label="New Eligibility MOFA Carpet Area (SqFt)" value={editTenantData?.NewEligibilityMOFACarpetAreaSqFt} />
                                        <FieldItem label="New Eligibility RERA Carpet Area (SqFt)" value={editTenantData?.NewEligibilityRERACarpetAreaSqFt} />


                                    </div>
                                </div>


                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="(A) Area Against Terrace (SqFt)" value={editTenantData?.AreaAgainstTerraceSqFt} />
                                        <FieldItem label="MOFA Carpet Area Purchased (SqFt)" value={editTenantData?.MOFACarpetAreaPurchasedSqFt} />
                                        <FieldItem label="RERA Carpet Area Purchased (SqFt)" value={editTenantData?.RERACarpetAreaPurchasedSqFt} />


                                    </div>
                                </div>
                                <div className="lg:col-span-3 pt-3 pb-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="(B) Deck Area (SqFt)" value={editTenantData?.DeckAreaSqFt} />
                                        <FieldItem label="Total New MOFA Carpet Area (SqFt)" value={editTenantData?.TotalNewMOFACarpetAreaSqFt} />
                                        <FieldItem label="(C) Total New Rera Carpet Area (SqFt)" value={editTenantData?.TotalNewRERACarpetAreaSqFt} />



                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className='flex'>
                                        <FieldItem
                                            label="Area Against Terrace + Deck Area + Total New RERA Carpet Area (SqFt) (A + B + C)"
                                            value={(
                                                (Number(editTenantData?.TotalNewRERACarpetAreaSqFt) || 0) +
                                                (Number(editTenantData?.DeckAreaSqFt) || 0) +
                                                (Number(editTenantData?.AreaAgainstTerraceSqFt) || 0)
                                            ).toFixed(2)}
                                        />
                                    </div>

                                </div>

                                <div className="lg:col-span-3 pt-3 pb-3">
                                    <div className='flex'>
                                        <FieldItem label="Remark" value={editTenantData?.Remark} />
                                    </div>

                                </div>


                            </div>
                        </div>

                    </section>

                    {inventoryFlatList.length > 0 ? (
                        inventoryFlatList.map((inventoryFlat, index) => (
                            <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-6" key={inventoryFlat.InventoryFlatId ?? index}>


                                <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE] flex items-center justify-between gap-3">
                                    <h4 className="text-sm font-semibold text-[#13367A]">
                                        New Unit Details : {inventoryFlat?.Flat}
                                    </h4>

                                    {Number(inventoryFlat?.BookingId ?? 0) > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                                            Booking Done - {inventoryFlat?.BookingApprovalStatus}
                                        </span>
                                    )}
                                </div>


                                <div className="p-4 bg-white">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Building Number" value={inventoryFlat?.BuildingNumber} />
                                                <FieldItem label="Wing" value={inventoryFlat?.Wing} />
                                                <FieldItem label="Floor" value={inventoryFlat?.Floor} />
                                            </div>
                                        </div>


                                        <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Unit Number" value={inventoryFlat?.Flat} />
                                                <FieldItem label="RERA Carpet Area (SqFt)" value={inventoryFlat?.RERACarpetAreaSqFt} />
                                                <FieldItem label="Unit Type" value={inventoryFlat?.FlatType} />
                                            </div>
                                        </div>


                                        <div className={`lg:col-span-3 pt-3 ${Number(inventoryFlat?.BookingId ?? 0) > 0 ? "border-b border-[#135bec2e] pb-3 " : ""}`}>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <FieldItem label="Unit Configuration" value={inventoryFlat?.FlatConfiguration} />
                                                <FieldItem label="Unit Facing" value={inventoryFlat?.FlatFacing} />
                                                <FieldItem label="Adjust Purchase Area (SqFt)" value={inventoryFlat?.AdjustPurchaseAreaSqFt} />
                                            </div>
                                        </div>

                                        {Number(inventoryFlat?.BookingId ?? 0) > 0 && (
                                            <div className="lg:col-span-3 pt-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    <FieldItem label="Booking Created By" value={inventoryFlat?.BookingCreatedBy} />
                                                    <FieldItem label="Booking Created Date" value={formatDate_dd_MonthName_yy_hh_mm(inventoryFlat?.BookingCreatedDate ?? '-')} />
                                                </div>

                                            </div>
                                        )}
                                    </div>
                                </div>

                                {inventoryFlat.ParkingData && inventoryFlat.ParkingData.length > 0 && (
                                    <section className="border-t border-[#135bec2e] mt-5 pt-4 p-4">
                                        <div className="bg-[#F6F9FF] px-3 py-2 border border-[#D0D7DE] rounded-md mb-4 flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-[#13367A]"> Parking Details </h4>
                                            <span className="text-xs font-medium text-gray-600">

                                                {inventoryFlat.ParkingData.length} Parking {inventoryFlat.ParkingData.length > 1 ? "'s" : ""}
                                            </span>
                                        </div>

                                        {inventoryFlat.ParkingData.map((parking: any, parkingIndex: any) => (

                                            <div key={parking.ParkingId ?? parkingIndex} className={parkingIndex === 0 ? "" : "pt-3"}>

                                                <span className="inline-flex items-center  bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Parking : {parkingIndex + 1} </span>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pb-4 pt-3">
                                                    <FieldItem label="Parking Number" value={getSafeString(parking.ParkingNumber)} />
                                                    <FieldItem label="Building" value={getSafeString(parking.BuildingNumber)} />
                                                    <FieldItem label="Wing" value={getSafeString(parking.Wing)} />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-[#135bec2e] pt-4 pb-4">
                                                    <FieldItem label="Floor" value={getSafeString(parking.Floor)} />
                                                    <FieldItem label="Category" value={getSafeString(parking.ParkingCategory)} />
                                                    <FieldItem label="Type" value={getSafeString(parking.ParkingType)} />
                                                </div>

                                                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 ${parkingIndex < inventoryFlat.ParkingData.length - 1 ? "border-b border-[#135bec2e] pb-4" : ""}`}>
                                                    <FieldItem label="Size" value={getSafeString(parking.ParkingSubType)} />
                                                    <FieldItem label="Dimensions" value={getSafeString(parking.ParkingDimensions)} />
                                                    <FieldItem label="EV Charging" value={parking.IsEVChargingAvailable ? "Yes" : "No"} />
                                                </div>

                                            </div>
                                        ))}
                                    </section>)}
                            </section>
                        ))
                    ) : (
                        <section className="border-[0.1px] rounded-xl border-[#33333321] rounded-sm overflow-hidden mt-6">


                            <div className="bg-[#F6F9FF] px-3 py-2 border-b border-[#D0D7DE] flex items-center justify-between gap-3">
                                <h4 className="text-sm font-semibold text-[#13367A]">
                                    New Unit Details
                                </h4>


                            </div>
                            <div className='p-4'>
                                <NoDataView message='No New unit details available'/>
                            </div>
                        </section>
                    )}


                </>
            )}

            {activeTab === 'Document' && (
                <div className="mt-3">
                    <TableActionToolbar
                        isShowSearchBar
                        searchTerm={searchTermForTenantDocument}
                        searchPlaceholder="Search By Document Name"
                        onSearchChange={(v) => {
                            setSearchTermForTenantDocument(v)
                            debouncedSearchForTenantDocument(v)
                        }}
                        onClearSearch={clearsearchForTenantDocument}
                        isShowFilterButton={false}
                        exportLoading={isLoading}
                    />

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
                </div>

            )}
        </div>
    );
};

export default ViewTenant;
