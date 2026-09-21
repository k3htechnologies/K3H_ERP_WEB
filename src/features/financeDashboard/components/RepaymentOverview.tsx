import { Check } from "lucide-react";

export default function RepaymentOverview() {

    const recentRepayments = [
        {
            bank: "HDFC Bank",
            project: "Gopal Darshan",
            date: "25 Aug 2026",
            type: "Part-payment",
            amount: "₹3.50 Cr",
        },
        {
            bank: "Axis Bank",
            project: "Project ABC",
            date: "18 Aug 2026",
            type: "Term Installment",
            amount: "₹2.10 Cr",
        },
    ];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <div
                className="bg-white rounded-xl p-4 h-[300px] overflow-y-auto thin-scroll border border-gray-100 flex flex-col"
                style={{
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
            >
                {/* Heading */}
                <p className="text-sm font-semibold text-slate-500 uppercase">
                    REPAYMENT OVERVIEW
                </p>

                {/* Summary Cards */}
                <div className="flex gap-6 p-3">

                    {/* Total Paid */}
                    <div className="bg-green-100 w-48 rounded-xl p-3 mt-2">
                        <p className="text-green-600 text-sm font-semibold">
                            Total Paid
                        </p>
                        <p className="text-green-600 font-semibold">
                            ₹1.23 Cr
                        </p>
                    </div>

                    {/* Outstanding */}
                    <div className="bg-[#fef2f2] w-48 rounded-xl p-3 mt-2">
                        <p className="text-[#b91c1c] text-sm font-semibold">
                            Outstanding
                        </p>
                        <p className="text-[#b91c1c] font-semibold">
                            ₹25.90 Cr
                        </p>
                    </div>

                    {/* Overdue */}
                    <div className="bg-[#e0f4fc] w-48 rounded-xl p-3 mt-2">
                        <p className="text-[#06b6d4] text-sm font-semibold">
                            Overdue
                        </p>
                        <p className="text-[#06b6d4] font-semibold">
                            ₹25.90 Cr
                        </p>
                    </div>
                </div>

                {/* Repayment Coverage */}
                <div className="mt-3 space-y-2">

                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="text-slate-500">
                            Repayment Coverage Ratio
                        </span>

                        <span className="text-[#10b981]">
                            47%
                        </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-[#10b981] h-full rounded-full transition-all duration-500"
                            style={{ width: "47%" }}
                        />
                    </div>
                </div>

                {/* Recent Activity Heading */}
                <div className="text-gray-500 mt-4 mb-2">
                    <p className="text-slate-400 font-semibold text-xs">
                        RECENT REPAYMENTS ACTIVITY
                    </p>
                </div>

                {/* Recent Repayments */}
                <div className="space-y-3">

                    {recentRepayments.map((repayment, index) => (
                        <div
                            key={index}
                            className="border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between"
                        >

                            {/* Left Side */}
                            <div className="flex items-center gap-4">

                                {/* Check Icon */}
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Check
                                        size={20}
                                        className="text-emerald-500"
                                        strokeWidth={2.5}
                                    />
                                </div>

                                {/* Bank + Project */}
                                <div>
                                    <p className="text-slate-800 font-medium">
                                        {repayment.bank} · {repayment.project}
                                    </p>

                                    <p className="text-slate-500 text-sm mt-1">
                                        {repayment.date} · {repayment.type}
                                    </p>
                                </div>

                            </div>

                            {/* Amount */}
                            <p className="text-emerald-500 font-semibold">
                                {repayment.amount}
                            </p>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}