import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";


export default function LoanPortfoioByBank({ }) {

    const columns = [
        {
            key: "Bank/NBFC",
            label: "Bank / NBFC",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-800">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Loans",
            label: "Loans",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Sanctioned",
            label: "Sanctioned",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Disbursed",
            label: "Disbursed",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-600">
                    {value || ''}
                </span>
            ),
        },
        {
            key: "Outstanding",
            label: "Outstanding",
            align: "right" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-500 whitespace-nowrap">
                    {value || ''}
                </span>
            ),
        },
    ];

    const data = [
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
        {
            "Bank/NBFC": "HDFC Bank Ltd",
            "Loans": 12,
            "Sanctioned": 563500000,
            "Disbursed": 48500000,
            "Outstanding": 25750000,
        },
    ]


    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <div className="bg-white rounded-xl p-4 h-[300px] overflow-y-auto thin-scroll border border-gray-100 flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <p className="text-sm font-semibold text-slate-500 uppercase">
                    LOAN PORTFOLIO BY BANK/NBFC{" "}
                </p>

                {/*  */}
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