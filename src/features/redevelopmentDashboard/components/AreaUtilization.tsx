import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
  tenantData: any[];
}

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6"];

export default function AreaUtilization({ tenantData }: Props) {

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

  const data = [

    { name: "Existing Carpet Area", value: existingCarpetArea },
    { name: "Free Area Offered", value: freeAreaOffered },
    { name: "Extra Area Purchased", value: extraAreaPurchased },
  ];
  return (
    <div>
      <div className="bg-white p-4 rounded-xl space-y-4 border border-gray-100 h-[387px]  flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
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

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500 font-medium">
                      {item.name}
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      {item.value} (Sq.Ft)
                    </span>
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