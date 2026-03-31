import React, { useEffect, useState } from "react";
import * as E from "fp-ts/Either";
import { modulesWorkflowApprovalService } from "@/features/modulesWorkflowApproval/services/ModulesWorkflowApprovalService";
import type {
    ModulesApprovalStatusData,
    ModulesApprovalStatusRequest
} from "@/features/modulesWorkflowApproval/models/ModulesWorkflowApprovalModel";
import { Modal } from "@/ui/components/Modal/Modal";
import { Loader } from "@/core/utils/loader";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { getStatusColor } from "../utils/Status";
import { formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    request: ModulesApprovalStatusRequest | null;
    title?: string
    titleText?: string;
    subTitleText?: string;
    subSubTitleText?: string;
}

export const ApprovalLogModal: React.FC<Props> = ({
    isOpen,
    onClose,
    request,
    title,
    titleText,
    subTitleText,
    subSubTitleText,
}) => {

    const [data, setData] = useState<ModulesApprovalStatusData[]>([]);
    const [loading, setLoading] = useState(false);

    const modalTitle = (<span className="font-semibold"> {title}{" Log History "}
        {titleText && (
            <span className="text-gray-500 font-medium">
                {" : "}
                {titleText}
                {subTitleText && <> {" > "} {subTitleText}</>}
                {subSubTitleText && <> {" > "} {subSubTitleText}</>}
            </span>
        )}
    </span>
    );

    const loadApprovalLog = async () => {

        if (!request) return;

        setLoading(true);

        const response =
            await modulesWorkflowApprovalService.apiCallPullModuleApprovalStatus(
                request
            );

        if (E.isRight(response)) {
            setData(response.right.Data ?? []);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (isOpen && request) {
            loadApprovalLog();
        }
    }, [isOpen, request]);

    useEffect(() => {
        if (!isOpen) {
            setData([]);
        }
    }, [isOpen]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={modalTitle}
            size="xxl"
            cancelText="Close"
            onCancel={onClose}
        >
            <Loader loading={loading} title="Loading Approval Log">

                <div className="space-y-5">


                    {!loading && data.length === 0 && (
                        <div className="text-center text-sm text-gray-500 py-6">
                            <NoDataView message="No Approval Log History Found" />
                        </div>
                    )}
                    {data.map((item, index) => (

                        <div key={index} className="grid grid-cols-[24px_1fr] gap-3" >

                            <div className="flex flex-col items-center">

                                <div className="h-4 w-4 rounded-full bg-blue-600"></div>

                                {index !== data.length - 1 && (
                                    <div className="w-[3px] bg-blue-600 flex-1"></div>
                                )}

                            </div>

                            <div>

                                <div className="flex justify-between items-start gap-2">

                                    <span className="font-semibold text-gray-900">

                                        {item.FullName}

                                        <span className="text-gray-500 font-normal ml-2">
                                            ({item.Designation} | {item.Department})
                                        </span>

                                    </span>

                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatDate_dd_MonthName_yy_hh_mm(item.Date ?? '-')}
                                    </span>

                                </div>

                                <div className="mt-1">

                                    <span className={`px-2 py-1 text-xs font-semibold  ${getStatusColor(item?.ApprovalStatus ?? "")}`}>
                                        {item.ApprovalStatus}
                                    </span>

                                </div>


                                {item.Remarks && (
                                    <p className="mt-2 text-sm text-gray-700 break-all">
                                        {item.Remarks}
                                    </p>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </Loader>
        </Modal>
    );
};