import type { Table2 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";
import { Package, Building2 } from "lucide-react";

interface Props {
    sourcingCoverageData?: Table2[];
}

export default function SourcingCoverage({ sourcingCoverageData = [] }: Props) {
    const materialData = sourcingCoverageData[0] || ({} as Table2);
    const contractData = sourcingCoverageData[1] || ({} as Table2);

    const cards = [
        {
            title: "Material Coverage",
            total: (materialData as any)?.TotalCategories ?? 0,
            subtitle: "Material categories",
            icon: <Package className="w-4 h-4 text-emerald-600" />,
            iconBg: "bg-emerald-50",
            stats: [
                { label: "Multiple vendors", count: (materialData as any)?.MultipleVendors ?? 0, color: "bg-emerald-500" },
                { label: "Single vendor", count: (materialData as any)?.SingleVendor ?? 0, color: "bg-indigo-500" },
                { label: "No vendor", count: (materialData as any)?.NoVendor ?? 0, color: "bg-amber-400" },
            ],
        },
        {
            title: "Contract Coverage",
            total: (contractData as any)?.TotalCategories ?? 0,
            subtitle: "Contract categories",
            icon: <Building2 className="w-4 h-4 text-indigo-600" />,
            iconBg: "bg-indigo-50",
            stats: [
                { label: "Multiple vendors", count: (contractData as any)?.MultipleVendors ?? 0, color: "bg-emerald-500" },
                { label: "Single vendor", count: (contractData as any)?.SingleVendor ?? 0, color: "bg-indigo-500" },
                { label: "No vendor", count: (contractData as any)?.NoVendor ?? 0, color: "bg-amber-400" },
            ],
        },
    ];

    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white rounded-2xl p-4 border border-slate-100  space-y-4 h-[300px] ">
                {/* Main Title */}
                <h2 className="text-base font-semibold text-slate-500 mb-4">
                    Sourcing Coverage
                </h2>

                {/* Sub-cards Container */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="border border-slate-200/80 rounded-xl p-3 bg-white space-y-4"
                        >
                            {/* Header: Icon + Title */}
                            <div className="flex items-center gap-2.5">
                                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {card.title}
                                </h3>
                            </div>

                            {/* Total Count */}
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900 leading-none">
                                    {card.total}
                                </span>
                                <span className="text-base text-slate-400 font-medium">
                                    {card.subtitle}
                                </span>
                            </div>

                            {/* Segmented Progress Bar */}
                            <div className="h-2 w-full bg-slate-100 rounded-full flex overflow-hidden">
                                {card.stats.map((stat, i) => {
                                    const widthPercent = card.total > 0 ? (stat.count / card.total) * 100 : 0;
                                    return (
                                        <div
                                            key={i}
                                            className={`${stat.color} h-full`}
                                            style={{ width: `${widthPercent}%` }}
                                        />
                                    );
                                })}
                            </div>

                            {/* Legend / Metrics */}
                            <div className="space-y-2.5 pt-1 text-xs">
                                {card.stats.map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${stat.color}`} />
                                            <span className="text-slate-600 font-medium text-sm">{stat.label}</span>
                                        </div>
                                        <span className="font-bold text-slate-800">{stat.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>

    );
}