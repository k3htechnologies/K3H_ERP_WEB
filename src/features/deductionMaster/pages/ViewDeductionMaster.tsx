import { useNavigate } from "react-router-dom";
import { useDeductionMasterListState } from "@/features/deductionMaster/context/DeductionMasterListStateContext";

import { useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { DeductionMasterData } from "../models/DeductionMasterModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";

const ViewDeductionMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading] = useState(false);

    // NAVIGATION
    const navigate = useNavigate();
    const { listState } = useDeductionMasterListState();

    const { canAction } = useMenuPermissions('/deductionMaster');

    // Will be loaded from API if needed
    const [editDeductionData, setEditDeductionData] = useState<DeductionMasterData | null>(null);

    // MESSAGE IF DATA NOT FOUND
    if (!editDeductionData) return <div>No Deduction Data Found</div>;

    //#region EDIT DEDUCTION 
    const handleEditDeductionMaster = (row: DeductionMasterData) => {
        if (!row?.DeductionMasterId) return;
        navigate(`/deductionMaster/add/${row.DeductionMasterId}`);
    };
    //#endregion

    //#region BACK PROJECT PAGE
    const handleBackToListDeductionMaster = () => {
        navigate('/deductionMaster');
    };
    //#endregion

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">
            <HeaderActionBar
                titleText={'Deduction Master : '}
                subTitleText={editDeductionData.Name}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListDeductionMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editDeductionData) handleEditDeductionMaster(editDeductionData!);

                }}
                isLoading={isLoading}
            />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">

                {/* ================= LEFT SIDE (2/3) ================= */}
                <div className="lg:col-span-2 space-y-6">

                    {/* ================= BASIC INFORMATION ================= */}
                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Basic Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 border-b border-[#135bec2e] pb-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Name" value={editDeductionData.Name} />

                                    <FieldItem label="Type" value={editDeductionData.Type} />
                                    <FieldItem label="Gender" value={editDeductionData.Gender} />

                                </div>
                            </div>
                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                    <FieldItem label="Branch Name" value={editDeductionData.BranchName} />
                                    <FieldItem label="State Name" value={editDeductionData.StateName} />

                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ================= DEDUCTION DETAILS ================= */}

                    <section className="bg-white rounded-xl shadow-sm p-6 border-[0.1px] border-[#3333334f]">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Deduction Details
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4">

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <FieldItem label="Applicable" value={editDeductionData.Applicable} />
                                    <FieldItem label="Value" value={editDeductionData.Value} />

                                    <FieldItem label="Min Salary (₹)" value={editDeductionData.MinSalary} />
                                    <FieldItem label="Max Salary (₹)" value={editDeductionData.MaxSalary} />
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
                                    <FieldItem label="Created By" value={editDeductionData.CreatedBy} />
                                    <FieldItem
                                        label="Created Date"
                                        value={
                                            editDeductionData.CreatedDate
                                                ? formatDate_dd_MonthName_yy(editDeductionData.CreatedDate)
                                                : "-"
                                        }

                                    />
                                </div>
                            </div>

                            <div className="lg:col-span-3 pt-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                    <FieldItem label="Modified By" value={editDeductionData.ModifiedBy} />
                                    <FieldItem
                                        label="Modified Date"
                                        value={
                                            editDeductionData.ModifiedDate
                                                ? formatDate_dd_MonthName_yy(editDeductionData.ModifiedDate)
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
export default ViewDeductionMaster;
