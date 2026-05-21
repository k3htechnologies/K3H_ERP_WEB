import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table3 } from "@/features/litigationDashboard/models/litigationDashboardModel";

interface Props {
    courtData: Table3[];
}

export default function CourtDistribution({ courtData = [] }: Props) {
    const maxValue = Math.max(...courtData.map(d => Math.max(d.TotalCases, d.OpenCases)), 1);

    return (
        <div className="pt-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Court Distribution
            </h2>

            <div className="bg-white rounded-lg p-4 space-y-4 overflow-y-auto thin-scroll border border-gray-100 h-[327px] flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                {courtData.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-[296px]">
                        <NoDataView />
                    </div>
                ) : (
                    <>
                        {/* Legend */}
                        <div className="flex justify-end gap-4 text-xs text-gray-500 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-blue-600 rounded-sm" />
                                Total Case
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-4 bg-rose-500 rounded-sm" />
                                Open Case
                            </div>
                        </div>

                        {/* Bars */}
                        <div className="flex-1 gap-1 px-2 overflow-y-auto thin-scroll pr-1">
                            {courtData.map((item, index) => {
                                const totalPct = (item.TotalCases / maxValue) * 100;
                                const openPct = (item.OpenCases / maxValue) * 100;

                                return (
                                    <div key={index} className="flex flex-col gap-0 pb-2">

                                        <div className="text-xs font-gray-900 text-gray-500 truncate">
                                            {item.CourtType}
                                        </div>

                                        {/* Total Cases bar */}
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="flex-1 rounded-md overflow-hidden"
                                                style={{ height: "10px", backgroundColor: "#e5e7eb" }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${totalPct}%`,
                                                        height: "100%",
                                                        backgroundColor: "#2563eb",
                                                        borderRadius: "6px",
                                                        transition: "width 0.4s ease",
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className="flex-shrink-0 text-gray-500"
                                                style={{ width: "32px", fontSize: "13px" }}
                                            >
                                                {item.TotalCases}
                                            </div>
                                        </div>

                                        {/* Open Cases bar */}
                                        <div className="flex items-center gap-1">
                                            <div
                                                className="flex-1 rounded-md overflow-hidden"
                                                style={{ height: "10px", backgroundColor: "#e5e7eb" }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${openPct}%`,
                                                        height: "100%",
                                                        backgroundColor: "#f43f5e",
                                                        borderRadius: "6px",
                                                        transition: "width 0.4s ease",
                                                    }}
                                                />
                                            </div>
                                            <div
                                                className="flex-shrink-0 text-gray-500"
                                                style={{ width: "32px", fontSize: "13px" }}
                                            >
                                                {item.OpenCases}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}