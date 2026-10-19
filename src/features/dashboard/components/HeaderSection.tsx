import { LocalStorageHelper } from "@/core/utils/localStorageHelper"
import { Button } from "@/ui/components/forms";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

interface HeaderSectionProps {
    approvalCount?: number;
}

export const HeaderSection = ({ approvalCount = 0 }: HeaderSectionProps) => {

    const navigate = useNavigate();

    const handleDashboardModuleApprovalModal = useCallback(() => {
        navigate('/dashboard/view',)
    }, [navigate]);

    return (
        <div className="bg-white rounded-xl p-3 mb-5 shadow-sm">
            <div className="flex justify-between items-center">
                {/* Left Side */}
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">
                        Welcome {LocalStorageHelper.getStoredEmployeeData()?.FullName},
                    </h1>

                    <p className="text-sm font-normal pt-2 text-gray-500">
                        Here is your Comprehensive Daily Overview
                    </p>
                </div>

                {/* Right Side */}
                <div className="p-4">
                    <Button
                        onClick={handleDashboardModuleApprovalModal}
                        color="blue"
                        size="sm"
                        variant="solid"
                        defineWidth
                        style={{ width: '180px', height: '42px' }}
                    >
                        <span className="flex w-full items-center justify-center gap-2">
                            <span className="whitespace-nowrap">
                                My Approvals
                            </span>

                            {approvalCount > 0 && (
                                <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-blue-600 text-base font-bold">
                                    {approvalCount > 99 ? '99+' : approvalCount}
                                </span>
                            )}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );

}