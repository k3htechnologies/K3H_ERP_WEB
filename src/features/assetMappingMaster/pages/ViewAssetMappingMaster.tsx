import { Button } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useState } from "react";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { runApiWithLoader } from "@/core/utils";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import { assetMappingMasterService } from "../services/AssetMappingMasterService";
import type { AssetMappingMasterData, DeleteAssetMappingMasterRequest } from "../models/AssetMappingMasterModel";

const ViewAssetMappingPage: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');


    //DELETE ASSET MASTER
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteAssetMasterDetailsData, setDeleteAssetMasterDetailsData] = useState<AssetMappingMasterData | null>(null)

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    // Selected asset data passed from the Asset List page (via navigate state)
    const editAssetData = location.state?.assetData as AssetMappingMasterData;

    // Stores pagination, filters, and sorting state of Asset List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editAssetData) return <div>No Asset Data Found</div>;

    //#region DELETE ASSET MASTER
    const handleDeleteAssetMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteAssetMasterDetailsData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteAssetMappingMasterRequest = {

                    AssetMasterMappingId: deleteAssetMasterDetailsData.AssetMasterMappingId || 0,

                    UniqueKey: deleteAssetMasterDetailsData.Uniquekey || ""
                };

                const response = await assetMappingMasterService.apiCallDeleteAssetMappingMaster(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/assetMappingMaster", { state: { listState } });
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Asset Mapping Master Data"
        );
    };

    //#region EDIT ASSET MAPPING
    const handleEditAssetMappingMaster = (row: AssetMappingMasterData) => {
        if (!row?.AssetMasterMappingId) return;
        navigate(`/assetMappingMaster/add/${row.AssetMasterMappingId}`, {
            state: {
                editAssetData: row,
                fromList: true,
                listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListAssetMappingMaster = () => {
        navigate('/assetMappingMaster', {
            state: { listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' } }
        });
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <div className="grid grid-cols-12 gap-6">

                {/* LEFT SIDE PROFILE CARD */}
                <div className="col-span-5">

                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4">

                        {/* HEADER  DETAILS*/}
                        <div className="pt-6 px-2 pb-4 text-center">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editAssetData.AssetName}
                                <span className="inline-block ml-2 text-green-500">●</span>
                            </h3>

                            <div className="mt-2 flex justify-center gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editAssetData.AssetCode}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editAssetData.AssetType}
                                </span>
                            </div>
                        </div>

                        {/* Asset Information*/}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded">
                                <h4 className="font-semibold text-sm text-gray-800">Asset Information</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Asset Brand" value={editAssetData.AssetBrand} isRow />
                                <FieldItem label="Asset Model" value={editAssetData.AssetModel} isRow />
                                <FieldItem label="Serial Number" value={editAssetData.SerialNumber} isRow />
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex justify-center gap-3 mt-6">
                            <Button
                                color='blue'
                                size='sm'
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditAssetMappingMaster(editAssetData!);
                                }}
                            >
                                <Edit className="w-4 h-4" /> Edit Asset
                            </Button>

                            <Button
                                color="gray"
                                variant="solid"
                                size="sm"
                                colorMode="light"
                                onClick={() => {
                                    setDeleteAssetMasterDetailsData(editAssetData);
                                    setIsConfirmationDialogBoxOpen(true);
                                }}
                            >
                                <Trash2 className="h-5 w-5" /> Delete
                            </Button>

                            <Button
                                color="transparent"
                                variant="transparent_border"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBackToListAssetMappingMaster();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                        
                        {/* Assignment Details */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Assignment Details</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Employee Name" value={editAssetData.EmployeeName} isRow />
                                <FieldItem label="Assigned Date" value={editAssetData.AssignedDate ? formatDate_dd_MonthName_yy(editAssetData.AssignedDate) : ""} isRow />
                                <FieldItem label="Return Date" value={editAssetData.ReturnDate ? formatDate_dd_MonthName_yy(editAssetData.ReturnDate) : ""} isRow />
                                <FieldItem label="Condition On Issue" value={editAssetData.ConditionOnIssue} isRow />
                                <FieldItem label="Condition On Return" value={editAssetData.ConditionOnReturn} isRow />
                                <FieldItem label="Remarks" value={editAssetData.Remarks} isRow />
                            </div>
                        </div>

                    </div>
                </div>

                {/*  RIGHT SIDE  */}
                <div className="col-span-7">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        {/* PURCHASE DETAILS */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Purchase & Warranty Details</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Purchase Date" value={editAssetData.PurchaseDate ? formatDate_dd_MonthName_yy(editAssetData.PurchaseDate) : ""} isRow />
                                <FieldItem label="Warranty Expiry Date" value={editAssetData.WarrantyExpiryDate ? formatDate_dd_MonthName_yy(editAssetData.WarrantyExpiryDate) : ""} isRow />

                                <FieldItem label="Supplier Name" value={editAssetData.SupplierName} isRow />
                                <FieldItem label="Asset Cost" value={editAssetData.AssetCost} isRow />
                            </div>
                        </div>

                        {/* Audit Trail */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Audit Trail</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Created By" value={editAssetData.CreatedBy} isRow />
                                <FieldItem label="Created Date" value={editAssetData.CreatedDate ? formatDate_dd_MonthName_yy(editAssetData.CreatedDate) : ""} isRow />
                                <FieldItem label="Modified By" value={editAssetData.ModifiedBy} isRow />
                                <FieldItem label="Modified Date" value={editAssetData.ModifiedDate ? formatDate_dd_MonthName_yy(editAssetData.ModifiedDate) : ""} isRow />
                                
                            </div>
                        </div>
                    </div>
                </div>
                {/* DELETE CONFIRMATION  ASSET MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => setIsConfirmationDialogBoxOpen(false)}
                    onConfirm={handleDeleteAssetMaster}
                    title="You are about to delete this Asset?"
                    message="Deleting this asset will permanently remove its data."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />

            </div>
        </div>
    );
};

export default ViewAssetMappingPage;
