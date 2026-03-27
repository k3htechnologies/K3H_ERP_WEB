import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Table5 } from "../models/PayrollDashboardModel";

interface Props {
  attendanceOverviewData: Table5[];
}

export default function AttendanceOverview({ attendanceOverviewData }: Props) {
  const stats = attendanceOverviewData[0] || {};

  const presentEmployeeCount = stats.PresentCount || 0;
  const absentEmployeeCount = stats.AbsentCount || 0;
  const onLeaveEmployeeCount = stats.OnLeaveCount || 0;
  const totalNumberOfEmployees = stats.TotalEmployees || 0;

  const data = [
    {
      name: "Present",
      value: presentEmployeeCount,
      color: "#135bec",
    },
    {
      name: "Absent",
      value: absentEmployeeCount,
      color: "#13367A",
    },
    {
      name: "On Leave",
      value: onLeaveEmployeeCount,
      color: "#7a98a5",
    },
  ];

  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Attendance Overview</h2>

      <div className="bg-white rounded-xl p-4  border border-gray-50">
        <h3 className="text-sm text-gray-500 font-medium mb-4">Team Attendance</h3>

        <div className="grid grid-cols-2 items-center gap-4">
          {/* Left DONUT */}
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={10}
                >
                  {data.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* CENTER TOTAL */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-bold text-gray-800">
                {totalNumberOfEmployees}
              </p>

            </div>
          </div>

          {/* Right LEGEND */}
          <div className="space-y-4">
            {data.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: t.color }}
                ></div>
                <p className="text-sm text-gray-700">
                  <span className="font-bold text-gray-900 text-lg">
                    {t.value}
                  </span>
                  <span className="text-gray-500 ml-2 text-lg">
                    {t.name}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/*Footer*/}
        <div className="mt-6 pt-4 border-t border-gray-50 text-center">
          <p className="text-sm font-semibold text-gray-600">
            {totalNumberOfEmployees} Total Employee
          </p>
        </div>
      </div>
    </div>
  );
}
