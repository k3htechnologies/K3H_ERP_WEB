import { TriangleAlert } from "lucide-react";

export default function Alerts() {

    const alerts = [
        {
            title: "Repayment Overdue",
            description: "₹3.20 Cr repayment is overdue across 2 loan accounts",
        },
        {
            title: "DSA Partially Paid",
            description: "₹0.40 Cr remains payable against 2 DSA accounts",
        },
    ];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">

            <div
                className="bg-white rounded-xl p-4 border border-gray-100 h-[250px]"
                style={{
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
            >

                {/* Heading */}
                <p className="text-sm font-semibold text-slate-500 uppercase mb-4">
                    ALERTS
                </p>

                {/* Alerts */}
                <div className="space-y-3">

                    {alerts.map((alert, index) => (
                        <div
                            key={index}
                            className="bg-orange-50 border-l-[5px] border-orange-400 rounded-md px-3 py-2.5"
                        >

                            {/* Title */}
                            <div className="flex items-center gap-2">

                                <TriangleAlert
                                    size={13}
                                    strokeWidth={1.8}
                                    className="text-orange-500"
                                />

                                <p className="text-sm font-semibold text-orange-700">
                                    {alert.title}
                                </p>

                            </div>

                            {/* Description */}
                            <p className="text-[10px] text-orange-700/80 mt-2">
                                {alert.description}
                            </p>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}