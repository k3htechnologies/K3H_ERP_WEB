import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider"

export default function ProjectWiseFinanceStatus({ }) {

    const data = [
        {
            ProjectName: "Kampa Heights",
            LoanAccounts: 5,
            SanctionedAmount: `₹24.25 Cr`,
            Disbursed: `₹18.75 Cr`,
            OutstandingBalance: `₹11.70Cr`
        },
        {
            ProjectName: "Ketaki Singh",
            LoanAccounts: 5,
            SanctionedAmount: `₹30.25 Cr`,
            Disbursed: `₹18.75 Cr`,
            OutstandingBalance: `₹11.70Cr`
        },
        {
            ProjectName: "Beverly Park",
            LoanAccounts: 5,
            SanctionedAmount: `₹24.25 Cr`,
            Disbursed: `₹68.75 Cr`,
            OutstandingBalance: `₹11.70Cr`
        },

    ]

    const columns = [
        {
            key: "ProjectName",
            label: "Project Name",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-800">
                    {value || ''}
                </span>
            ),

        },
        {
            key: "LoanAccounts",
            label: "Loan Accounts",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "SanctionedAmount",
            label: "Sanction Amount",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "DisbursedAmount",
            label: "Disbursed Amount",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "OutstandingBalance",
            label: "Outstanding Balance",
            align: "right" as any,
            render: (value: string) => (
                <span className="text-[14px] text-red-600">
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
    )
}

