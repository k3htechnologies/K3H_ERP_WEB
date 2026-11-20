import type { Table5 } from "../models/CrmDashboardModel";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    alertData: Table5[];
}

const Alert: React.FC<Props> = ({ alertData }) => {
    const isEmpty = alertData.length === 0;

    return (
        <div className="pt-5">
            <div
                className="bg-white p-4 rounded-xl border border-gray-100"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <h2 className="text-sm font-medium text-gray-500 mb-3">Alerts</h2>

                <div
                    className={`pr-2 h-[200px] ${isEmpty
                        ? "flex items-center justify-center text-gray-500"
                        : "space-y-3 overflow-y-auto thin-scroll"
                        }`}
                >
                    {isEmpty ? (
                        <NoDataView />
                    ) : (
                        alertData.map((item, index) => (
                            <div
                                key={index}
                                className="relative flex items-center justify-between bg-[#FFF7F7] border border-[#FEE2E2] rounded-lg p-3 pl-4 overflow-hidden"
                            >
                                {/* Left vertical red line bar */}
                                <div className="absolute left-0 top-1 bottom-1 w-[4px] bg-[#E11D48] rounded-r-full" />

                                {/* Left content: Title & Description */}
                                <div className="space-y-1">
                                    <h4 className="text-xs font-semibold text-[#78350F]">
                                        {item.Title || "Alert"}
                                    </h4>
                                    <p className="text-xs text-[#92400E]">
                                        {item.Description || `${item.Days ?? 0} days remaining`}
                                    </p>
                                </div>

                                {/* Right Badge: Days Left */}
                                <span className="shrink-0 text-[11px] font-semibold text-[#BE123C] bg-[#FFE4E6] px-2.5 py-1 rounded-md">
                                    {item.Days ?? 0} Day Left
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Alert;