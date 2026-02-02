import { PieChart, Pie, Cell } from "recharts";

interface Props {
  overViewData: any[];
}

export default function UnitStatusDistribution({ overViewData = [] }: Props) {

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
        <div className="flex justify-center relative">

          <PieChart width={220} height={220}>
            <Pie
              data={chartData}
              innerRadius={70}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>

          {/* Center Text */}
          <div className="absolute top-1/2 -translate-y-1/2 text-center">
            <p className="text-xs text-gray-500">Total Units</p>
            <p className="text-xl font-semibold">{data.TotalFlats ?? 0}</p>
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">

          <Card title="Total Units" value={data.TotalFlats} color="text-black-500" />
          <Card title="Member Units" value={data.AllotedFlats} color="text-purple-500" />
          <Card title="Booked Units" value={data.BookedFlats} color="text-red-500" />
          <Card title="Blocked Units" value={data.BlockedFlats} color="text-gray-900" />
          <Card title="Hold Units" value={data.HoldFlats} color="text-yellow-500" />
          <Card title="Available Units" value={data.AvailableFlats} color="text-green-500" />

        </div>
      </div>
    </div>
  );
}

/* Small Card Component */

function Card({ title, value, color }: any) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">{title}</p>
      <p className={`text-lg font-semibold ${color}`}>{value ?? 0}</p>
    </div>
  );
}
