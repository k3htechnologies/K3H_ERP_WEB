import { CheckCircle, XCircle, History } from "lucide-react";
import { getStatusColor } from "../utils/Status";


interface ApprovalActionsProps {
    showApproval?: boolean;
    isIcons?: boolean;
    displayText?: string;
    approvalStatus?: string;
    disableApprove?: boolean;
    onHistory?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
}

const ApprovalActions = ({
    showApproval = false,
    isIcons = false,
    displayText = "",
    approvalStatus = "Pending",
    disableApprove = false,
    onHistory,
    onApprove,
    onReject,
}: ApprovalActionsProps) => {
    return (
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-fit">

            {/* HISTORY - Always visible */}
            {!displayText && (
                <span className={`px-2 py-1 text-xs font-semibold  ${getStatusColor(
                    approvalStatus
                )}`}
                >
                    {approvalStatus}
                </span>
            )}

            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onHistory?.();
                }}
                className={`px-3 py-1 text-sm text-blue-600 hover:bg-gray-100 ${showApproval ? "border-r" : ""
                    }`}
            >
                {isIcons ? <History size={16} /> : "History"}

            </button>

            {/* APPROVE + REJECT only if approval required */}
            {showApproval && (
                <>
                    <button
                        onClick={(e) => {
                            if (disableApprove) return;
                            e.preventDefault();
                            e.stopPropagation();
                            onApprove?.();
                        }}
                        disabled={disableApprove}
                        title={disableApprove ? "Already approved for this version" : "Approve"}
                        className={`px-3 py-1 text-sm border-r ${disableApprove
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-green-600 hover:bg-gray-100"
                            }`}
                    >
                        {isIcons ? <CheckCircle size={16} /> : "Approve"}
                    </button>

                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onReject?.();
                        }}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-gray-100"
                    >
                        {isIcons ? <XCircle size={16} /> : "Reject"}
                    </button>
                </>
            )}
        </div>
    );
};

export default ApprovalActions;