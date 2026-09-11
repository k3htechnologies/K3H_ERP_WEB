// import type { Table0 } from "@/features/accountDashboard/models/AccountDashboardModel";

import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";


export default function NoticesTable({ }) {

    const data = [
        {
            NoticeTitle: "GST Assessment",
            Company: "Kampa Projects",
            Compliance: "GST",
            Authority: "District Court",
            NoticeDate: "08 July 2026",
        },
        {
            NoticeTitle: "Tax Return Notice",
            Company: "Rishabraj",
            Compliance: "Income Tax",
            Authority: "Supreme Court",
            NoticeDate: "12 August 2026",
        },
        {
            NoticeTitle: "Society Tax Return",
            Company: "Balaji Infra",
            Compliance: "ESIC",
            Authority: "High Court",
            NoticeDate: "31 September 2026",
        },
        {
            NoticeTitle: "GST Assessment",
            Company: "Hrishabraj A",
            Compliance: "PF",
            Authority: "District Court",
            NoticeDate: "08 July 2026",
        },
    ];

    const columns = [
        {
            key: "NoticeTitle",
            label: "Notice Title",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-800">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Company",
            label: "Company",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Compliance",
            label: "Compliance",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Authority",
            label: "Authority",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "NoticeDate",
            label: "Notice Date",
            align: "right" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-500 whitespace-nowrap">
                    {value || ''}
                </span>
            ),
        },
    ];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <div className="bg-white rounded-xl p-4 h-[300px] overflow-y-auto thin-scroll border border-gray-100 flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                {/* Section Header */}
                <p className="text-sm font-semibold text-slate-500 uppercase">
                    RECENTLY ADDED NOTICES{" "}
                    <span className="text-[12px] font-semibold text-gray-400">( Last 7 Days )</span>
                </p>

                <div className="min-w-[500px] sm:min-w-full flex-1 flex flex-col mt-3">
                    <DataTableWithHeaderRowDivider
                        data={data}
                        columns={columns}
                        recordsPerPage={6}
                        fixedHeight={true}
                    />
                </div>
            </div>
        </div>
    );


} 