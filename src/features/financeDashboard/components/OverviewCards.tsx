import { Landmark, ShieldCheck, ArrowUpRight, Hourglass, CircleCheckBig, CircleAlert } from "lucide-react"

export default function OverviewCards({ }) {

    const overviewCards = [
        {
            title: "TOTAL LOAN ACCOUNTS",
            value: 31,
            subtitle: "Active Across Projects",
            icon: Landmark,
            iconBg: "bg-sky-50",
            iconColor: "text-sky-500",
        },
        {
            title: "TOTAL SANCTIONED",
            value: "₹129.30 Cr",
            subtitle: "Across 31 Accounts",
            icon: ShieldCheck,
            iconBg: "bg-purple-50",
            iconColor: "text-purple-500",
        },
        {
            title: "TOTAL DISBURSED",
            value: "₹49.75 Cr",
            subtitle: "38.5% Utilized Overall",
            icon: ArrowUpRight,
            iconBg: "bg-cyan-50",
            iconColor: "text-cyan-500",
        },
        {
            title: "BALANCE DISBURSEMENT",
            value: "₹79.55 Cr",
            subtitle: "Remaining Limit",
            icon: Hourglass,
            iconBg: "bg-orange-50",
            iconColor: "text-orange-500",
        },
        {
            title: "TOTAL REPAYMENT",
            value: "₹23.85 Cr",
            subtitle: "Repayment Done",
            icon: CircleCheckBig,
            iconBg: "bg-emerald-50",
            iconColor: "text-emerald-500",
        },
        {
            title: "OUTSTANDING BALANCE",
            value: "₹25.90 Cr",
            subtitle: "Current Outstanding",
            icon: CircleAlert,
            iconBg: "bg-red-50",
            iconColor: "text-red-500",
        },
    ]

    return (
        <div className="space-y-3 pt-5">
            <div className="grid grid-cols-3 gap-4">

                {overviewCards.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <div
                            key={index}
                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between"
                        >
                            {/* Left content */}
                            <div>
                                <h2 className="text-sm   font-medium text-slate-500">
                                    {item.title}
                                </h2>

                                <p className="text-xl font-bold text-slate-900 mt-2">
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