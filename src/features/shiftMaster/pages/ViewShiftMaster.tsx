import { Button } from "@/ui/components/forms";
import { useLocation, useNavigate } from "react-router-dom";

import { useState } from "react";
import ConfirmationDialogBox from "@/core/utils/confirmationDialogBox";
import { runApiWithLoader } from "@/core/utils";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import * as E from "fp-ts/Either";
import useToast from "@/core/hooks/useToast";
import type { DeleteShiftMasterRequest, ShiftMasterData } from "../models/ShiftMasterModel";
import { ShiftMasterService } from "../services/ShiftMasterService";

const ViewShiftMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [, setIsLoadingMessage] = useState('');


    //DELETE SHIFT MASTER
    const [isConfirmationDialogBoxOpen, setIsConfirmationDialogBoxOpen] = useState(false);
    const [deleteShiftMasterDetailsData, setDeleteShiftMasterDetailsData] = useState<ShiftMasterData | null>(null)

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    // TOAST
    const { addToast } = useToast();

    // Selected Shift data passed from the Shift List page (via navigate state)
    const editShiftData = location.state?.ShiftData as ShiftMasterData;

    // Stores pagination, filters, and sorting state of Shift List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editShiftData) return <div>No Shift Data Found</div>;

    //#region DELETE SHIFT MASTER
    const handleDeleteShiftMaster = async () => {

        setIsConfirmationDialogBoxOpen(false);

        if (!deleteShiftMasterDetailsData) return;

        await runApiWithLoader(

            setIsLoading,

            setIsLoadingMessage,
            async () => {
                const params: DeleteShiftMasterRequest = {

                    ShiftManagementMasterId: deleteShiftMasterDetailsData.ShiftManagementMasterId || 0,

                    UniqueKey: deleteShiftMasterDetailsData.Uniquekey || ""
                };

                const response = await ShiftMasterService.apiCallDeleteShiftMaster(params);

                if (E.isRight(response)) {

                    addToast({ type: "success", title: response.right.SuccessMessage[0] });

                    navigate("/ShiftMaster",
                        {
                            state: {listState}
                        });
                } else {
                    addToast({ type: "error", title: response.left.message });
                }

                return response;
            },
            undefined,
            (error: any) => addToast({ type: "error", title: error.message }),
            undefined,
            "Deleting Shift  Master Data"
        );
    };

    //#region ADD SHIFT MASTER
    const handleEditShiftMaster = (row: ShiftMasterData) => {
        if (!row?.ShiftManagementMasterId) return;
        navigate(`/shiftMaster/add/${row.ShiftManagementMasterId}`, {
            state: {
                editShiftData: row,
                fromList: true,
                listState: listState ?? { page: 1, filters: {}, sortInfo: undefined, searchTerm: '' }
            }
        });
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListShiftMaster = () => {
        navigate('/ShiftMaster', {
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
                                {editShiftData.ShiftName}
                                <span className="inline-block ml-2 text-green-500">●</span>
                            </h3>

                            <div className="mt-2 flex justify-center gap-2">
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-700">
                                    {editShiftData.ShiftCode}
                                </span>

                            </div>
                        </div>

                        {/* Shift Duration*/}
                        <div className="mt-2 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded">
                                <h4 className="font-semibold text-sm text-gray-800">Shift Duration</h4>
                            </div>
                            <div className="p-4">
                                <FieldItem label="Shift Begin Time" value={editShiftData.ShiftBeginTime} isRow />
                                <FieldItem label="Shift End Time" value={editShiftData.ShiftEndTime} isRow />
                                <FieldItem label="Shift Duration " value={editShiftData.ShiftDurationTime} isRow />
                                <FieldItem label="Shift Work Duration" value={editShiftData.ShiftWorkDurationTime} isRow />
                                <FieldItem label="First Half Up To" value={editShiftData.FirstHalfUpTo} isRow />
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
                                    handleEditShiftMaster(editShiftData!);
                                }}
                            >
                            </Button>

                            <Button
                                color="gray"
                                variant="solid"
                                size="sm"
                                colorMode="light"
                                onClick={() => {
                                    setDeleteShiftMasterDetailsData(editShiftData);
                                    setIsConfirmationDialogBoxOpen(true);
                                }}
                            >
                            </Button>

                            <Button
                                color="transparent"
                                variant="transparent_border"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleBackToListShiftMaster();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Half Day And Absence Rules */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Half Day And Absence Rules</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="HalfDay Out Time Before" value={editShiftData.HalfDayOutTimeBefore} isRow />
                                <FieldItem label="HalfDay In Time After" value={editShiftData.HalfDayInTimeAfter} isRow />
                                <FieldItem label="Half Day Working Hours" value={editShiftData.HalfDayWorkingHours} isRow />
                                <FieldItem label="Absent Working Hours" value={editShiftData.AbsentWorkingHours} isRow />
                            </div>
                        </div>

                    </div>
                </div>

                {/*  RIGHT SIDE  */}

                <div className="col-span-7">
                    <div className="bg-white rounded-lg border border-gray-300 shadow-sm p-4 h-full">

                        {/* Break Details */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Break Details</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Break Begin Time" value={editShiftData.BreakBeginTime} isRow />
                                <FieldItem label="Break End Time" value={editShiftData.BreakEndTime} isRow />
                                <FieldItem label="Break Duration Time" value={editShiftData.BreakDurationTime} isRow />
                                <FieldItem label="Grace Time" value={editShiftData.GraceTime} isRow />
                            </div>
                        </div>

                        {/* Audit Trail */}
                        <div className="mt-6 rounded border border-gray-300 bg-white ">
                            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 rounded-t-lg">
                                <h4 className="font-semibold text-sm text-gray-800">Audit Trail</h4>
                            </div>

                            <div className="p-4">
                                <FieldItem label="Created By" value={editShiftData.CreatedBy} isRow />
                                <FieldItem label="Created Date" value={editShiftData.CreatedDate ? formatDate_dd_MonthName_yy(editShiftData.CreatedDate) : ""} isRow />
                                <FieldItem label="Modified By" value={editShiftData.ModifiedBy} isRow />
                                <FieldItem label="Modified Date" value={editShiftData.ModifiedDate ? formatDate_dd_MonthName_yy(editShiftData.ModifiedDate) : ""} isRow />

                            </div>
                        </div>

                    </div>
                </div>

                {/* DELETE CONFIRMATION  SHIFT MODAL */}
                <ConfirmationDialogBox
                    isOpen={isConfirmationDialogBoxOpen}
                    onClose={() => setIsConfirmationDialogBoxOpen(false)}
                    onConfirm={handleDeleteShiftMaster}
                    title="You are about to delete this Shift?"
                    message="Deleting this Shift will permanently remove its data."
                    confirmText="Delete"
                    cancelText="Cancel"
                    loading={isLoading}
                    variant="danger"
                />

            </div>
        </div>
    );
};

export default ViewShiftMaster;
