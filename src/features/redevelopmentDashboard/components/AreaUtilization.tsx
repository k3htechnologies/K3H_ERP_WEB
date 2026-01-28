import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Props {
  tenantData: any[];
}

const AreaUtilization: React.FC<Props> = ({ tenantData }) => {

  // ================= SUM CALCULATIONS =================

  const existingCarpetArea = tenantData.reduce(
    (sum, x) => sum + Number(x.FlatCarpetAreaSqFt || 0),
    0
  );

  const freeAreaOffered = tenantData.reduce((sum, x) => {
    const percent = Number(x?.FreeAreaOfferedPercent || 0);

    if (percent === 0) return sum;

    const carpetArea = Number(x?.FlatCarpetAreaSqFt || 0);

    return sum + (carpetArea * percent) / 100;
  }, 0).toFixed(2);


  const extraAreaPurchased = tenantData.reduce(
    (sum, x) => sum + Number(x.ExtraAreaPurchasedSqFt || 0),
    0
  );

  // ================= CHART DATA =================

  const data = [
    { name: "EXISTING CARPET AREA", value: existingCarpetArea },
    { name: "FREE AREA OFFERED", value: freeAreaOffered },
    { name: "EXTRA AREA PURCHASED", value: extraAreaPurchased },
  ];

  return (
    <div className="bg-white rounded-xl p-4" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Area Utilization Summary
      </h3>

      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data}>

            <XAxis type="number" tick={{ fontSize: 10 }} />

            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 10 }}
              width={200}
            />

            <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} Sq.Ft`} />

            <Bar
              dataKey="value"
              radius={[0, 6, 6, 0]}
              barSize={22}
              fill="rgba(37,99,235,0.9)"
              label={{
                position: "insideRight",
                fill: "#fff",
                formatter: (value: any) =>
                  `${Number(value).toLocaleString()} Sq.Ft`,
                fontSize: 10,
              }}
            />

          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default AreaUtilization;
