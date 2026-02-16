import { useNavigate } from "react-router-dom";
import { useAssetMappingMasterListState } from "@/features/assetMappingMaster/context/AssetMappingMasterListStateContext";

import { useEffect, useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";
import type { AssetMappingMasterData, FilterWithPaginationAssetMappingMasterRequest } from "../models/AssetMappingMasterModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { runApiWithLoader } from "@/core/utils";
import { assetMappingMasterService } from "../services/AssetMappingMasterService";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";

const ViewAssetMappingMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // NAVIGATION
    const navigate = useNavigate();
    const { listState } = useAssetMappingMasterListState();
    const assetMappingName = listState.assetMappingName;

    // TOAST
    const { addToast } = useToast();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/assetMappingMaster');

    //#endregion

    const [editAssetMappingData, setEditAssetMappingData] = useState<AssetMappingMasterData | null>(null);

    useEffect(() => {
        if (listState.assetMappingMasterId) {
            loadAssetMappingData();
        }
    }, [listState.assetMappingMasterId]);

    const loadAssetMappingData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationAssetMappingMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    AssetMasterMappingId: listState.assetMappingMasterId
                };

                const response = await assetMappingMasterService.apiCallPullAssetMappingMaster(params);

                if (E.isRight(response)) {

                    setEditAssetMappingData(response.right.Data[0]);

                } else {

                    addToast({ type: 'error', title: response.left.message });
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


    //#region EDIT ASSET MAPPING
    const handleEditAssetMappingMaster = (row: AssetMappingMasterData) => {
        if (!row?.AssetMasterMappingId) return;
        navigate(`/assetMappingMaster/add/${row.AssetMasterMappingId}`);
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListAssetMappingMaster = () => {
        navigate('/assetMappingMaster');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <HeaderActionBar
                titleText={'Asset Mapping Master : '}
                subTitleText={assetMappingName ?? "-"}

                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListAssetMappingMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editAssetMappingData!) handleEditAssetMappingMaster(editAssetMappingData!!);

                }}
                isLoading={isLoading}
            />

            {editAssetMappingData && (
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
                                        <FieldItem label="Asset Name" value={editAssetMappingData!.AssetName} />
                                        <FieldItem label="Asset Code" value={editAssetMappingData!.AssetCode} />
                                        <FieldItem label="Asset Type" value={editAssetMappingData!.AssetType} />

                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Asset Brand" value={editAssetMappingData!.AssetBrand} />
                                        <FieldItem label="Asset Model" value={editAssetMappingData!.AssetModel} />
                                        <FieldItem label="Serial Number" value={editAssetMappingData!.SerialNumber} />

                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* ================= ASSIGNMENT DETAILS ================= */}

                        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Assignment Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <FieldItem label="Employee Name" value={editAssetMappingData!.EmployeeName} />
                                        <FieldItem label="Department" value={editAssetMappingData!.Department} />
                                        <FieldItem label="Designation" value={editAssetMappingData!.Designation} />
                                        
                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pt-3 pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem
                                            label="Assigned Date"
                                            value={
                                                editAssetMappingData!.AssignedDate
                                                    ? formatDate_dd_MonthName_yy(editAssetMappingData!.AssignedDate)
                                                    : "-"
                                            }

                                        />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pt-3 pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <FieldItem label="Condition On Issue" value={editAssetMappingData!.ConditionOnIssue} />

                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                        <FieldItem label="Remarks" value={editAssetMappingData!.Remarks} />
                                    </div>
                                </div>
                            </div>

                        </section>



                        {/* ================= RETURN DETAILS ================= */}

                        <section className="bg-white rounded-xl border border-gray-300 shadow-sm p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Return Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <FieldItem
                                            label="Return Date"
                                            value={
                                                editAssetMappingData!.ReturnDate
                                                    ? formatDate_dd_MonthName_yy(editAssetMappingData!.ReturnDate)
                                                    : "-"
                                            }

                                        />


                                    </div>
                                </div>
                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                        <FieldItem label="Condition At Return" value={editAssetMappingData!.ConditionOnReturn} />
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
                                        <FieldItem label="Created By" value={editAssetMappingData!.CreatedBy} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                editAssetMappingData!.CreatedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(editAssetMappingData!.CreatedDate)
                                                    : "-"
                                            }

                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={editAssetMappingData!.ModifiedBy} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={
                                                editAssetMappingData!.ModifiedDate
                                                    ? formatDate_dd_MonthName_yy_hh_mm(editAssetMappingData!.ModifiedDate)
                                                    : "-"
                                            }

                                        />
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem
                                            label="Purchase Date"
                                            value={
                                                editAssetMappingData!.PurchaseDate
                                                    ? formatDate_dd_MonthName_yy(editAssetMappingData!.PurchaseDate)
                                                    : "-"
                                            }

                                        />
                                        <FieldItem
                                            label="Warranty Expiry Date"
                                            value={
                                                editAssetMappingData!.WarrantyExpiryDate
                                                    ? formatDate_dd_MonthName_yy(editAssetMappingData!.WarrantyExpiryDate)
                                                    : "-"
                                            }

                                        />


                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Asset Cost (₹)" value={editAssetMappingData!.AssetCost} />
                                        <FieldItem label="Supplier Name" value={editAssetMappingData!.SupplierName} />
                                    </div>
                                </div>
                            </div>

                        </section>

                    </div>

                </div>
            )}

        </div>
    );
};

export default ViewAssetMappingMaster;
