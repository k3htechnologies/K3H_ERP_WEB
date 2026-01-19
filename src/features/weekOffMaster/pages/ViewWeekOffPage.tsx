import { useNavigate } from "react-router-dom";
import { useWeekOffMasterListState } from "@/features/weekOffMaster/context/WeekOffMasterListStateContext";
import { useEffect, useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import type { FilterWithPaginationWeekOffMasterRequest, WeekOffMasterData } from "@/features/weekOffMaster/models/WeekOffMasterModel";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { weekOffMasterService } from "@/features/weekOffMaster/services/WeekOffMasterService";
import * as E from 'fp-ts/Either';
import { runApiWithLoader } from "@/core/utils";

const ViewWeekOffMaster: React.FC = () => {

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');
    const navigate = useNavigate();
    const { listState } = useWeekOffMasterListState();
    const weekOffName = listState.weekOffName;
    const { addToast } = useToast();
    const { canAction } = useMenuPermissions('/WeekOffMaster');

    const [editWeekOffPolicyMasterData, setEditWeekOffPolicyMasterData] = useState<WeekOffMasterData | null>(null);

    useEffect(() => {
        if (listState.weekOffMasterId) {
            loadWeekOff();
        }
    }, [listState.weekOffMasterId]);

    const loadWeekOff = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationWeekOffMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    WeekOffPolicyMasterId: listState.weekOffMasterId
                };

                const response = await weekOffMasterService.apiCallPullWeekOffMaster(params);

                if (E.isRight(response)) {

                    setEditWeekOffPolicyMasterData(response.right.Data[0]);

                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
            },

            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },

            undefined,

            'Loading Weekoff Policy Data'
        );
    };


    const handleEditWeekOffMaster = (row: WeekOffMasterData) => {
        if (!row?.WeekOffPolicyMasterId) return;
        navigate(`/WeekOffMaster/add/${row.WeekOffPolicyMasterId}`);
    };

    const handleBackToListWeekOffMaster = () => {
        navigate('/weekOffMaster');
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-300 p-6">

            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>

            <HeaderActionBar
                titleText={'Week Off Master : '}
                subTitleText={weekOffName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListWeekOffMaster()}
                canAction={canAction}
                onEdit={() => {
                    if (editWeekOffPolicyMasterData!) handleEditWeekOffMaster(editWeekOffPolicyMasterData!!);
                }}
                isLoading={isLoading}
            />
            {editWeekOffPolicyMasterData && (
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
                                        <FieldItem label="Week Off Policy Name" value={editWeekOffPolicyMasterData!.WeekOffPolicyName} />
                                        <FieldItem label="Week Off Policy Code" value={editWeekOffPolicyMasterData!.WeekOffPolicyCode} />
                                        <FieldItem label="Week Days" value={editWeekOffPolicyMasterData!.WeekDays} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Week Days Starts On" value={editWeekOffPolicyMasterData!.WeekDaysStartsOn} />
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
                                        <FieldItem label="Weekly Off" value={editWeekOffPolicyMasterData!.WeeklyOff} />
                                        <FieldItem label="Weekly Off2" value={editWeekOffPolicyMasterData!.WeeklyOff2} />
                                        <FieldItem label="Weekly Off2 Type" value={editWeekOffPolicyMasterData!.WeeklyOff2Type} />

                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FieldItem label="Not Applicable For Months" value={editWeekOffPolicyMasterData!.NotApplicableForMonths} />

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
                                        <FieldItem label="Created By" value={editWeekOffPolicyMasterData!.CreatedBy} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                editWeekOffPolicyMasterData!.CreatedDate
                                                    ? formatDate_dd_MonthName_yy(editWeekOffPolicyMasterData!.CreatedDate)
                                                    : "-"
                                            }

                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={editWeekOffPolicyMasterData!.ModifiedBy} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={
                                                editWeekOffPolicyMasterData!.ModifiedDate
                                                    ? formatDate_dd_MonthName_yy(editWeekOffPolicyMasterData!.ModifiedDate)
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


export default ViewWeekOffMaster;
