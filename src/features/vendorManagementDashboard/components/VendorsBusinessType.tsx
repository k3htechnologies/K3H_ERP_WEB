import React from "react";
import type { Table4 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    vendorsBusinessTypeData?: Table4[];
}

const COLOR_CONFIG: Record<string, { bg: string; dot: string }> = {
    Both: { bg: "bg-emerald-500", dot: "bg-emerald-500" },
    Dealer: { bg: "bg-indigo-500", dot: "bg-indigo-500" },
    Manufacturer: { bg: "bg-amber-400", dot: "bg-amber-400" },
    "": { bg: "bg-slate-400", dot: "bg-slate-400" },
};

const DEFAULT_COLORS = [
    { bg: "bg-emerald-500", dot: "bg-emerald-500" },
    { bg: "bg-indigo-500", dot: "bg-indigo-500" },
    { bg: "bg-amber-400", dot: "bg-amber-400" },
    { bg: "bg-slate-400", dot: "bg-slate-400" },
];

const VendorsBusinessType: React.FC<Props> = ({ vendorsBusinessTypeData = [] }: Props) => {

    return (

        <div className="bg-white rounded-lg p-6 border border-slate-100 shadow-xs space-y-6 w-full h-[300px]">
            {/* Title */}
            <h2 className="text-base font-semibold text-slate-500 mb-4 mt-2">Vendor's Business Type</h2>

            {/* Progress Bars & Labels List */}
            <div className="space-y-6">
                {vendorsBusinessTypeData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full">
                        <NoDataView />
                    </div>
                ) : (
                    vendorsBusinessTypeData.map((item, index) => {
                        const color =
                            COLOR_CONFIG[item.Label] ||
                            DEFAULT_COLORS[index % DEFAULT_COLORS.length];

                        const percentage = Math.min(Math.max(item.Percentage || 0, 0), 100);

                        return (
                            <div key={item.Label || index} className="space-y-3">
                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-8">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${color.bg}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2.5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${color.dot}`} />
                                        <span className="font-semibold text-slate-700">
                                            {item.Label}
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-800">
                                        {item.Total}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default VendorsBusinessType;