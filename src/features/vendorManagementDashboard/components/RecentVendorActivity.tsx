import { useMemo } from "react";
import type { Table3 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";
import { getNameInitials } from "@/core/utils/getNameInitials";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { getVendorStatusBadge } from "@/features/vendorManagementDashboard/utils/getVendorStatusBadge";

interface Props {
    recentVendorActivity: Table3[];
}

export default function RecentVendorActivity({ recentVendorActivity = [] }: Props) {

    const columns = useMemo(
        () => [
            {
                label: 'Vendor Name',
                key: 'VendorName',
                align: 'left' as const,
                render: (value: string) => (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
                            {(getNameInitials(value))}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-black">{(value)}</span>
                        </div>
                    </div>
                )
            },
            {
                key: 'CompanyName',
                label: 'Company Name',
                align: 'left' as const,
                render: (value: string) => (
                    <span className="font-medium  text-sm">{value || '-'}</span>
                )
            },
            {
                key: 'Activity',
                label: 'Activity',
                align: 'left' as const,
                render: (value: string) => (
                    <span className="font-medium text-black text-sm">{value || '-'}</span>
                )
            },
            {
                key: 'Status',
                label: 'Status',
                align: 'left' as const,
                render: (value: string) => (
                    <span className="font-medium text-black text-sm">{getVendorStatusBadge(value || '-')}</span>
                )
            },
            {
                key: 'ActivityDate',
                label: 'Activity Date',
                align: 'left' as const,
                render: (value: string) => (
                    <span className="font-medium text-black text-sm">{formatDate_dd_MonthName_yy(value) || '-'}</span>
                )
            },
        ], []
    )

    return (
        <div className="space-y-3 pt-5">
            <div
                className="bg-white rounded-lg p-4 h-[300px] border border-gray-100 flex flex-col"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <h2 className="text-base font-semibold text-slate-500 mb-4 mt-2 shrink-0">
                    Recent Vendor Activity
                </h2>

                <div className="flex-1 min-h-0">
                    <DataTableWithOutBorder
                        columns={columns}
                        data={recentVendorActivity || []}
                        emptyMessage="No Data Available"
                        fixedHeight={true}
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    )
}