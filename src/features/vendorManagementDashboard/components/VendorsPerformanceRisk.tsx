import React from "react";
import type { Table5 } from "@/features/vendorManagementDashboard/models/VendorManagementDashboardModel";

interface Props {
    vendorPerformanceRisk?: Table5[];
}

export const VendorsPerformanceRisk: React.FC<Props> = ({ vendorPerformanceRisk }) => {
    const data = vendorPerformanceRisk?.[0];

    const onTimeDelivery = data?.OnTimeDelivery ?? "0%";
    const qualityAcceptance = data?.QualityAcceptance ?? "0%";
    const avgResponseTime = data?.AverageResponseTime ?? "0h";

    const totalNeedsAttention = data?.VendorsNeedingAttention ?? 0;
    const repeatDeliveryDelays = data?.RepeatDeliveryDelays ?? 0;
    const qualityIssuesTrendingUp = data?.QualityIssuesTrendingUp ?? 0;

    return (
        <div className="w-full  rounded-2xl border border-slate-100 bg-white p-6  mt-5 h-[350px]">
            {/* Card Header */}
            <h2 className="text-sm font-semibold text-slate-500 mb-4 mt-2">
                Vendors Performance & Risk
            </h2>

            {/* Top 3 KPI Metric Cards */}
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {/* On-time delivery */}
                <div className="rounded-xl border border-gray-300 p-4">
                    <p className="text-xs font-medium text-slate-500">On-time delivery</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                        {typeof onTimeDelivery === "number" ? `${onTimeDelivery}%` : onTimeDelivery}
                    </p>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{
                                width: typeof onTimeDelivery === "number" ? `${onTimeDelivery}%` : onTimeDelivery,
                            }}
                        />
                    </div>
                </div>

                {/* Quality acceptance */}
                <div className="rounded-xl border border-gray-300 p-4">
                    <p className="text-xs font-medium text-slate-500">Quality acceptance</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                        {typeof qualityAcceptance === "number" ? `${qualityAcceptance}%` : qualityAcceptance}
                    </p>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-blue-600"
                            style={{
                                width:
                                    typeof qualityAcceptance === "number" ? `${qualityAcceptance}%` : qualityAcceptance,
                            }}
                        />
                    </div>
                </div>

                {/* Avg. response time */}
                <div className="rounded-xl border border-gray-300 p-4">
                    <p className="text-xs font-medium text-slate-500">Avg. response time</p>
                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                        {avgResponseTime}
                    </p>
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                            className="h-full rounded-full bg-amber-600"
                            style={{
                                width:
                                    typeof avgResponseTime === "number" ? `${avgResponseTime}` : avgResponseTime,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Needs Attention Header */}
            <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Needs attention</span>
                <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    {totalNeedsAttention} {totalNeedsAttention === 1 ? "vendor" : "vendors"}
                </span>
            </div>

            {/* Issues List */}
            <div className="mt-3 divide-y divide-slate-100">
                <div className="flex items-center gap-2 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                    <span className="text-sm font-semibold text-slate-700">
                        Repeat delivery delays
                    </span>
                    <span className="text-sm text-slate-300">·</span>
                    <span className="text-sm text-slate-500">
                        {repeatDeliveryDelays} {repeatDeliveryDelays === 1 ? "vendor" : "vendors"}
                    </span>
                </div>

                <div className="flex items-center gap-2 py-3">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                    <span className="text-sm font-semibold text-slate-700">
                        Quality issues trending up
                    </span>
                    <span className="text-sm text-slate-300">·</span>
                    <span className="text-sm text-slate-500">
                        {qualityIssuesTrendingUp} {qualityIssuesTrendingUp === 1 ? "vendor" : "vendors"}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VendorsPerformanceRisk;