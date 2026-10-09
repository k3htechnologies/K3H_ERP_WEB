import React, { useMemo } from "react";

interface DsaItem {
  TermSheetDirectSellingAgentId?: number;
  TermSheetDetailsId?: number;
  ProjectId?: number;
  BankNBFCName?: string;
  LoanType?: string;
  ConsultantName?: string;
  Amount?: number;
  CommissionPercentage?: number;
  PaymentDate?: string;
  PaymentStatus?: string;
  Remark?: string;
  PaidAmount?: number;
  PendingAmount?: number;
}

interface Props {
  dsaPaymentTrackData: DsaItem[];
  formatToKLCr?: (val: number) => string;
}

export default function DsaPaymentTrack({
  dsaPaymentTrackData,
  formatToKLCr = (v) => `${v}`,
}: Props) {
  const data = dsaPaymentTrackData || [];

  // Helper to extract clean short loan type (e.g., "Loan Against Property (LAP)" -> "LAP")
  const getShortLoanType = (loanType?: string) => {
    if (!loanType) return "CF";
    const match = loanType.match(/\(([^)]+)\)/);
    if (match) return match[1];
    return loanType
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  // Dynamic calculations for top summary cards
  const summary = useMemo(() => {
    let totalPayable = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    data.forEach((item) => {
      const amount = Number(item.Amount) || 0;
      const isPaid = item.PaymentStatus?.toLowerCase() === "paid";
      const isPartiallyPaid = item.PaymentStatus?.toLowerCase().includes("partially");

      const paid = Number(
        item.PaidAmount ?? (isPaid ? amount : isPartiallyPaid ? amount / 2 : 0)
      );
      const pending = Number(
        item.PendingAmount ?? (amount - paid > 0 ? amount - paid : 0)
      );

      totalPayable += amount;
      totalPaid += paid;
      totalOutstanding += pending;
    });

    return {
      totalPayable,
      totalPaid,
      totalOutstanding,
    };
  }, [data]);

  return (
    <div className="space-y-3 pt-4 sm:pt-5">
      <div
        className="bg-white rounded-xl p-4 h-[380px] overflow-y-auto thin-scroll border border-gray-100"
        style={{
          boxShadow: "0px 1px 2px rgba(0,0,0,0.05)",
        }}
      >
        {/* Heading */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-500 uppercase">
            DSA PAYMENT TRACK
          </p>
          <span className="text-xs font-medium text-orange-500 bg-orange-50 px-3 py-1 rounded-md">
            Agent Commissions
          </span>
        </div>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Total DSA Payable */}
          <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex justify-between items-center">
            <p className="text-sm text-slate-500 font-semibold">
              Total DSA Payable
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {`₹ ${formatToKLCr(summary.totalPayable)}`}
            </p>
          </div>

          {/* Total Paid */}
          <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex justify-between items-center">
            <p className="text-sm text-emerald-500 font-semibold">Total Paid</p>
            <p className="text-sm font-semibold text-emerald-500">
              {`₹ ${formatToKLCr(summary.totalPaid)}`}
            </p>
          </div>

          {/* DSA Outstanding */}
          <div className="border border-slate-200 rounded-xl px-3 py-2.5 flex justify-between items-center">
            <p className="text-sm text-orange-500 font-semibold">
              DSA Outstanding
            </p>
            <p className="text-sm font-semibold text-orange-500">
              {`₹ ${formatToKLCr(summary.totalOutstanding)}`}
            </p>
          </div>
        </div>

        {/* DSA Payment Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.map((item, index) => {
            const amount = Number(item.Amount) || 0;
            const isPaid = item.PaymentStatus?.toLowerCase() === "paid";
            const isPartiallyPaid = item.PaymentStatus?.toLowerCase().includes("partially");

            const paid = Number(
              item.PaidAmount ?? (isPaid ? amount : isPartiallyPaid ? amount / 2 : 0)
            );
            const pending = Number(
              item.PendingAmount ?? (amount - paid > 0 ? amount - paid : 0)
            );

            // Badge Color Logic
            const statusKey = item.PaymentStatus?.toLowerCase() || "";
            const badgeClasses = statusKey.includes("partially")
              ? "bg-amber-50 text-amber-600"
              : statusKey === "paid"
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500";

            return (
              <div
                key={item.TermSheetDirectSellingAgentId || index}
                className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between"
              >
                <div>
                  {/* Bank + Type and Status Badge */}
                  <div className="flex justify-between items-start gap-2">
                    <p
                      className="text-sm font-bold text-slate-800 truncate"
                      title={`${item.BankNBFCName} • ${getShortLoanType(item.LoanType)}`}
                    >
                      {item.BankNBFCName || "Bank"} • {getShortLoanType(item.LoanType)}
                    </p>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-medium shrink-0 ${badgeClasses}`}
                    >
                      {item.PaymentStatus || "Pending"}
                    </span>
                  </div>

                  {/* DSA Agent / Agency */}
                  <div className="mt-3">
                    <p
                      className="text-sm font-semibold text-slate-800 mt-0.5 truncate"
                      title={item.ConsultantName}
                    >
                      {item.ConsultantName || "—"}
                    </p>
                  </div>

                  {/* Payout Rate + Total */}
                  <div className="flex justify-between items-center mt-2 pb-2 border-b border-slate-200 text-xs">
                    <p className="text-slate-400">
                      Payout Rate:
                      <span className="text-slate-700 font-semibold ml-1">
                        {item.CommissionPercentage ?? 0}%
                      </span>
                    </p>

                    <p className="font-bold text-slate-800">
                      {`₹ ${formatToKLCr(amount)} Total`}
                    </p>
                  </div>
                </div>

                {/* Paid / Pending Breakdown */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
                  <div>
                    <p className="text-xs text-slate-400">Paid</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">
                      {`₹ ${formatToKLCr(paid)}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Pending</p>
                    <p className="text-sm font-bold text-red-500 mt-0.5">
                      {`₹ ${formatToKLCr(pending)}`}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}