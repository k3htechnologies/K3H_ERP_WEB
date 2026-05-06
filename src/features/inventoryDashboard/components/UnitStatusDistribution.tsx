import { PieChart, Pie, Cell } from "recharts";
import type { Table0 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";

interface Props {
  overViewData: Table0[];
  onOpenModal: (cardName: string, flatStatus: string, data: any) => void;
}

export default function UnitStatusDistribution({ overViewData, onOpenModal }: Props) {

  const data = overViewData[0] || {};

  const chartData = [
    { name: "Available", value: data.AvailableFlats ?? 0 },
    { name: "Allotted", value: data.AllotedFlats ?? 0 },
    { name: "Booked", value: data.BookedFlats ?? 0 },
    { name: "Hold", value: data.HoldFlats ?? 0 },
    { name: "Blocked", value: data.BlockedFlats ?? 0 },
  ];

  const COLORS = ["#22c55e", "#8b5cf6", "#ef4444", "#eab308", "#111827"];

  return (

    <div className="space-y-3 pt-5">

      <h2 className="text-lg font-semibold text-gray-800">
        Unit Status Distribution
      </h2>

      <div className="bg-white p-4 rounded-xl mt-5 border border-gray-100"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        {/* Donut */}
        <div className="flex justify-center relative [&_.recharts-wrapper_svg]:outline-none">

          <PieChart width={220} height={220}>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              style={{ outline: "none" }}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>

          <div className="absolute top-1/2 -translate-y-1/2 text-center">
            <p className="text-xs text-gray-500">Total Units</p>
            <p className="text-xl font-semibold">{data.TotalFlats ?? 0}</p>
          </div>
        </div>


        <div className="grid grid-cols-2 gap-3 mt-4">

          <Card title="Total Units" value={data.TotalFlats} color="text-black-500" onClick={() => onOpenModal("Total Units", "", data.TotalFlats || 0)} />
          <Card title="Member Units" value={data.AllotedFlats} color="text-purple-500" onClick={() => onOpenModal("Member Units", "Alloted", data.AllotedFlats|| 0)} />
          <Card title="Booked Units" value={data.BookedFlats} color="text-red-500" onClick={() => onOpenModal("Booked Units", "Booked", data.BookedFlats || 0)} />
          <Card title="Blocked Units" value={data.BlockedFlats} color="text-gray-900" onClick={() => onOpenModal("Blocked Units", "Blocked", data.BlockedFlats || 0)} />
          <Card title="Hold Units" value={data.HoldFlats} color="text-yellow-500" onClick={() => onOpenModal("Hold Units", "Hold", data.HoldFlats || 0)} />
          <Card title="Available Units" value={data.AvailableFlats} color="text-green-500" onClick={() => onOpenModal("Available Units", "Available", data.AvailableFlats || 0)} />

        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color, onClick }: any) {
  const isDisabled = !value || value === 0;
  return (
    <div
      onClick={!isDisabled ? onClick : undefined}
      className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:shadow transition"
    >
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-lg font-semibold ${color}`}>{value ?? 0}</p>
    </div>
  );
}
