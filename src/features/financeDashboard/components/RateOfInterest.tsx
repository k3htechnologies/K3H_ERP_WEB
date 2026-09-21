export default function RateOfIntrest() {

    const interestRates = [
        {
            bank: "HDFC Bank",
            label: "Lowest ROI",
            rate: "9.50%",
            bg: "bg-emerald-50",
            labelColor: "text-emerald-500",
        },
        {
            bank: "Axis Bank",
            label: "Average ROI",
            rate: "11.20%",
            bg: "bg-sky-50",
            labelColor: "text-sky-500",
        },
        {
            bank: "Indian Bank",
            label: "Highest ROI",
            rate: "13.00%",
            bg: "bg-red-50",
            labelColor: "text-red-500",
        },
    ];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">

            <div
                className="bg-white rounded-xl p-4 border border-gray-100"
                style={{
                    boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
                }}
            >

                {/* Heading */}
                <p className="text-sm font-semibold text-slate-500 uppercase mb-4">
                    RATE OF INTEREST
                </p>

                {/* Interest Rate List */}
                <div className="space-y-4">

                    {interestRates.map((item, index) => (
                        <div
                            key={index}
                            className={`${item.bg} rounded-lg px-3 py-2 flex items-center justify-between`}
                        >

                            {/* Bank */}
                            <p className="text-sm font-semibold text-slate-800">
                                {item.bank}
                            </p>

                            {/* ROI */}
                            <div className="text-right">

                                <p
                                    className={`text-[9px] font-medium ${item.labelColor}`}
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