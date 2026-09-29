import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";

const parseAmount = (val: string | number): number => {
    if (typeof val === "number") return val;
    if (!val) return 0;
    const cleaned = val.replace(/[^0-9.]/g, "");
    return parseFloat(cleaned) || 0;
};

export default function LoanPortfoioByBank({ }) {
    const columns = [
        {
            key: "Bank/NBFC",
            label: "Bank / NBFC",
            align: "left" as any,
            render: (value: string, row: any) => {
                const sanctioned = parseAmount(row?.["Sanctioned"]);
                const disbursed = parseAmount(row?.["Disbursed"]);

                const progress = sanctioned > 0
                    ? Math.min(100, Math.max(0, (disbursed / sanctioned) * 100))
                    : 0;

                return (
                    <div className="flex flex-col gap-1.5 w-fit min-w-[120px]">
                        <span className="text-[14px] font-medium text-gray-800">
                            {value || ''}
                        </span>

                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-sky-500 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                );
            },
        },
        {
            key: "Loans",
            label: "Loans",
            align: "left" as any,
            render: (value: string | number) => (
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
            "Sanctioned": "₹ 563500000 Cr",
            "Disbursed": "₹ 48500000 Cr",
            "Outstanding": "₹ 25750000 Cr",
        },
        {
            "Bank/NBFC": "Axis Bank Ltd",
            "Loans": 10,
            "Sanctioned": "₹ 400000000 Cr",
            "Disbursed": "₹ 250000000 Cr",
            "Outstanding": "₹ 150000000 Cr",
        },
        {
            "Bank/NBFC": "ICICI Bank Ltd",
            "Loans": 8,
            "Sanctioned": "₹ 300000000 Cr",
            "Disbursed": "₹ 120000000 Cr",
            "Outstanding": "₹ 180000000 Cr",
        },
        {
            "Bank/NBFC": "State Bank of India",
            "Loans": 15,
            "Sanctioned": "₹ 700000000 Cr",
            "Disbursed": "₹ 550000000 Cr",
            "Outstanding": "₹ 150000000 Cr",
        },
        {
            "Bank/NBFC": "Kotak Mahindra Bank",
            "Loans": 6,
            "Sanctioned": "₹ 200000000 Cr",
            "Disbursed": "₹ 100000000 Cr",
            "Outstanding": "₹ 100000000 Cr",
        },
        {
            "Bank/NBFC": "Punjab National Bank",
            "Loans": 4,
            "Sanctioned": "₹ 150000000 Cr",
            "Disbursed": "₹ 90000000 Cr",
            "Outstanding": "₹ 60000000 Cr",
        },
    ];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <div
                className="bg-white rounded-xl p-4 h-[300px] border border-gray-100 flex flex-col"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <p className="text-sm font-semibold text-slate-500 uppercase">
                    LOAN PORTFOLIO BY BANK/NBFC
                </p>

                <div className="min-w-[500px] sm:min-w-full flex-1 flex flex-col mt-3 overflow-y-auto thin-scroll h-[250px]">
                    <DataTableWithHeaderRowDivider
                        className="flex-1"
                        emptyMessage="No Data Found"
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