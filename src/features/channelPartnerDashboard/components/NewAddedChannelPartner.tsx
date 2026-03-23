import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useMemo } from "react";

interface Props {
    NewAddedChannelPartnerData: any[];
}

const NewAddedChannelPartner: React.FC<Props> = ({ NewAddedChannelPartnerData }) => {

    const NewAddedChannelPartnerColumns = useMemo<any[]>(
        () => [
            {
                key: "CreatedDate",
                label: "Date",
                align: "left",
                render: (value?: string) => value ? formatDate_dd_MonthName_yy(value) : '-'
            },
            {
                key: "Name",
                label: "CP Name",
                align: "left",
                render: (value :string) => value || '-'
            },
            {
                key: "SystemGeneratedCode",
                label: "CP Code",
                align: "left",
                render: (value :string) => value || '-'
            },
            {
                key: "Type",
                label: "Type",
                align: "left",
                render: (value :string) => value || '-'
            },
            {
                key: "CompanyName",
                label: "Company",
                align: "left",
                render: (value :string) => value || '-'
            },
        ], []
    );
    //#endregion

    //#region
    return (
        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">Recently Added Channel Partner (Last 7 Days)</h2>
            <div className="bg-white rounded-lg shadow-sm space-y-4 p-4 h-[200px] ">

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