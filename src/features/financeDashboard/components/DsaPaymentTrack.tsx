export default function DsaPaymentTrack() {

    const dsaPayments = [
        {
            bank: "HDFC Bank",
            type: "CF",
            status: "Partially Paid",
            statusColor: "orange",
            agency: "Apex Advisory Group",
            payoutRate: "1.25%",
            total: "₹1.20 Cr",
            paid: "₹0.80 Cr",
            pending: "₹0.40 Cr",
        },
        {
            bank: "Axis Bank",
            type: "CF",
            status: "Pending",
            statusColor: "red",
            agency: "First Capital Partners",
            payoutRate: "1.10%",
            total: "₹1.20 Cr",
            paid: "₹0.25 Cr",
            pending: "₹0.70 Cr",
        },
        {
            bank: "Indian Bank",
            type: "LAP",
            status: "Paid",
            statusColor: "green",
            agency: "Summit Advisors",
            payoutRate: "1.50%",
            total: "₹0.74 Cr",
            paid: "₹0.80 Cr",
            pending: "₹0.40 Cr",
        },
    ];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">

            <div
                className="bg-white rounded-xl p-4 h-[300px] overflow-y-auto thin-scroll border border-gray-100"
                style={{
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
            >

                {/* Heading */}
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-slate-500 uppercase">
                        DSA PAYMENT TRACK
                    </p>

                    <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-md">
                        Agent Commissions
                    </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

                    {/* Total DSA Payable */}
                    <div className="border border-slate-200 rounded-xl px-3 py-2.5">
                        <p className="text-sm text-slate-500">
                            Total DSA Payable
                        </p>

                        <p className="text-sm font-semibold text-slate-800 mt-1">
                            ₹2.89 Cr
                        </p>
                    </div>

                    {/* Total Paid */}
                    <div className="border border-slate-200 rounded-xl px-3 py-2.5">
                        <p className="text-sm text-emerald-500">
                            Total Paid
                        </p>

                        <p className="text-sm font-semibold text-emerald-500 mt-1">
                            ₹1.05 Cr
                        </p>
                    </div>

                    {/* DSA Outstanding */}
                    <div className="border border-slate-200 rounded-xl px-3 py-2.5">
                        <p className="text-sm text-orange-500">
                            DSA Outstanding
                        </p>

                        <p className="text-sm font-semibold text-orange-500 mt-1">
                            ₹1.20 Cr
                        </p>
                    </div>

                </div>

                {/* DSA Payment Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    {dsaPayments.map((item, index) => (

                        <div
                            key={index}
                            className="bg-slate-50 border border-slate-200 rounded-xl p-3"
                        >

                            {/* Bank + Status */}
                            <div className="flex justify-between items-start">

                                <p className="text-xs font-semibold text-slate-800">
                                    {item.bank} · {item.type}
                                </p>

                                <span
                                    className={`
                                        text-[10px] px-2 py-1 rounded-md font-medium
                                        ${item.statusColor === "orange"
                                            ? "bg-orange-50 text-orange-500"
                                            : item.statusColor === "red"
                                                ? "bg-red-50 text-red-500"
                                                : "bg-emerald-50 text-emerald-500"
                                        }
                                    `}
                                >
                                    {item.status}
                                </span>

                            </div>

                            {/* Agency */}
                            <div className="mt-3">

                                <p className="text-sm text-slate-500">
                                    DSA Agent / Agency
                                </p>

                                <p className="text-xs font-medium text-slate-800 mt-1">
                                    {item.agency}
                                </p>

                            </div>

                            {/* Payout Rate + Total */}
                            <div className="flex justify-between items-center mt-2 pb-2 border-b border-slate-200">

                                <p className="text-[10px] text-slate-500">
                                    Payout Rate:
                                    <span className="text-slate-700 ml-1">
                                        {item.payoutRate}
                                    </span>
                                </p>

                                <p className="text-[10px] font-semibold text-slate-700">
                                    {item.total} Total
                                </p>

                            </div>

                            {/* Paid / Pending */}
                            <div className="grid grid-cols-2 gap-3 mt-2">

                                <div>
                                    <p className="text-[10px] text-slate-500">
                                        Paid
                                    </p>

                                    <p className="text-xs font-semibold text-emerald-500 mt-1">
                                        {item.paid}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500">
                                        Pending
                                    </p>

                                    <p className="text-xs font-semibold text-red-500 mt-1">
                                        {item.pending}
                                    </p>
                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </div>

        </div>
    );
}