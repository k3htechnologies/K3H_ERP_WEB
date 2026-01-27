import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  tenantApplicantChargesData: any[];
}

const COLORS = ["#2563EB", "#16A34A", "#F97316", "#EC4899", "#8B5CF6"];

const FinancialOverview: React.FC<Props> = ({ tenantApplicantChargesData }) => {

  // ================= TOTAL AMOUNT =================
  const financialTotal = tenantApplicantChargesData.reduce(
    (sum, item) => sum + Number(item.Amount || 0),
    0
  );

  // Convert to Crores
  const totalCr = financialTotal / 10000000;

  if (!tenantApplicantChargesData?.length) {
    return (
      <div className="bg-white rounded-xl p-4 mt-5">
        No Financial Data
      </div>
    );
  }

  // ================= METRICS =================
  const metrics = tenantApplicantChargesData.map((x: any) => ({
    label: x.ChargeType || x.ChargeName || "UNKNOWN",
    value: Number(x.Amount || 0) / 10000000,
  }));

  // ================= CHART DATA =================
  const chartData = metrics.map(m => ({
    name: m.label.toUpperCase(),
    value: Number(m.value.toFixed(2)),
  }));

  // Dummy paid percent (replace later from backend)
  const paidPercent = 70;

  return (
    <div className="bg-white rounded-xl p-4 mt-5">

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Financial Overview
      </h3>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-8">

          {/* Total Exposure */}
          <div className="bg-blue-50 rounded-xl p-4">

            <p className="text-sm text-black">
              Total Financial Exposure
            </p>

            <p className="text-2xl font-semibold mt-1">
              ₹ {totalCr.toFixed(2)} Cr
            </p>

            {/* Progress */}
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Paid : {paidPercent}%</span>
                <span>₹ {(totalCr * paidPercent / 100).toFixed(2)} Cr</span>
              </div>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-3 mt-4">

            {metrics.map((m, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-3 flex items-start gap-3"
              >
                <div
                  className="w-3 h-3 rounded-sm mt-1"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />

                <div>
                  <p className="text-sm">{m.label}</p>
                  <p className="font-semibold">₹ {m.value.toFixed(2)} Cr</p>
                  <p className="text-xs text-gray-400">
                    {(m.value / totalCr * 100).toFixed(0)} % of total
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>

        {/* RIGHT SIDE CHART */}
        <div className="col-span-4 h-[350px]">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `${v} CR`} />
              <Tooltip formatter={(v:any)=>`₹ ${v} Cr`} />

              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>

        </div>

      </div>
    </div>
  );
};

export default FinancialOverview;
