import { useLocation, useNavigate } from "react-router-dom";

import { useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { AssetMappingMasterData } from "../models/AssetMappingMasterModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";

const ViewAssetMappingMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading] = useState(false);

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/assetMappingMaster');

    //#endregion

    const editAssetData = location.state?.assetData as AssetMappingMasterData;

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editAssetData) return <div>No Asset Data Found</div>;


    //#region EDIT ASSET MAPPING
    const handleEditAssetMappingMaster = (row: AssetMappingMasterData) => {
        if (!row?.AssetMasterMappingId) return;

        navigate(`/assetMappingMaster/add/${row.AssetMasterMappingId}`, {
            state: {
                editAssetData: row,
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
    const handleBackToListAssetMappingMaster = () => {
        navigate('/assetMappingMaster', {
            state: {
                listState: listState ?? {
                    page: 1, filters: {},
                    sortInfo: undefined,
                    searchTerm: ''
                }
            }
        });
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <HeaderActionBar
                titleText={'Asset Mapping Master : '}
                subTitleText={editAssetData.AssetName ?? "-"}

                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListAssetMappingMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editAssetData) handleEditAssetMappingMaster(editAssetData!);

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
                                    <FieldItem label="Asset Type" value={editAssetData.AssetType} />

                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Asset Brand" value={editAssetData.AssetBrand} />
                                    <FieldItem label="Asset Model" value={editAssetData.AssetModel} />
                                    <FieldItem label="Serial Number" value={editAssetData.SerialNumber} />

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

                                    <FieldItem label="Employee Name" value={editAssetData.EmployeeName} />

                                    <FieldItem
                                        label="Assigned Date"
                                        value={
                                            editAssetData.AssignedDate
                                                ? formatDate_dd_MonthName_yy(editAssetData.AssignedDate)
                                                : "-"
                                        }

                                    />
                                    <FieldItem label="Condition On Issue" value={editAssetData.ConditionOnIssue} />

                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                    <FieldItem label="Remarks" value={editAssetData.Remarks} />
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
                                            editAssetData.ReturnDate
                                                ? formatDate_dd_MonthName_yy(editAssetData.ReturnDate)
                                                : "-"
                                        }

                                    />


                                </div>
                            </div>
                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                    <FieldItem label="Condition On Return" value={editAssetData.ConditionOnReturn} />
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
                                    

                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Asset Cost (₹)" value={editAssetData.AssetCost} />
                                    <FieldItem label="Supplier Name" value={editAssetData.SupplierName} />
                                </div>
                            </div>
                        </div>

                    </section>

                </div>

            </div>


        </div>
    );
};

export default ViewAssetMappingMaster;
