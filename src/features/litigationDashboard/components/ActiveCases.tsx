import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useMemo } from "react";

interface Props {
    activeCaseData: any[];
}

const ActiveCases: React.FC<Props> = ({ activeCaseData }) => {

    const activeCaseColumns = useMemo<any[]>(
        () => [
            {
                key: "Title",
                label: "Case Title",
                align: "left",
                render: (value: string) => (
                    <span className="text-blue-600 cursor-pointer hover:underline">
                        {(value || '')}
                    </span>
                )
            },
            {
                key: "CaseNumber",
                label: "Case Number",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
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
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
            },
        ], []
    );

    return (
        <div className="space-y-3 pt-5">

            <h2 className="text-lg font-semibold text-gray-800">Active Cases</h2>

            <div className="bg-white rounded-xl p-4 h-[400px] " style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

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