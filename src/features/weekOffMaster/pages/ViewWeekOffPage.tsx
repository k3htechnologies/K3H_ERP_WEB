import { Button } from "@/ui/components/forms";
import { Edit, Trash2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { runApiWithLoader } from "@/core/utils";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import type { DeleteWeekOffMasterRequest, WeekOffMasterData } from "../models/WeekOffMasterModel";
import { WeekOffMasterService } from "../services/WeekOffMasterService";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

const ViewWeekOffMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsLoadingMessage] = useState('');


    //DELETE WEEK OFF MASTER
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteWeekOffMasterDetailsData, setDeleteWeekOffMasterDetailsData] = useState<WeekOffMasterData | null>(null)

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    // Selected WeekOff data passed from the WeekOff List page (via navigate state)
    const editWeekOffMasterData = location.state?.WeekOffData as WeekOffMasterData;

    // Stores pagination, filters, and sorting state of WeekOff List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editWeekOffMasterData) return <div>No Week Off Data Found</div>;

    //#region DELETE WEEK OFF MASTER
    const handleDeleteWeekOffMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteWeekOffMasterDetailsData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteWeekOffMasterRequest = {

                    WeekOffPolicyMasterId: deleteWeekOffMasterDetailsData.WeekOffPolicyMasterId || 0,

                    UniqueKey: deleteWeekOffMasterDetailsData.Uniquekey || ""
                };

                const response = await WeekOffMasterService.apiCallDeleteWeekOffMaster(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/WeekOffMaster", { state: { listState } });
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting WeekOff Master Data"
        );
    };

    //#region EDIT WEEK OFF MASTER
    const handleEditWeekOffMaster = (row: WeekOffMasterData) => {

        if (!row?.WeekOffPolicyMasterId) return;

        navigate(`/WeekOffMaster/add/${row.WeekOffPolicyMasterId}`, {
            state: {
                editWeekOffMasterData: row,
                fromList: true,
                listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListWeekOffMaster = () => {
        navigate('/WeekOffMaster',
            {
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
                                {editWeekOffMasterData.WeekOffPolicyName}
                                <span className="inline-block ml-2 text-green-500">●</span>
                            </h3>

                            <div className="mt-2 flex justify-center gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editWeekOffMasterData.WeekOffPolicyCode}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editWeekOffMasterData.WeekDays}
                                </span>
                            </div>
                        </div>

                        {/* BASIC INFORMATION */}
                        <div className="mt-4 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded">
                                <h4 className="font-semibold text-sm text-gray-800">Basic Information</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Weekly Off " value={editWeekOffMasterData.WeeklyOff} isRow />
                                <FieldItem label="Weekly Off2" value={editWeekOffMasterData.WeeklyOff2} isRow />
                                <FieldItem label="Weekly Off2 Type" value={editWeekOffMasterData.WeeklyOff2Type} isRow />
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
                                    handleEditWeekOffMaster(editWeekOffMasterData!);
                                }}
                            >
                                <Edit className="w-4 h-4" /> Edit WeekOff
                            </Button>

                            <Button
                                color="gray"
                                variant="solid"
                                size="sm"
                                colorMode="light"
                                onClick={() => {
                                    setDeleteWeekOffMasterDetailsData(editWeekOffMasterData);
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
                                    handleBackToListWeekOffMaster();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* WEEK OFF DETAILS */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Week Off Details</h4>
                            </div>

                            <div className="p-4">

                                <FieldItem label="Week Days Starts On" value={editWeekOffMasterData.WeekDaysStartsOn} isRow />
                                <FieldItem label="Not Applicable For Months" value={editWeekOffMasterData.NotApplicableForMonths} isRow />

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
                                <FieldItem label="Created By" value={editWeekOffMasterData.CreatedBy} isRow />
                                <FieldItem label="Created Date" value={editWeekOffMasterData.CreatedDate ? formatDate_dd_MonthName_yy(editWeekOffMasterData.CreatedDate) : ""} isRow />
                                <FieldItem label="Modified By" value={editWeekOffMasterData.ModifiedBy} isRow />
                                <FieldItem label="Modified Date" value={editWeekOffMasterData.ModifiedDate ? formatDate_dd_MonthName_yy(editWeekOffMasterData.ModifiedDate) : ""} isRow />

                            </div>
                        </div>
                    </div>
                </div>
                
                {/* DELETE CONFIRMATION  WEEK OFF MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => setIsConfirmationDialogBoxOpen(false)}
                    onConfirm={handleDeleteWeekOffMaster}
                    title="You are about to delete this WeekOff?"
                    message="Deleting this WeekOff will permanently remove its data."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />

            </div>
        </div>
    );
};

export default ViewWeekOffMaster;
