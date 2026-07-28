// import React from "react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   ResponsiveContainer,
//   Tooltip,
// } from "recharts";

// interface Props {
//   tenantData: any[];
// }

// const AreaUtilization: React.FC<Props> = ({ tenantData }) => {

//   // ================= SUM CALCULATIONS =================

//   const existingCarpetArea = tenantData.reduce(
//     (sum, x) => sum + Number(x.FlatCarpetAreaSqFt || 0),
//     0
//   );

//   const freeAreaOffered = tenantData.reduce((sum, x) => {
//     const percent = Number(x?.FreeAreaOfferedPercent || 0);

//     if (percent === 0) return sum;

//     const carpetArea = Number(x?.FlatCarpetAreaSqFt || 0);

//     return sum + (carpetArea * percent) / 100;
//   }, 0).toFixed(2);


//   const extraAreaPurchased = tenantData.reduce(
//     (sum, x) => sum + Number(x.ExtraAreaPurchasedSqFt || 0),
//     0
//   );

//   // ================= CHART DATA =================

//   const data = [
//     { name: "EXISTING CARPET AREA", value: existingCarpetArea },
//     { name: "FREE AREA OFFERED", value: freeAreaOffered },
//     { name: "EXTRA AREA PURCHASED", value: extraAreaPurchased },
//   ];

//   return (
//     <div className="bg-white rounded-xl p-4" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

//       <h3 className="text-sm text-gray-500 font-medium mb-3">
//         Area Utilization Summary
//       </h3>

//       <div className="h-[260px]">
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart layout="vertical" data={data}>

//             <XAxis type="number" tick={{ fontSize: 10 }} />

//             <YAxis
//               dataKey="name"
//               type="category"
//               tick={{ fontSize: 10 }}
//               width={200}
//             />

//             <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()} Sq.Ft`} />

//             <Bar
//               dataKey="value"
//               radius={[0, 6, 6, 0]}
//               barSize={22}
//               fill="rgba(37,99,235,0.9)"
//               label={{
//                 position: "insideRight",
//                 fill: "#fff",
//                 formatter: (value: any) =>
//                   `${Number(value).toLocaleString()} Sq.Ft`,
//                 fontSize: 10,
//               }}
//             />

//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//     </div>
//   );
// };

// export default AreaUtilization;


import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
  tenantData: any[];
}

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6"];

export default function AreaUtilization({ tenantData }: Props) {

  //   // ================= SUM CALCULATIONS =================

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

    { name: "Existing Carpet Area", value: existingCarpetArea },
    { name: "Free Area Offered", value: freeAreaOffered },
    { name: "Extra Area Purchased", value: extraAreaPurchased },
  ];
  return (
    <div>
      <div className="bg-white p-4 rounded-lg space-y-4 border border-gray-100 h-[315px]  flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
        <h3 className="text-sm text-gray-500 font-medium ml-3 mt-1">
         Area Utilization Summary
        </h3>

        {data.length === 0 ? (
          <div className="flex flex-col justify-center items-center flex-1">
            <NoDataView />
          </div>
        ) : (
          <div className="flex flex-col justify-center flex-1 gap-4 px-2">
            {data.map((item, index) => {

              const percentage = (item.value / item.value) * 100;

              const color = COLORS[index % COLORS.length];

              return (
                <div key={index} className="flex flex-col gap-1">

                  <div className="text-sm text-gray-500 truncate px-1">
                    {item.name}
                  </div>

                  <div className="flex items-center gap-2">

                    <div
                      className="flex-1 rounded-md overflow-hidden"
                      style={{ height: "14px", backgroundColor: "#e5e7eb" }}
                    >
                      <div
                        style={{
                          width: `${percentage}%`,
                          height: "100%",
                          backgroundColor: color,
                          borderRadius: "6px",
                          transition: "width 0.4s ease",
                        }}
                      />
                      
                    </div>

                    <div
                      className="flex-shrink-0 text-gray-700"
                      style={{ width: "32px", fontSize: "15px", fontWeight: 500 }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}