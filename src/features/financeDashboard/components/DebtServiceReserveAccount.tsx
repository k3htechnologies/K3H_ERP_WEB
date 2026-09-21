import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import { CircleDollarSign } from "lucide-react";

export default function DebtServiceReserveAccount() {

    const mutualFunds = [
        {
            LoanAccount: "HDFC - CF Gopal Darshan",
            MFAccount: "₹2.50 Cr",
            Status: "Active",
        },
        {
            LoanAccount: "Axis - CF heights",
            MFAccount: "₹2.00 Cr",
            Status: "Active",
        },
    ];

    const fixedDeposits = [
        {
            loanAccount: "HDFC - CF Gopal Darshan",
            amount: "₹3.00 Cr",
            maturity: "15 Oct 2027",
            status: "Active",
        },
        {
            loanAccount: "Indian Bank - Heights B",
            amount: "₹2.00 Cr",
            maturity: "12 Nov 2027",
            status: "Active",
        },
    ];

    const columns = [
        {
            key: "LoanAccount",
            label: "Loan Account",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-800">
                    {value || ''}
                </span>
            ),

        },
        {
            key: "MFAccount",
            label: "MF Account",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-800">
                    {value || ''}
                </span>
            ),

        },
        {
            key: "Status",
            label: "Status",
            align: "left" as any,
            render: (value: string) => (
                <span className="text-[14px] text-gray-800">
                    {value || ''}
                </span>
            ),

        }
    ]

    return (
        <div className="space-y-3 pt-4 sm:pt-5">

            <div
                className="bg-white rounded-xl p-4 border border-gray-100"
                style={{
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
            >

                {/* Heading */}
                <p className="text-sm font-semibold text-slate-500 uppercase mb-4">
                    DEBT SERVICE RESERVE ACCOUNT (DSRA)
                </p>

                {/* DSRA Reserve Percentage */}
                <div className="mb-4">

                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-slate-500">
                            DSRA Reserve Met Percentage
                        </p>

                        <p className="text-sm font-medium text-orange-500">
                            95% Maintained
                        </p>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: "75%" }}
                        />
                    </div>

                </div>

                {/* Allocation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">

                    {/* Mutual Funds */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center">
                                <CircleDollarSign
                                    size={19}
                                    className="text-violet-500"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-800">
                                    Mutual Funds Allocation
                                </p>

                                <p className="text-base font-semibold text-slate-800 mt-1">
                                    ₹4.50 Cr
                                    <span className="text-sm font-normal text-slate-500 ml-1">
                                        (47.4% share)
                                    </span>
                                </p>
                            </div>

                        </div>

                        <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                            Active
                        </span>

                    </div>

                    {/* Fixed Deposits */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">

                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-full bg-cyan-50 flex items-center justify-center">
                                <CircleDollarSign
                                    size={19}
                                    className="text-cyan-500"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-800">
                                    Fixed Deposits (FD)
                                </p>

                                <p className="text-base font-semibold text-slate-800 mt-1">
                                    ₹5.00 Cr
                                    <span className="text-sm font-normal text-slate-500 ml-1">
                                        (52.6% share)
                                    </span>
                                </p>
                            </div>

                        </div>

                        <span className="text-sm font-medium text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                            Active
                        </span>

                    </div>

                </div>

                {/* Tables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Mutual Fund Portfolio */}
                    <div>

                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                            MUTUAL FUND PORTFOLIO (DSRA)
                        </p>

                        <div className="min-w-[500px] sm:min-w-full flex-1 flex flex-col mt-3">
                            <DataTableWithHeaderRowDivider
                                data={mutualFunds}
                                columns={columns}
                                recordsPerPage={6}
                                fixedHeight={true}
                            />

                        </div>



                    </div>

                    {/* Fixed Deposit Holdings */}
                    <div>

                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                            FIXED DEPOSIT HOLDINGS (DSRA)
                        </p>

                        <div className="border border-slate-200 rounded-lg overflow-hidden">

                            {/* Header */}
                            <div className="grid grid-cols-[1.4fr_0.8fr_1fr_0.7fr] bg-slate-100 px-2 py-2 text-sm font-medium text-slate-500">
                                <span>Loan Account</span>
                                <span>FD Amount</span>
                                <span>Maturity</span>
                                <span className="text-right">Status</span>
                            </div>

                            {/* Rows */}
                            {fixedDeposits.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-[1.4fr_0.8fr_1fr_0.7fr] items-center px-2 py-2 border-t border-slate-100 text-[11px]"
                                >

                                    <span className="text-slate-700 font-medium">
                                        {item.loanAccount}
                                    </span>

                                    <span className="text-slate-700">
                                        {item.amount}
                                    </span>

                                    <span className="text-slate-500">
                                        {item.maturity}
                                    </span>

                                    <span className="text-right">
                                        <span className="inline-block text-sm text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                                            {item.status}
                                        </span>
                                    </span>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}