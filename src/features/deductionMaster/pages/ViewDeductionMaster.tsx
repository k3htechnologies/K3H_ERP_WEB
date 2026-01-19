import { useNavigate } from "react-router-dom";
import { useDeductionMasterListState } from "@/features/deductionMaster/context/DeductionMasterListStateContext";
import { useEffect, useState } from "react";
import { FieldItem } from "@/ui/components/forms/FieldItem";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { DeductionMasterData, FilterWithPaginationDeductionMasterRequest } from "@/features/deductionMaster/models/DeductionMasterModel";
import { useMenuPermissions } from "@/features/menu/hooks/useMenuPermissions";
import HeaderActionBar from "@/ui/components/forms/HeaderActionBar";
import * as E from 'fp-ts/Either';
import useToast from "@/core/hooks/useToast";
import { Loader } from "@/core/utils/loader";
import { runApiWithLoader } from "@/core/utils";
import { DeductionMasterService } from "@/features/deductionMaster/services/DeductionMasterService";

const ViewDeductionMaster: React.FC = () => {

    //#region  LOADING STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setIsLoadingMessage] = useState('');

    // NAVIGATION
    const navigate = useNavigate();

    const { listState } = useDeductionMasterListState();
    const deductionName = listState.deductionName;

    const { addToast } = useToast();

    const { canAction } = useMenuPermissions('/deductionMaster');

    const [editDeductionMasterData, setEditDeductionMasterData] = useState<DeductionMasterData | null>(null);

    useEffect(() => {
        if (listState.deductionMasterId) {
            loadDeductionMasterData();
        }
    }, [listState.deductionMasterId]);

    const loadDeductionMasterData = async () => {
        await runApiWithLoader(
            setIsLoading,
            setIsLoadingMessage,
            async () => {

                const params: FilterWithPaginationDeductionMasterRequest = {
                    PageNumber: 1,
                    PageSize: 1,
                    DeductionMasterId: listState.deductionMasterId
                };

                const response = await DeductionMasterService.apiCallPullDeductionMaster(params);

                if (E.isRight(response)) {

                    setEditDeductionMasterData(response.right.Data[0]);

                } else {

                    addToast({ type: 'error', title: response.left.message });
                }
            },

            undefined,
            (error: any) => {
                addToast({ type: 'error', title: error.message });
            },

            undefined,

            'Loading Deduction Data'
        );
    };
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
            <Loader loading={isLoading} title={loadingMessage} > <div></div> </Loader>
            <HeaderActionBar
                titleText={'Deduction Master : '}
                subTitleText={deductionName}
                cancelText="Cancel"
                EditText="Edit"
                onCancel={() => handleBackToListDeductionMaster()}
                canAction={canAction}
                onEdit={() => {

                    if (editDeductionMasterData!) handleEditDeductionMaster(editDeductionMasterData!!);

                }}
                isLoading={isLoading}
            />
            {editDeductionMasterData && (
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
                                        <FieldItem label="Name" value={editDeductionMasterData!.Name} />

                                        <FieldItem label="Type" value={editDeductionMasterData!.Type} />
                                        <FieldItem label="Gender" value={editDeductionMasterData!.Gender} />

                                    </div>
                                </div>
                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                                        <FieldItem label="Branch Name" value={editDeductionMasterData!.BranchName} />
                                        <FieldItem label="State Name" value={editDeductionMasterData!.StateName} />

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
                                        <FieldItem label="Applicable" value={editDeductionMasterData!.Applicable} />
                                        <FieldItem label="Value" value={editDeductionMasterData!.Value} />

                                        <FieldItem label="Min Salary (₹)" value={editDeductionMasterData!.MinSalary} />
                                        <FieldItem label="Max Salary (₹)" value={editDeductionMasterData!.MaxSalary} />
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
                                        <FieldItem label="Created By" value={editDeductionMasterData!.CreatedBy} />
                                        <FieldItem
                                            label="Created Date"
                                            value={
                                                editDeductionMasterData!.CreatedDate
                                                    ? formatDate_dd_MonthName_yy(editDeductionMasterData!.CreatedDate)
                                                    : "-"
                                            }

                                        />
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        <FieldItem label="Modified By" value={editDeductionMasterData!.ModifiedBy} />
                                        <FieldItem
                                            label="Modified Date"
                                            value={
                                                editDeductionMasterData!.ModifiedDate
                                                    ? formatDate_dd_MonthName_yy(editDeductionMasterData!.ModifiedDate)
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
export default ViewDeductionMaster;
