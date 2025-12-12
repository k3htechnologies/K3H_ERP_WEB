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
import { DeductionMasterService } from "../services/DeductionMasterService";
import type { DeductionMasterData, DeleteDeductionMasterRequest } from "../models/DeductionMasterModel";

const ViewDeductionMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsLoadingMessage] = useState('');


    //DELETE DEDUCTION MASTER
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteDeductionMasterDetailsData, setDeleteDeductionMasterDetailsData] = useState<DeductionMasterData | null>(null)

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    // Selected Deduction data passed from the Deduction List page (via navigate state)
    const editDeductionData = location.state?.deductionData as DeductionMasterData;

    // Stores pagination, filters, and sorting state of Deduction List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editDeductionData) return <div>No Deduction Data Found</div>;

    //#region DELETE DEDUCTION MASTER
    const handleDeleteDeductionMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteDeductionMasterDetailsData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteDeductionMasterRequest = {

                    DeductionMasterId: deleteDeductionMasterDetailsData.DeductionMasterId || 0,

                    UniqueKey: deleteDeductionMasterDetailsData.Uniquekey || ""
                };

                const response = await DeductionMasterService.apiCallDeleteDeductionMaster(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/DeductionMaster", { state: { listState } });
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Deduction Master Data"
        );
    };

    //#region EDIT DEDUCTION 
    const handleEditDeductionMaster = (row: DeductionMasterData) => {
        if (!row?.DeductionMasterId) return;
        navigate(`/deductionMaster/add/${row.DeductionMasterId}`, {
            state: {
                editDeductionData: row,
                fromList: true,
                listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListDeductionMaster = () => {
        navigate('/deductionMaster', {
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
                                {editDeductionData.Name}
                                <span className="inline-block ml-2 text-green-500">●</span>
                            </h3>

                            <div className="mt-2 flex justify-center gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editDeductionData.Type}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editDeductionData.Value}
                                </span>
                            </div>
                        </div>

                        {/* Basic Information*/}
                        <div className="mt-4 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded">
                                <h4 className="font-semibold text-sm text-gray-800">Basic Information</h4>
                            </div>
                            <div className="p-4">
                                <FieldItem label="Gender" value={editDeductionData.Gender} isRow />
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
                                    handleEditDeductionMaster(editDeductionData!);
                                }}
                            >
                                <Edit className="w-4 h-4" /> Edit Deduction
                            </Button>

                            <Button
                                color="gray"
                                variant="solid"
                                size="sm"
                                colorMode="light"
                                onClick={() => {
                                    setDeleteDeductionMasterDetailsData(editDeductionData);
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
                                    handleBackToListDeductionMaster();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Applicability Details */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Applicability Details</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Branch Name" value={editDeductionData.BranchName} isRow />
                                <FieldItem label="State Name" value={editDeductionData.StateName} isRow />
                                <FieldItem label="Max Salary" value={editDeductionData.MaxSalary} isRow />
                                <FieldItem label="Min Salary" value={editDeductionData.MinSalary} isRow />
                            </div>
                        </div>
                    </div>
                </div>

                {/*  RIGHT SIDE  */}

                <div className="col-span-7">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        {/* Audit Trail */}

                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Audit Trail</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Created By" value={editDeductionData.CreatedBy} isRow />
                                <FieldItem label="Created Date" value={editDeductionData.CreatedDate ? formatDate_dd_MonthName_yy(editDeductionData.CreatedDate) : ""} isRow />
                                <FieldItem label="Modified By" value={editDeductionData.ModifiedBy} isRow />
                                <FieldItem label="Modified Date" value={editDeductionData.ModifiedDate ? formatDate_dd_MonthName_yy(editDeductionData.ModifiedDate) : ""} isRow />

                            </div>
                        </div>
                    </div>
                </div>
                
                {/* DELETE CONFIRMATION  DEDUCTION MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => setIsConfirmationDialogBoxOpen(false)}
                    onConfirm={handleDeleteDeductionMaster}
                    title="You are about to delete this Deduction?"
                    message="Deleting this Deduction will permanently remove its data."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />

            </div>
        </div>
    );
};

export default ViewDeductionMaster;
