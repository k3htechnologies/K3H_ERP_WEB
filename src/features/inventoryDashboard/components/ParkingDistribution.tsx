import NoDataView from "@/ui/components/NoDataView/NoDataView";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import type { Table1 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";

interface Props {
  parkingData: Table1[];
}

export default function ParkingDistribution({ parkingData}: Props) {

  return (

    <div className="space-y-3 pt-5">

      <h2 className="text-lg font-semibold text-gray-800">
        Parking Distribution
      </h2>
      
      <div className="bg-white p-4 rounded-xl mt-5 border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        {parkingData.length === 0 ? (
          <div className="flex flex-col justify-center pt-2 items-center h-[460px]">
            <NoDataView />
          </div>
        ) : (
          <>
            <div className="h-[438px] [&_.recharts-wrapper_svg]:outline-none">

              <ResponsiveContainer>

                <BarChart data={parkingData} barGap={-40} style={{ outline: "none" }}>

                  <XAxis dataKey="FloorName" tick={{ fontSize: 11 }} />

                  <YAxis />
                  <Tooltip />

                  <Bar
                    dataKey="TotalParking"
                    radius={[8, 8, 0, 0]}
                    fill="#c8d0dc"
                    barSize={40} 
                  >
                    <LabelList dataKey="TotalParking" position="top" fill="#9ca3af" />
                  </Bar>

                  {/* Available Parking (Green Foreground Bar) */}
                  <Bar
                    dataKey="AvailableParking"
                    radius={[8, 8, 0, 0]}
                    fill="#16a34a"
                    barSize={40}
                  >
                    <LabelList dataKey="AvailableParking" position="center" fill="#fff" />
                  </Bar>

                </BarChart>
              </ResponsiveContainer>

            </div>

            {/* Legend */}
            <div className="flex justify-end gap-4 text-xs mt-2 text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-300 rounded-sm"></span>
                Total Parking
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-600 rounded-sm"></span>
                Available Parking
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
