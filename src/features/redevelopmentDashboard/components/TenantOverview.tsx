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
    x => x.UnitType?.toUpperCase() === "RESIDENTIAL"
  ).length;

  const commercialCount = tenantData.filter(
    x => x.UnitType?.toUpperCase() === "COMMERCIAL"
  ).length;

  const tenants = [
    {
      name: "Residential",
      value: residentialCount,
      color: "#13367A",
      bg: "#EFF6FF",
    },
    {
      name: "Commercial",
      value: commercialCount,
      color: "#1D703C",
      bg: "#ECFDF5",
    },

  ];

  const total = tenants.reduce((sum, t) => sum + t.value, 0);


  return (
    <div className="bg-white rounded-xl p-4" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Tenant Overview
      </h3>

      <div className="flex flex-col items-center">

        <div className="relative h-[220px] w-full max-w-[260px]">
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

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">{total}</p>
          </div>
        </div>

        <div className="w-full mt-4 space-y-3">
          {tenants.map((t, i) => (
            <div
              key={i}
              className="rounded-lg p-3 flex justify-between items-center"
              style={{ backgroundColor: t.bg }}
            >
              <span className="text-sm font-medium" style={{ color: t.color }}>
                {t.name}
              </span>

              <span className="font-semibold text-gray-800">
                {t.value}
              </span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default TenantOverview;
