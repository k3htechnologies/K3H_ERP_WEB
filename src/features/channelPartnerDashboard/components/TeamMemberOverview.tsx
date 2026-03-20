import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMemo } from "react";

interface Props {
    TeamMemberOverviewData: any[];
}

const TeamMemberOverview: React.FC<Props> = ({ TeamMemberOverviewData }) => {

    const TeamMemberOverviewColumns = useMemo<any[]>(
        () => [
            {
                key: "Date",
                label: "Date",
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
            {
                key: "Name",
                label: "CP Name",
                align: "left",
                render: (value: string) => (
                    <span className="text-blue-600 cursor-pointer hover:underline">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "SystemGeneratedCode",
                label: "CP Code",
                align: "left",
                render: (value: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            {
                key: "FirmType",
                label: "Type",
                align: "center",
                render: (value: string) => (
                    <TooltipText
                        text={value || '-'}
                        maxWidth="250px"
                        tooltipThreshold={25}
                    />
                )
            },
            {
                key: "CompanyName",
                label: "Company",
                align: "center",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
        ], []
    );

    //#region
    return (
        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">Team Member Overview</h2>
            <div className="bg-white rounded-lg shadow-sm space-y-4 p-4 h-[300px] ">
                <DataTableWithOutBorder
                    columns={TeamMemberOverviewColumns}
                    data={TeamMemberOverviewData}
                    emptyMessage="No Team Member Overview Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div>
        </div>
    )
}
export default TeamMemberOverview;