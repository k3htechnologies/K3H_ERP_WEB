import { useNavigate } from "react-router-dom";
import { useAssetMasterListState } from "@/features/assetMaster/context/AssetMasterListStateContext";
import type { AssetMasterData } from "../models/AssetMasterModel";
import { useEffect, useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import Tabs from "@/ui/components/Tab/Tab";
import { runApiWithLoader } from "@/core/utils/apiLoaderHelper";
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from "@/features/assetMappingMaster/models/AssetMappingMasterModel";
import { assetMappingMasterService } from "@/features/assetMappingMaster/services/AssetMappingMasterService";
import * as E from 'fp-ts/Either';
import { Loader } from "@/core/utils/loader";
import useToast from "@/core/hooks/useToast";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { FilterWithPaginationAssetMasterRequest } from "@/features/assetMaster/models/AssetMasterModel";
import { assetMasterService } from "@/features/assetMaster/services/AssetMasterService";
import { MultiImageViewer } from "@/ui/components/ImageViewer/ImageViewer";
import { parseDocumentUrls } from "@/core/utils/documentUtils";

const ViewAssetPage: React.FC = () => {

    const [assetMappingMasterList, setAssetMappingMasterList] = useState<AssetMappingMasterData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [editAssetMasterList, setEditAssetMasterList] = useState<AssetMasterData[]>([]);
    const { canAction } = useMenuPermissions('/assetMaster');
    const { addToast } = useToast();
    const navigate = useNavigate();

    const { listState } = useAssetMasterListState();
    const assetName = listState.assetName || '';
    const assetMasterId = listState.assetMasterId || 0;

    const assetTabList = [
        { id: "Overview", label: "Overview" },
        { id: "Return History", label: "Return History" },
    ];

    const [activeTab, setActiveTab] = useState<string>(assetTabList[0].id);

    useEffect(() => {
        if (activeTab === "Overview") {

            loadAssetData();

        }
        else if (activeTab === "Return History") {

            loadAssetMappings();

        }
    }, [activeTab]);

    const loadAssetData = async () => {

        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {
                const params: FilterWithPaginationAssetMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    AssetMasterId: assetMasterId
                };
                const response = await assetMasterService.apiCallPullAssetMaster(params);

                if (E.isRight(response)) {

                    const asset = Array.isArray(response.right.Data) ? response.right.Data : [];

                    setEditAssetMasterList(asset);

                } else {
                    addToast({ type: 'error', title: response.left?.message || 'Failed to load asset data' });
                }
            },
            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },
            undefined,
            'Loading Asset Data'
        );
    };


    const loadAssetMappings = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 100,
                    AssetMasterId: assetMasterId,
                    Status: 'Inactive',
                    IsCheckPermission: false
                };

                const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

                if (E.isRight(response)) {

                    setAssetMappingMasterList(response.right.Data);

                } else {

                    addToast({ type: 'error', title: response.left.message });

                    return response;
                }
            },

            undefined,

            (error: any) => addToast({ type: 'error', title: error.message }),

            undefined,

            'Loading Asset Mapping'
        );
    };

    const handleEditAssetMaster = (row: AssetMasterData) => {
        if (!row?.AssetMasterId) return;
        navigate(`/assetMaster/add/${row.AssetMasterId}`);
    };

    const handleBackToListAssetMaster = () => {
        navigate('/assetMaster');
    };

    const editAssetData = editAssetMasterList.length > 0 ? editAssetMasterList[0] : null
    const assetInvoiceURL = parseDocumentUrls(editAssetData?.AssetInvoiceURL ?? "").filter(x => x?.trim()?.length);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <HeaderActionBar
                titleText={'Asset Master : '}
                subTitleText={assetName ?? ''}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListAssetMaster()}
                canAction={canAction && activeTab === "Overview" && editAssetData?.Status !== "Booked"}
                onEdit={() => {
                    if (activeTab === 'Overview') {
                        if (editAssetData) handleEditAssetMaster(editAssetData);
                    }
                }}
                isLoading={isLoading}
            />
            <div className='pt-3'>

                <Tabs
                    tabs={assetTabList}
                    defaultActive={activeTab}
                    islarge={true}
                    onTabChange={(t) => {

                        setActiveTab(t.id);

                        if (t.id === "Overview") loadAssetData();

                        else if (t.id === "Return History") loadAssetMappings()

                    }}
                />
            </div>
            {activeTab === 'Overview' && editAssetData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                    {/* ================= LEFT SIDE (2/3) ================= */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* ================= ASSET INFORMATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Asset Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Asset Name" value={editAssetData!.AssetName} />
                                        <FieldItem label="Asset Code" value={editAssetData!.AssetCode} />
                                        <FieldItem label="Serial Type" value={editAssetData!.AssetType} />

                                    </div>
                                </div>

                                <div className="lg:col-span-3 pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Asset Brand" value={editAssetData!.AssetBrand} />
                                        <FieldItem label="Asset Model" value={editAssetData!.AssetModel} />
                                        <FieldItem label="Serial Number" value={editAssetData!.SerialNumber} />

                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================= PURCHASE DETAILS ================= */}
                        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Purchase Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Purchase Date"
                                            value={
                                                editAssetData!.PurchaseDate
                                                    ? formatDate_dd_MonthName_yy(editAssetData!.PurchaseDate)
                                                    : "-"
                                            }

                                        />
                                        <FieldItem
                                            label="Warranty Expiry Date"
                                            value={
                                                editAssetData!.WarrantyExpiryDate
                                                    ? formatDate_dd_MonthName_yy(editAssetData!.WarrantyExpiryDate)
                                                    : "-"
                                            }

                                        />
                                        <FieldItem label="Supplier Name" value={editAssetData!.SupplierName} />

                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Asset Cost (₹)" value={editAssetData!.AssetCost} />
                                        <MultiImageViewer images={assetInvoiceURL}  title={"Document"} triggerLabel="View Documents" 
                                        />
                                    </div>
                                </div>
                            </div>

                        </section>

                    </div>

                    {/* ================= RIGHT SIDE (1/3) ================= */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* ================= AUDIT TRAIL ================= */}
                        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Action Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Created By" value={editAssetData!.CreatedBy} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                editAssetData!.CreatedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(editAssetData!.CreatedDate)
                                                    : "-"
                                            }

                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={editAssetData!.ModifiedBy} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={
                                                editAssetData!.ModifiedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(editAssetData!.ModifiedDate)
                                                    : "-"
                                            }

                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================= AUDIT TRAIL ================= */}
                        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">

                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Alloted Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Employee Name" value={editAssetData!.EmployeeName} />
                                        <FieldItem label="Department" value={editAssetData!.Department} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pt-3 pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Designation" value={editAssetData!.Designation} />
                                        <FieldItem label="Branch" value={editAssetData!.Branch} />


                                    </div>
                                </div>
                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Assigned Date" value={formatDate_dd_MonthName_yy(editAssetData!.AssignedDate ?? '')} />
                                    </div>
                                </div>
                            </div>
                        </section>

                    </div>

                </div>
            )}

            {activeTab === 'Return History' && assetMappingMasterList && (
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
                                                        <FieldItem label="Employee Name" value={asset.EmployeeName} />
                                                        <FieldItem label="Duration Date" value={formatDate_dd_MonthName_yy(asset.AssignedDate ?? '') + ' - To - ' + formatDate_dd_MonthName_yy(asset.ReturnDate ?? '')} />
                                                        <FieldItem label="Condition At Return" value={asset.ConditionOnReturn} />
                                                    </div>
                                                </div>

                                                <div className="lg:col-span-3 pt-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                        <FieldItem label="Department" value={asset.Department} />
                                                        <FieldItem label="Designation" value={asset.Designation} />
                                                        <FieldItem label="Branch" value={asset.Branch} />

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

        </div>
    );
};

export default ViewAssetPage;
