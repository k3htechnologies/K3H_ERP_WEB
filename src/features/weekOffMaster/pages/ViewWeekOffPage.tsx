import { useNavigate } from "react-router-dom";
import { useWeekOffMasterListState } from "@/features/weekOffMaster/context/WeekOffMasterListStateContext";
import { useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { WeekOffMasterData } from "../models/WeekOffMasterModel";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";

const ViewWeekOffMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading] = useState(false);

    // NAVIGATION
    const navigate = useNavigate();
    const { listState } = useWeekOffMasterListState();

    //#region MENU PERMISSIONS
    const { canAction } = useMenuPermissions('/WeekOffMaster');
    //#endregion

    // Will be loaded from API if needed
    const [editWeekOffPolicyData, setEditWeekOffPolicyData] = useState<WeekOffMasterData | null>(null);

    // MESSAGE IF DATA NOT FOUND
    if (!editWeekOffPolicyData) return <div>No Week Off Data Found</div>;


    //#region EDIT WEEK OFF MASTER
    const handleEditWeekOffMaster = (row: WeekOffMasterData) => {
        if (!row?.WeekOffPolicyMasterId) return;
        navigate(`/WeekOffMaster/add/${row.WeekOffPolicyMasterId}`);
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListWeekOffMaster = () => {
        navigate('/weekOffMaster');
    };
    //#endregion
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <HeaderActionBar
                titleText={'Week Off Master : '}
                subTitleText={editWeekOffPolicyData.WeekOffPolicyName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListWeekOffMaster()}
                canAction={canAction}
                onEdit={() => {
                    if (editWeekOffPolicyData) handleEditWeekOffMaster(editWeekOffPolicyData!);
                }}
                isLoading={isLoading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                {/* ================= LEFT SIDE (2/3) ================= */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ================= BASIC DETAILS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            WeekOff Policy Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Week Off Policy Name" value={editWeekOffPolicyData.WeekOffPolicyName} />
                                    <FieldItem label="Week Off Policy Code" value={editWeekOffPolicyData.WeekOffPolicyCode} />
                                    <FieldItem label="Week Days" value={editWeekOffPolicyData.WeekDays} />

                                </div>
                            </div>
                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Week Days Starts On" value={editWeekOffPolicyData.WeekDaysStartsOn} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================= WEEK OFF DETAILS ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Week Off Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Weekly Off" value={editWeekOffPolicyData.WeeklyOff} />
                                    <FieldItem label="Weekly Off2" value={editWeekOffPolicyData.WeeklyOff2} />
                                    <FieldItem label="Weekly Off2 Type" value={editWeekOffPolicyData.WeeklyOff2Type} />

                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Not Applicable For Months" value={editWeekOffPolicyData.NotApplicableForMonths} />

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
                                    <FieldItem label="Created By" value={editWeekOffPolicyData.CreatedBy} />
                                    <FieldItem
                                        label="Created Date"
                                        value={
                                            editWeekOffPolicyData.CreatedDate
                                                ? formatDate_dd_MonthName_yy(editWeekOffPolicyData.CreatedDate)
                                                : "-"
                                        }

                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Modified By" value={editWeekOffPolicyData.ModifiedBy} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={
                                            editWeekOffPolicyData.ModifiedDate
                                                ? formatDate_dd_MonthName_yy(editWeekOffPolicyData.ModifiedDate)
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


export default ViewWeekOffMaster;
