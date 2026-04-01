import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useMemo } from "react";
import type { Table4 } from "@/features/litigationDashboard/models/litigationDashboardModel";
import { getLitigationStatuscolor } from "@/features/litigation/pages/Status";
import TooltipText from "@/ui/components/Tooltip/TooltipText";

interface Props {
    activeCaseData: Table4[];
}

const ActiveCases: React.FC<Props> = ({ activeCaseData }) => {
    const activeCaseColumns = useMemo<any[]>(
        () => [
            {
                key: "Title",
                label: "Case Title",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: "CaseNumber",
                label: "Case Number",
                align: "left",
                render: (value?: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="180px"
                        tooltipThreshold={18}
                    />
                )
            },
            {
                key: "CaseType",
                label: "Case Type",
                align: "left",
                render: (value: any) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "HearingDate",
                label: "Hearing Date",
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
            {
                key: "Status",
                label: "Status",
                width: "14",
                sortable: false,
                align: "center",
                render: (value?: string) => {
                    const { bg, text } = getLitigationStatuscolor(value);

                    return (
                        <span
                            className="inline-block px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                            style={{
                                backgroundColor: bg,
                                color: text,
                            }}
                        >
                            {value || "-"}
                        </span>
                    );
                },
            },
        ], []
    );

    return (
        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">Active Cases</h2>
            <div className="bg-white rounded-lg p-4 space-y-4 h-[280px] border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <DataTableWithOutBorder
                    columns={activeCaseColumns}
                    data={activeCaseData}
                    emptyMessage="No Active Cases Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div>
        </div>
    )
}
export default ActiveCases;