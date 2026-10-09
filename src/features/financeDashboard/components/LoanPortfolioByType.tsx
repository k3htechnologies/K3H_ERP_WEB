import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface Props {
    loanPortfolioByLoanTypeData: any[];
}

const DEFAULT_COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export default function LoanPortfolioByType({ loanPortfolioByLoanTypeData }: Props) {
    // Map API fields (LoanType, LoanAccounts) to name, value, color
    const chartData = (loanPortfolioByLoanTypeData || []).map((item, index) => ({
        name: item.LoanType,
        value: Number(item.LoanAccounts),
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
    }));

    const totalLoans = chartData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="space-y-3 pt-5">
            <div
                className="bg-white rounded-xl p-4 h-[300px]"
                style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
            >
                <h2 className="text-sm font-semibold uppercase text-slate-500 mb-4">
                    Loan Portfolio By Type
                </h2>

                {/* Conditions here */}
                {(loanPortfolioByLoanTypeData?.length ?? 0 > 0) ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
                            {/* Chart container with explicit height */}
                            <div className="relative h-[220px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                            cornerRadius={4}
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* Centered count */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-slate-800 leading-tight">
                                        {totalLoans}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-600 uppercase">
                                        Total Loans
                                    </span>
                                </div>
                            </div>

                            {/* Legend list */}
                            <div className="space-y-3 max-h-[220px] overflow-y-auto thin-scroll pr-1">
                                {chartData.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs mt-5">
                                        <div className="flex items-center gap-2 min-w-0 pr-2">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                                style={{ backgroundColor: item.color }}
                                            />
                                            <span className="text-slate-600 font-medium text-xs truncate" title={item.name}>
                                                {item.name}
                                            </span>
                                        </div>
                                        <span className="text-slate-800 font-bold text-sm shrink-0">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </>
                ) : (<div className="flex flex-col items-center justify-center h-[180px] text-slate-400">
                    <p className="text-sm font-medium">No Data Found</p>
                </div>)}


            </div>
        </div>
    );
}