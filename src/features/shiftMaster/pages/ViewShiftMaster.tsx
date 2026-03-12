import { useNavigate } from "react-router-dom";
import { useShiftMasterListState } from "@/features/shiftMaster/context/ShiftMasterListStateContext";

import { useEffect, useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { FilterWithPaginationShiftMasterRequest, ShiftMasterData } from "@/features/shiftMaster/models/ShiftMasterModel";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import useToast from "@/core/hooks/useToast";
import { runApiWithLoader } from "@/core/utils";
import * as E from 'fp-ts/Either';
import { shiftMasterService } from "@/features/shiftMaster/services/ShiftMasterService";
import { Loader } from "@/core/utils/loader";

const ViewShiftMaster: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { listState } = useShiftMasterListState();
    const shiftName = listState.shiftName;
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions('/shiftMaster');
    const [editShiftMasterData, setEditShiftMasterData] = useState<ShiftMasterData | null>(null);

    useEffect(() => {
        if (listState.shiftMasterId) {
            loadShiftMasterData();
        }
    }, [listState.shiftMasterId]);

    const loadShiftMasterData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setLoadingMessage,
            async () => {

                const params: FilterWithPaginationShiftMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    ShiftManagementMasterId: listState.shiftMasterId
                };

                const response = await shiftMasterService.apiCallPullShiftMaster(params);

                if (E.isRight(response)) {

                    setEditShiftMasterData(response.right.Data[0]);

                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
            },

            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },

            undefined,

            'Loading Shift Data'
        );
    };

    //#region ADD SHIFT MASTER
    const handleEditShiftMaster = (row: ShiftMasterData) => {
        if (!row?.ShiftManagementMasterId) return;
        navigate(`/shiftMaster/add/${row.ShiftManagementMasterId}`);
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListShiftMaster = () => {
        navigate('/shiftMaster');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <HeaderActionBar
                titleText={'Shift Master : '}
                subTitleText={shiftName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListShiftMaster()}
                canAction={canAction}
                onEdit={() => {
                    if (editShiftMasterData!) handleEditShiftMaster(editShiftMasterData!!);
                }}
                isLoading={isLoading}
            />
            
            {editShiftMasterData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                    {/* ================= LEFT SIDE (2/3) ================= */}
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Shift Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Shift Name" value={editShiftMasterData!.ShiftName} />
                                        <FieldItem label="Shift Code" value={editShiftMasterData!.ShiftCode} />

                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* ================= SHIFT DURATION ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Time Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Shift Begin Time" value={editShiftMasterData!.ShiftBeginTime} />
                                        <FieldItem label="Shift End Time" value={editShiftMasterData!.ShiftEndTime} />
                                        <FieldItem label="Shift Duration Time" value={editShiftMasterData!.ShiftDurationTime} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Shift Work Duration Time" value={editShiftMasterData!.ShiftWorkDurationTime} />
                                    </div>
                                </div>
                            </div>
                        </section>
                        {/* ================= BREAK DETAILS ================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Break Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Break Begin Time" value={editShiftMasterData!.BreakBeginTime} />
                                        <FieldItem label="Break End Time" value={editShiftMasterData!.BreakEndTime} />
                                        <FieldItem label="Break Duration Time" value={editShiftMasterData!.BreakDurationTime} />
                                    </div>
                                </div>

                            </div>
                        </section>
                        {/* ================= HALF DAY AND ABSENCE RULES================= */}
                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Advance Setting
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="First Half Up To" value={editShiftMasterData!.FirstHalfUpTo} />
                                    </div>
                                </div>
                                <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="Mark Absent If Working Hour less than" value={editShiftMasterData!.AbsentWorkingHours} />
                                        <FieldItem label="Mark Half Day If Working Hour Less than" value={editShiftMasterData!.HalfDayWorkingHours} />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                        <FieldItem label="Mark Half Day if Intime After" value={editShiftMasterData!.HalfDayInTimeAfter} />
                                        <FieldItem label="Mark Half Day if Outtime Before" value={editShiftMasterData!.HalfDayOutTimeBefore} />

                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Time Allowed for Late Entry Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Grace Time In Minutes" value={editShiftMasterData!.GraceTime} />
                                         <FieldItem label="Late Arrival Action" value={editShiftMasterData!.LateArrivalAction} />
                                          <FieldItem label="Late Arrival Count" value={editShiftMasterData!.LateCount} />

                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                                Remarks
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                                <div className="lg:col-span-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
                                        <FieldItem label="Remarks" value={editShiftMasterData!.Remarks} />

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
                                        <FieldItem label="Created By" value={editShiftMasterData!.CreatedBy} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                editShiftMasterData!.CreatedDate
                                                    ? formatDate_dd_MonthName_yy(editShiftMasterData!.CreatedDate)
                                                    : "-"
                                            }

                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={editShiftMasterData!.ModifiedBy} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={
                                                editShiftMasterData!.ModifiedDate
                                                    ? formatDate_dd_MonthName_yy(editShiftMasterData!.ModifiedDate)
                                                    : "-"
                                            }

                                        />
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


export default ViewShiftMaster;
