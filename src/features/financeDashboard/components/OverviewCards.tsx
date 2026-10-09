import { formatToKLCr } from "@/core/utils/comman";
import { Landmark, ShieldCheck, ArrowUpRight, Hourglass, CircleCheckBig, CircleAlert } from "lucide-react"

interface Props {
    overviewData: any;
}

export default function OverviewCards(
    {overviewData}: Props) {
        const data = overviewData?.[0] ?? {};

   const overviewCards = [
        {
            title: "TOTAL LOAN ACCOUNTS",
            value: `₹ ${formatToKLCr(data.TotalLoanAccounts ?? 0)}`,
            subtitle: "Active Across Projects",
            icon: Landmark,
            iconBg: "bg-sky-50",
            iconColor: "text-sky-500",
        },
        {
            title: "TOTAL SANCTIONED",
            value: `₹ ${formatToKLCr(data.TotalSanctioned ?? 0)}`,
            subtitle: "Across 31 Accounts",
            icon: ShieldCheck,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
        },
        {
            title: "TOTAL DISBURSED",
            value: `₹ ${formatToKLCr(data.TotalDisbursed ?? 0)} `,
            subtitle: "38.5% Utilized Overall",
            icon: ArrowUpRight,
            iconBg: "bg-cyan-50",
            iconColor: "text-cyan-500",
        },
        {
            title: "BALANCE DISBURSEMENT",
            value: `₹ ${formatToKLCr(data.BalanceDisbursement ?? 0)}`,
            subtitle: "Remaining Limit",
            icon: Hourglass,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
        {
            title: "TOTAL REPAYMENT",
            value: `₹ ${formatToKLCr(data.TotalRepayment ?? 0)}`,
            subtitle: "Repayment Done",
            icon: CircleCheckBig,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
        },
        {
            title: "OUTSTANDING BALANCE",
            value: `₹ ${formatToKLCr(data.OutstandingBalance ?? 0)}`,
            subtitle: "Current Outstanding",
            icon: CircleAlert,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
    ];

    return (
        <div className="space-y-3 pt-5">
            <div className="grid grid-cols-3 gap-4">

                {overviewCards.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between shadow-sm"
                        >
                            {/* Left content */}
                            <div>
                                <p className="text-sm   font-medium text-gray-500">
                                    {item.title}
                                </p>

                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                    {item.value}
                                </p>

                                <p className="text-xs text-slate-500 mt-1">
                                    {item.subtitle}
                                </p>
                            </div>

                            {/* Icon */}
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}
                            >
                                <Icon
                                    className={`w-5 h-5 ${item.iconColor}`}
                                    strokeWidth={2}
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}