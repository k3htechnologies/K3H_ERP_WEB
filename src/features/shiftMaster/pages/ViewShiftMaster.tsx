import { useLocation, useNavigate } from "react-router-dom";

import { useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { ShiftMasterData } from "../models/ShiftMasterModel";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";

const ViewShiftMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading] = useState(false);

    //LOCATION
    const location = useLocation();

    // NAVIGATION
    const navigate = useNavigate();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/shiftMaster');
    //#endregion

    // Selected Shift data passed from the Shift List page (via navigate state)
    const editShiftData = location.state?.ShiftData as ShiftMasterData;

    // Stores pagination, filters, and sorting state of Shift List page to restore on back navigation

    const listState = location.state?.listState;

    // MESSAGE IF DATA NOT FOUND
    if (!editShiftData) return <div>No Shift Data Found</div>;

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
            <HeaderActionBar
                titleText={'Shift Master'}
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

                    {/* ================= SHIFT DURATION ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Shift Duration
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
                                    <FieldItem label="First Half Up To" value={editShiftData.FirstHalfUpTo} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================= HALF DAY AND ABSENCE RULES================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Half Day And Absence Rules
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Half Day Out Time Before" value={editShiftData.HalfDayOutTimeBefore} />
                                    <FieldItem label="Half Day In Time After" value={editShiftData.HalfDayInTimeAfter} />
                                    <FieldItem label="Half Day Working Hours" value={editShiftData.HalfDayWorkingHours} />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Absent Working Hours" value={editShiftData.AbsentWorkingHours} />

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
