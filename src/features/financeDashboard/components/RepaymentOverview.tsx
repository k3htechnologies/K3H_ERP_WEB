import { formatToKLCr } from "@/core/utils/comman";

interface Props {
  repaymentOverviewData: any[];
}

export default function RepaymentOverview({ repaymentOverviewData }: Props) {
    
  const repaymentData = repaymentOverviewData || [];

  return (
    <div className="space-y-3 pt-4 sm:pt-5">
      <div className="bg-white rounded-xl p-4 h-[420px] overflow-y-auto thin-scroll border border-gray-100 flex flex-col"  style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
        {/* Heading */}
        <p className="text-sm font-semibold text-slate-500 uppercase">REPAYMENT OVERVIEW</p>

    <div className="p-3">
  {repaymentData && repaymentData.map((item, index) => {
    const percentage = Math.min(Math.max(Number(item?.CoveragePercentage) || 0, 0), 100);

    return (
      <div key={index} className="w-full flex flex-col">
        <div className="grid grid-cols-3 gap-3">
          {/* Total Paid */}
          <div className="bg-green-100 min-w-0 rounded-xl p-3">
            <p className="text-green-600 text-xs sm:text-sm font-semibold truncate">Total Paid</p>
            <p className="text-green-600 font-semibold text-sm sm:text-base truncate">
              {`₹ ${formatToKLCr(item.TotalDisbursed)}`}
            </p>
          </div>

          {/* Outstanding */}
          <div className="bg-[#fef2f2] min-w-0 rounded-xl p-3">
            <p className="text-[#b91c1c] text-xs sm:text-sm font-semibold truncate">Outstanding</p>
            <p className="text-[#b91c1c] font-semibold text-sm sm:text-base truncate">
              {`₹ ${formatToKLCr(item.OutstandingBalance)}`}
            </p>
          </div>

          {/* Overdue */}
          <div className="bg-[#e0f4fc] min-w-0 rounded-xl p-3">
            <p className="text-[#06b6d4] text-xs sm:text-sm font-semibold truncate">Overdue</p>
            <p className="text-[#06b6d4] font-semibold text-sm sm:text-base truncate">
              {`₹ ${formatToKLCr(item.OverdueAmount ?? item.TotalDisbursed)}`}
            </p>
          </div>
        </div>

        {/* Repayment Coverage Section */}
        <div className="mt-5 space-y-2 w-full">
          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-slate-600">Repayment Coverage</span>
            <span className="text-[#06b6d4]">{`${percentage}%`}</span>
          </div>

          {/* Track & Fill */}
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#06b6d4] h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    );
  })}
</div>

        {/* Recent Activity Heading */}
        <div className="text-gray-500 mt-4 mb-2">
          <p className="text-slate-400 font-semibold text-sm">RECENT REPAYMENTS ACTIVITY</p>
        </div>

        {/* Recent Repayments */}
      </div>
    </div>
  );
}
