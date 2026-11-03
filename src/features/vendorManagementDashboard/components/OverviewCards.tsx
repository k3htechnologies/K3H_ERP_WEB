import type { Table0 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";

interface Props {
    overViewData?: Table0[];
}

export default function OverviewCards({ overViewData = [] }: Props) {

    const data = overViewData[0] || {};

    const cards =
        [
            {
                title: "Total Vendors",
                value: data.TotalVendors ?? 0,
                subText: 'Registered Partners'
            },
            {
                title: "Verified Vendors",
                value: data.VerifiedVendors ?? 0,
                subText: `${data.PendingVerification}% Pending`

            },
            {
                title: "Verified Percent",
                value: `${data.VerifiedPercent ?? 0}%`,
                subText: 'Awaiting Review',
                textColor: '#D97706'

            },
            {
                title: "Active Engagement",
                value: data.ActiveEngagement ?? 0,
                subText: '> 30 days activity',
                textColor: '#2563EB'
            }
        ];

    return (
        <div className="space-y-3 pt-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }} >
                        <div className="flex items-start gap-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{c.title}</p>
                                <p className="text-2xl font-semibold text-gray-900 mt-3">
                                    {c.value}
                                </p>
                                <p
                                    className="text-xs text-slate-500 mt-1"
                                    style={{ color: c.textColor ?? "#64748B" }}
                                >
                                    {c.subText}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}