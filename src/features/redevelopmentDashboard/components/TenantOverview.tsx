import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Props {
  tenantData: any[];
}

const TenantOverview: React.FC<Props> = ({ tenantData }) => {

  // ================= COUNTS =================

  const residentialCount = tenantData.filter(
    x => x.FlatType?.toUpperCase() === "RESIDENTIAL"
  ).length;

  const commercialCount = tenantData.filter(
    x => x.FlatType?.toUpperCase() === "COMMERCIAL"
  ).length;

  const tenants = [
    {
      name: "Residential",
      value: residentialCount,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
    {
      name: "Commercial",
      value: commercialCount,
      color: "#16A34A",
      bg: "#ECFDF5",
    },
   
  ];

  const total = tenants.reduce((sum, t) => sum + t.value, 0);


  return (
    <div className="bg-white rounded-xl p-4">

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Tenant Overview
      </h3>

      <div className="grid grid-cols-2 items-center gap-4">

        {/* LEFT: DONUT */}
        <div className="relative h-[220px]">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tenants}
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {tenants.map((t, i) => (
                  <Cell key={i} fill={t.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* CENTER TOTAL */}
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">:{total}</p>
          </div>
        </div>

        {/* RIGHT: LEGEND */}
        <div className="space-y-3">
          {tenants.map((t, i) => (
            <div
              key={i}
              className="rounded-lg p-3"
              style={{ backgroundColor: t.bg }}
            >
              <p className="text-sm" style={{ color: t.color }}>
                {t.name}
              </p>
              <p className="font-semibold text-gray-800">
                {t.value}
              </p>
            </div>
          ))}
        </div>

      </div>

      

    </div>
  );
};

export default TenantOverview;
