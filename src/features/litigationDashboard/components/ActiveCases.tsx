import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useMemo } from "react";

interface ActiveCasesRecord {
    CaseTitle: string;
    CaseNumber: string;
    CaseType: string;
    HearingDate: string;
    Status: string;
}

interface Props {
    activeCaseData: ActiveCasesRecord[]
}

export default function ActiveCases({ activeCaseData = [] }: Props) {
    const activeCaseColumns = useMemo<any[]>(
        () => [
            {
                key: "CaseTitle",
                label: "Case Title",
                align: "left",
                render: (value: string) => (
                    <span className="font-medium text-black">
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
                render: (value: string) => (
                    <span className="font-medium text-black">
                        {(value || '')}
                    </span>
                )
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
        ],
        []
    );

    return (
        <div className="space-y-3 pt-5">
            <h2 className="text-lg font-semibold text-gray-800">Active Cases</h2>
            <div className="bg-white rounded-xl p-4 h-[300px] " style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <DataTableWithOutBorder
                    columns={activeCaseColumns}
                    data={activeCaseData}
                    emptyMessage="No Active Cases Found"
                    fixedHeight={true}
                    className="divide-y divide-gray-400 "
                />
            </div>
        </div>
    )
}