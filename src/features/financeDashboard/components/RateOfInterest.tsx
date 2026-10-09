interface BankROI {
    BankNBFCName: string;
    LoanAccounts: number;
    AverageRateOfInterest: number;
    MinimumRateOfInterest: number;
    MaximumRateOfInterest: number;
}

interface Props {
    roiData?: BankROI[];
}

export default function RateOfInterest({ roiData }: Props) {
    const rawData = roiData || [];

    // 1. Filter valid entries and sort ascending (Lowest -> Highest)
    const sortedData = [...rawData]
        .filter((item) => typeof item?.AverageRateOfInterest === "number")
        .sort((a, b) => a.AverageRateOfInterest - b.AverageRateOfInterest);

    if (sortedData.length === 0) {
        return null;
    }

    // 2. Map every record: index 0 is Lowest, last index is Highest, rest are Average
    const interestRates = sortedData.map((item, index) => {
        const rate = item.AverageRateOfInterest;
        const isFirst = index === 0;
        const isLast = index === sortedData.length - 1;

        if (isFirst) {
            return {
                bank: item.BankNBFCName,
                label: "Lowest ROI",
                rate: `${Number(rate).toFixed(2)}%`,
                bg: "bg-[#eafaf1]",
                labelColor: "text-[#10b981]",
            };
        } else if (isLast) {
            return {
                bank: item.BankNBFCName,
                label: "Highest ROI",
                rate: `${Number(rate).toFixed(2)}%`,
                bg: "bg-[#fef0f0]",
                labelColor: "text-[#ef4444]",
            };
        } else {
            return {
                bank: item.BankNBFCName,
                label: "Average ROI",
                rate: `${Number(rate).toFixed(2)}%`,
                bg: "bg-[#e9f6fd]",
                labelColor: "text-[#0284c7]",
            };
        }
    });

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <div
                className="bg-white rounded-xl p-4 border border-gray-100"
                style={{
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
            >
                {/* Heading */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-slate-500 uppercase">
                        RATE OF INTEREST
                    </p>
                </div>

                {/* All Records Scrollable List */}
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 thin-scroll">
                    {interestRates.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.bg} rounded-lg px-3 py-2 flex items-center justify-between`}
                        >
                            {/* Bank Name */}
                            <p className="text-sm font-semibold text-slate-800 capitalize truncate max-w-[65%]">
                                {item.bank}
                            </p>

                            {/* ROI Details */}
                            <div className="text-right">
                                <p
                                    className={`text-xs font-medium ${item.labelColor}`}
                                >
                                    {item.label}
                                </p>
                                <p
                                    className={`text-sm font-bold ${item.labelColor}`}
                                >
                                    {item.rate}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}