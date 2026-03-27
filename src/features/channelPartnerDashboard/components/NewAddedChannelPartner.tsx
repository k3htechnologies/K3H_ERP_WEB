import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMemo } from "react";
import type { Table4 } from "@/features/channelPartnerDashboard/models/ChannelPartnerDashboardModel";

interface Props {
    NewAddedChannelPartnerData: Table4[];
}

const NewAddedChannelPartner: React.FC<Props> = ({ NewAddedChannelPartnerData }) => {

    const NewAddedChannelPartnerColumns = useMemo<any[]>(
        () => [
            {
                key: "Name",
                label: "CP Name",
                align: "left",
                render: (value?: string) => value || ''
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
                key: "Type",
                label: "Type",
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
                key: "CompanyName",
                label: "Company",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "CreatedDate",
                label: "Date",
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
        ], []
    );
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">Recently Added Channel Partner <span className="text-sm">
                (Last 7 Days)</span></h2>

            <div className="bg-white rounded-lg shadow-sm space-y-4 p-4 h-[300px] ">

                <DataTableWithOutBorder
                    columns={NewAddedChannelPartnerColumns}
                    data={NewAddedChannelPartnerData}
                    emptyMessage="No New Added Channel Partner Found"
                    fixedHeight={true}
                    className="flex-1"
                />
            </div>
        </div>
    )
}
export default NewAddedChannelPartner;