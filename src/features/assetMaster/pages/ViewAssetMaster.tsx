import { useLocation, useNavigate } from "react-router-dom";
import type { AssetMasterData } from "../models/AssetMasterModel";
import { useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const ViewAssetPage: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading] = useState(false);

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    const { canAction } = useMenuPermissions('/assetMaster');

    const editAssetData = location.state?.assetData as AssetMasterData;

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editAssetData) return <div>No Asset Data Found</div>;


    //#region EDIT ASSET
    const handleEditAssetMaster = (row: AssetMasterData) => {
        if (!row?.AssetMasterId) return;
        navigate(`/assetMaster/add/${row.AssetMasterId}`, {
            state: {
                editProjectMasterData: row,
                fromList: true,
                listState: listState ?? {
                    page: 1, filters: {},
                    sortInfo: undefined, searchTerm: ''
                }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListAssetMaster = () => {
        navigate('/assetMaster', {
            state: {
                listState: listState ?? {
                    page: 1, filters: {},
                    sortInfo: undefined, searchTerm: ''
                }
            }
        });
    };
    //#endregion
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <HeaderActionBar
                titleText={'Asset Master'}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListAssetMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editAssetData) handleEditAssetMaster(editAssetData!);

                }}
                isLoading={isLoading}
            />

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
                                    <FieldItem label="Asset Name" value={editAssetData.AssetName} />
                                    <FieldItem label="Asset Code" value={editAssetData.AssetCode} />
                                    <FieldItem label="Serial Type" value={editAssetData.AssetType} />

                                </div>
                            </div>

                            <div className="lg:col-span-3 pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Asset Brand" value={editAssetData.AssetBrand} />
                                    <FieldItem label="Asset Model" value={editAssetData.AssetModel} />
                                    <FieldItem label="Serial Number" value={editAssetData.SerialNumber} />

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
                                            editAssetData.PurchaseDate
                                                ? formatDate_dd_MonthName_yy(editAssetData.PurchaseDate)
                                                : "-"
                                        }

                                    />
                                    <FieldItem
                                        label="Warranty Expiry Date"
                                        value={
                                            editAssetData.WarrantyExpiryDate
                                                ? formatDate_dd_MonthName_yy(editAssetData.WarrantyExpiryDate)
                                                : "-"
                                        }

                                    />
                                    <FieldItem label="Supplier Name" value={editAssetData.SupplierName} />

                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Asset Cost" value={editAssetData.AssetCost} />
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
                                    <FieldItem label="Created By" value={editAssetData.CreatedBy} />
                                    <FieldItem
                                        label="Created Date"
                                        value={
                                            editAssetData.CreatedDate
                                                ? formatDate_dd_MonthName_yy(editAssetData.CreatedDate)
                                                : "-"
                                        }

                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Modified By" value={editAssetData.ModifiedBy} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={
                                            editAssetData.ModifiedDate
                                                ? formatDate_dd_MonthName_yy(editAssetData.ModifiedDate)
                                                : "-"
                                        }

                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

            </div>

        </div>
    );
};

export default ViewAssetPage;
