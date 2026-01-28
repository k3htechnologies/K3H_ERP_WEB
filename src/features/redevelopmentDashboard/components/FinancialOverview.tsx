import { formatToKLCr } from "@/core/utils/comman";
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

  const financialTotalPaid = tenantApplicantChargesData.reduce(
    (sum, item) => sum + Number(item.Paid || 0),
    0
  );

  // ================= METRICS =================
  const metrics = tenantApplicantChargesData.map((x: any) => ({
    label: x.ChargeType || x.ChargeName,
    value: Number(x.Amount || 0),
  }));

  // ================= CHART DATA =================
  const chartData = metrics.map(m => ({
    name: m.label.toUpperCase(),
    value: Number(m.value),
  }));


  return (
    <div className="bg-white rounded-xl p-4 mt-5" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Financial Overview (Rent)
      </h3>

      <div className="grid grid-cols-12 gap-6">

        {/* LEFT SIDE */}
        <div className="col-span-8">

          {/* Total Exposure */}
          <div className="bg-blue-50 rounded-xl p-4">

            <p className="text-sm text-black">
              Total Financial Exposure
            </p>


            <div className="relative group inline-block">
              <p className="text-2xl font-semibold mt-1 cursor-pointer">
                ₹ {formatToKLCr(financialTotal)}
              </p>
              {financialTotal && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  {financialTotal}
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="mt-3">
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{
                    width: financialTotal > 0
                      ? `${Math.min(100, (financialTotalPaid / financialTotal) * 100)}%`
                      : "0%"
                  }}

                />
              </div>

              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Paid : ₹ {financialTotalPaid}</span>
                <span>Pending ₹ {(financialTotal - financialTotalPaid).toFixed(2)}</span>
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

                  <div className="relative group inline-block">
                    <p className="font-semibold">₹ {formatToKLCr(m.value)}</p>
                    {m.value && (
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                        {m.value}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-400">
                    {(m.value / financialTotal * 100).toFixed(0)} % of total
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

              <YAxis tickFormatter={(v) => formatToKLCr(Number(v))} />

              <Tooltip formatter={(v: any) => `₹ ${formatToKLCr(Number(v))}`} />

              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
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
