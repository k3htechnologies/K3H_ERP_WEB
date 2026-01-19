import { useNavigate } from "react-router-dom";
import { useShiftMasterListState } from "@/features/shiftMaster/context/ShiftMasterListStateContext";

import { useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { ShiftMasterData } from "@/features/shiftMaster/models/ShiftMasterModel";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const ViewShiftMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading] = useState(false);

    // NAVIGATION
    const navigate = useNavigate();
    const { listState } = useShiftMasterListState();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/shiftMaster');
    //#endregion

    // Will be loaded from API if needed
    const [editShiftData, setEditShiftData] = useState<ShiftMasterData | null>(null);

    // MESSAGE IF DATA NOT FOUND
    if (!editShiftData) return <div>No Shift Data Found</div>;

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
            <HeaderActionBar
                titleText={'Shift Master : '}
                subTitleText={editShiftData.ShiftName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListShiftMaster()}
                canAction={canAction}
                onEdit={() => {
                    if (editShiftData) handleEditShiftMaster(editShiftData!);
                }}
                isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                {/* ================= LEFT SIDE (2/3) ================= */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Shift Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Shift Begin Time" value={editShiftData.ShiftName} />
                                    <FieldItem label="Shift End Time" value={editShiftData.ShiftCode} />

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
                                    <FieldItem label="Shift Begin Time" value={editShiftData.ShiftBeginTime} />
                                    <FieldItem label="Shift End Time" value={editShiftData.ShiftEndTime} />
                                    <FieldItem label="Shift Duration Time" value={editShiftData.ShiftDurationTime} />

                                </div>
                            </div>
                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Shift Work Duration Time" value={editShiftData.ShiftWorkDurationTime} />
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

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Break Begin Time" value={editShiftData.BreakBeginTime} />
                                    <FieldItem label="Break End Time" value={editShiftData.BreakEndTime} />
                                    <FieldItem label="Break Duration Time" value={editShiftData.BreakDurationTime} />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Grace Time" value={editShiftData.GraceTime} />

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

                                    <FieldItem label="First Half Up To" value={editShiftData.FirstHalfUpTo} />
                                </div>
                            </div>
                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                    <FieldItem label="Calculate Absent if working hours less than" value={editShiftData.AbsentWorkingHours} />
                                    <FieldItem label="Calculate Half day working hours less than" value={editShiftData.HalfDayWorkingHours} />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">

                                    <FieldItem label="Mark Half Day if Intime After" value={editShiftData.HalfDayInTimeAfter} />
                                    <FieldItem label="Mark Half Day if Outtime After" value={editShiftData.HalfDayOutTimeBefore} />

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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Grace Time In Minutes" value={editShiftData.GraceTime} />
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
                                    <FieldItem label="Remarks" value={editShiftData.Remarks} />

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
                                    <FieldItem label="Created By" value={editShiftData.CreatedBy} />
                                    <FieldItem
                                        label="Created Date"
                                        value={
                                            editShiftData.CreatedDate
                                                ? formatDate_dd_MonthName_yy(editShiftData.CreatedDate)
                                                : "-"
                                        }

                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Modified By" value={editShiftData.ModifiedBy} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={
                                            editShiftData.ModifiedDate
                                                ? formatDate_dd_MonthName_yy(editShiftData.ModifiedDate)
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


export default ViewShiftMaster;
