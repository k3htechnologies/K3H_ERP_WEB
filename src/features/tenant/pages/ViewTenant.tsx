import React, { useEffect, useMemo, useState } from 'react';
import { Loader } from '@/core/utils/loader';
import type { FilterWithPaginationTenantDocumentRequest, TenantData, TenantDocumentData } from '@/features/tenant/models/TenantModel';
import { useLocation, useNavigate } from 'react-router-dom';
import { FieldItem } from '@/ui/components/forms/FieldItem';
import { DataTable, type TableColumn } from '@/ui/components/DataTable/DataTable';
import MultiImageViewer from '@/ui/components/ImageViewer/ImageViewer';
import { parseDocumentUrls } from '@/core/utils/documentUtils';
import HeaderActionBar from '@/ui/components/forms/HeaderActionBar';
import { useMenuPermissions } from '@/features/menu/hooks/useMenuPermissions';
import { runApiWithLoader } from '@/core/utils';
import { useProject } from '@/features/projectMaster/context/ProjectContext';
import { tenantService } from '@/features/tenant/services/TenantService';
import * as E from 'fp-ts/Either';
import useToast from '@/core/hooks/useToast';
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from '@/core/utils/dateFormat';
import Tabs from '@/ui/components/Tab/Tab';
import NoDataView from '@/ui/components/NoDataView/NoDataView';
export const ViewTenant: React.FC = () => {

    //#region STATE MANAGEMENT
    const [tenantDocumentList, setTenantDocumentList] = useState<TenantDocumentData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const [applicantList, setApplicantList] = useState<any[]>([]);
    const [parkingList, setParkingList] = useState<any[]>([]);

    const { canAction } = useMenuPermissions();
    //LOCATION
    const navigate = useNavigate();
    // TOAST
    const { addToast } = useToast();

    const location = useLocation() as {
        state?: {
            editTenantData?: TenantData | null;
            fromList?: boolean;
            listState?: {
                page: number;
                filters: any;
                sortInfo?: any;
                searchTerm?: string;
                tenantId?: number;
                buildingId?: number;
                projectId?: number;
                tenantName?: string;
            };
        };
    };
    const preservedListState = location.state?.listState;


    //#endregion

    //#region PROJECT SELECTION GET ID

    const { projectId } = useProject()

    //#endregion

    //#region TAB ACTIVITY
    const tenantTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Document", label: "Document" },
    ];

    const [activeTab, setActiveTab] = useState<string>(tenantTabList[0].id);

    //#endregion

    //#region Get TENANT DATA FROM LOCATION STATE
    const editTenantData = (location.state?.editTenantData ?? null) as TenantData | null;
    //#endregion

    //#region INIT
    useEffect(() => {

        if (activeTab === 'Overview') {

            setApplicantList(editTenantData?.TenantApplicantData || []);
            setParkingList(editTenantData?.ParkingData || []);

        } else if (activeTab === 'Document') {

            loadTenantDocumentFromServer();

        }

    }, []);

    //#endregion

    //#region EDIT TENANT

    const handleEditTenant = (row: TenantData) => {
        if (!row?.TenantId) return;
        navigate(`/tenant/add/${row.TenantId}`, {
            state: {
                editTenantData: row,
                fromList: true,
                listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '', buildingId: 0, buildingName: '' }
            }
        });
    };


    //#endregion

    //#region BACK TENANT  PAGE
    const handleBackToListTenant = () => {
        navigate('/tenant', {
            state: { listState: preservedListState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '', buildingId: 0, buildingName: '' } }
        });
    };
    //#endregion

    //#region EDIT TENANT DOCUMENT

    const handleViewTenantDocument = (row: TenantDocumentData) => {
        navigate('/tenant/document', {
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
                    tenantId: preservedListState?.tenantId,
                    tenantName: preservedListState?.tenantName,
                }
            }

        });
    };
    //#endregion

    //#region PARKING TABLE COLUMN 
    const parkingColumns = useMemo<TableColumn[]>(
        () => [

            {
                key: 'ParkingNumber',
                label: 'Parking Number',
                width: '15',
                sortable: false,
                align: 'center',
                render: (value) => value || '-'
            }
        ],
        []

    );
    //#endregion


    //#region DATA LOAD TENANT DOCUMENT
    const loadTenantDocumentFromServer = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationTenantDocumentRequest = {
                    PageNumber: 1,
                    PageSize: 1000,
                    IsCheckPermission: true,
                    ProjectId: Number(projectId),
                    BuildingId: preservedListState?.buildingId,
                    TenantId: preservedListState?.tenantId
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



    //#endregion 

    //#region  TENANT DOCUMENT COLUMN

    const tenantDocumentColumns = useMemo<TableColumn[]>(
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
                            title="Tenant Document"
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
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <Loader loading={isLoading} title={loadingMessage}>
                <div></div>
            </Loader>

            <HeaderActionBar
                titleText={`Tenant ${activeTab}`}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListTenant()}
                canAction={canAction}
                onEdit={() => {
                    if (activeTab === "Overview") {
                        if (editTenantData) handleEditTenant(editTenantData);
                    }

                    else if (activeTab === "Document") {
                        const doc = tenantDocumentList?.[0];
                        if (tenantDocumentList) handleViewTenantDocument(doc)
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

                            setApplicantList(editTenantData?.TenantApplicantData || []);
                            setParkingList(editTenantData?.ParkingData || []);
                        }

                        else if (t.id === "Document") {

                            loadTenantDocumentFromServer()
                        }



                    }}
                />
            </div>

            {activeTab === 'Overview' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                        <div className="lg:col-span-3 space-y-6">

                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Applicant Details
                                </h4>
                                {applicantList.length > 0 ? (
                                    applicantList.map((tenantData, i) => {

                                        const isLast = i === applicantList.length - 1;
                                        const showBorder = !isLast;

                                        return (
                                            <div
                                                key={tenantData.TenantApplicantId ?? i}
                                                className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 ${showBorder ? 'border-b border-[#135bec2e]' : ''} `}
                                            >
                                                {/* SECTION 1 */}
                                                <div className={`lg:col-span-3 pt-3 ${isLast ? '' : 'pb-3'}`}>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                        <FieldItem label="Type" value={tenantData.ApplicantType} />
                                                        <FieldItem label="Full Name" value={tenantData.ApplicantName} urls={tenantData?.PhotoURL} isIcon />
                                                        <FieldItem label="Contact Number" value={tenantData?.ApplicantMobileNumber} />
                                                        <FieldItem label="E-Mail ID" value={tenantData?.ApplicantEmailId} />

                                                        <FieldItem label="Aadhar Card No." value={tenantData?.AadharCardNumber} urls={tenantData?.AadharCardURL} isIcon />
                                                        <FieldItem label="PAN No." value={tenantData?.PanNumber} urls={tenantData?.PanCardURL} isIcon />
                                                        <FieldItem label="Driving License" value={tenantData?.DrivingLicenseNumber} urls={tenantData?.DrivingLicenseURL} isIcon />
                                                        <FieldItem label="Voting ID No." value={tenantData?.VotingIdNumber} urls={tenantData?.VotingIdURL} isIcon />
                                                        <FieldItem label="Passport No." value={tenantData?.PassportNumber} urls={tenantData?.PassportURL} isIcon />
                                                        <FieldItem label="GST No." value={tenantData?.GSTNumber} urls={tenantData?.GSTNumberURL} isIcon />

                                                        <FieldItem label="Bank Name" value={tenantData?.BankName} />
                                                        <FieldItem label="Account No." value={tenantData?.AccountNumber} urls={tenantData?.ChequeURL} isIcon />
                                                        <FieldItem label="IFSC" value={tenantData?.IFSCCode} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="py-6 text-center text-gray-500 text-sm">
                                        <NoDataView message="No Applicant Data Found" />
                                    </div>
                                )}


                            </section>

                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
                        <div className="lg:col-span-2 space-y-6">

                            <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Unit Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Wing" value={editTenantData?.Wing} />
                                            <FieldItem label="Floor" value={editTenantData?.Floor} />
                                            <FieldItem label="Unit Number" value={editTenantData?.FlatNumber} />
                                        </div>
                                    </div>


                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Unit Type" value={editTenantData?.FlatType} />
                                            <FieldItem label="Unit Configuration" value={editTenantData?.FlatConfiguration} />
                                            <FieldItem label="RERA Carpet Area (SqFt)" value={editTenantData?.RERACarpetAreaSqFt} />
                                        </div>
                                    </div>


                                    <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Unit Facing" value={editTenantData?.Facing} />
                                            <FieldItem label="Free Area Offered (%)" value={editTenantData?.FreeAreaOfferedPercent} />
                                            <FieldItem label="Extra Area Purchased (SqFt)" value={editTenantData?.ExtraAreaPurchasedSqFt} />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-3 pt-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <FieldItem label="Total Area (SqFt)" value={editTenantData?.TotalAreaSqFt} />
                                        </div>
                                    </div>


                                </div>


                            </section>

                        </div>
                        {/* ================= RIGHT SIDE (1/3) ================= */}
                        <div className="lg:col-span-1 space-y-6">

                            {/* ================= QUICK ACTIONS ================= */}
                            <section className="bg-white rounded-xl shadow-sm p-6 border border-[#3333334f]">
                                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                    Action Details
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                    <FieldItem label="Created By" value={editTenantData?.CreatedBy ?? '-'} />
                                    <FieldItem
                                        label="Created Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(editTenantData?.CreatedDate ?? '-')}
                                    />
                                    <FieldItem label="Modified By" value={editTenantData?.ModifiedBy ?? '-'} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={formatDate_dd_MonthName_yy_hh_mm(editTenantData?.ModifiedDate ?? '-')}
                                    />
                                </div>
                            </section>
                        </div>

                    </div>

                    <div className="mt-6">
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.5px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                                Parking Details</h4>

                            <div className="pt-2">

                                <div className="w-full">
                                    <DataTable
                                        data={parkingList}
                                        columns={parkingColumns}
                                        emptyMessage="No Parking Data found"
                                        fixedHeight={false}
                                        recordsPerPage={20}
                                        className="min-w-full"
                                        aria-label="Parking list"
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                </>
            )}

            {activeTab === 'Document' && (
                <DataTable
                    data={tenantDocumentList}
                    columns={tenantDocumentColumns}
                    emptyMessage="No Tenant Documents Data Found"
                    fixedHeight={true}
                    recordsPerPage={20}
                    className="flex-1"
                    loading={isLoading}
                />
            )}
        </div>
    );
};

export default ViewTenant;
