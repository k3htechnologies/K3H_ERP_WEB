import { CheckCircle, XCircle, History, RotateCcw } from "lucide-react";
import { getStatusColor } from "../utils/Status";


interface ApprovalActionsProps {
    showApproval?: boolean;
    isIcons?: boolean;
    displayText?: string;
    approvalStatus?: string;
    onHistory?: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onReopen?: () => void;
}

const ApprovalActions = ({
    showApproval = false,
    isIcons = false,
    displayText = "",
    approvalStatus = "Pending",
    onHistory,
    onApprove,
    onReject,
    onReopen,
}: ApprovalActionsProps) => {
    return (
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden w-fit">

            {/* HISTORY - Always visible */}
            {!displayText && (
                <span className={`px-2 py-1 text-xs font-semibold  ${getStatusColor(approvalStatus)}`}>
                    {approvalStatus}
                </span>
            )}
            
            {onHistory && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onHistory?.();
                    }}
                    className={`px-3 py-1 text-sm text-blue-600 hover:bg-gray-100 ${showApproval ? "border-r" : ""}`}>
                    {isIcons ? <History size={16} /> : "History"}

                </button>
            )}

            {/* APPROVE + REJECT only if approval required */}
            {showApproval && (
                <>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onApprove?.();
                        }}
                        className="px-3 py-1 text-sm text-green-600 border-r hover:bg-gray-100"
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

             {/* REOPEN - Display when onReopen is provided */}
            {onReopen  && approvalStatus?.trim().toUpperCase() === "APPROVED" &&  (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onReopen();
                    }}
                    className="px-3 py-1 text-sm text-orange-600 hover:bg-gray-100"
                >
                    {isIcons ? <RotateCcw size={16} /> : "Reopen"}
                </button>
            )}
        </div>
    );
};

export default ApprovalActions;