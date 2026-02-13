import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface AttendnaceOverviewItem {
  AttendanceDate: string;
  AttendanceStatus: string;
  FullName: string;
}

interface Props {
  attendanceOverviewData?: AttendnaceOverviewItem[];
}

export default function AttendanceOverview({ attendanceOverviewData = [] }: Props) {
  const attendanceOverviewDataResult = attendanceOverviewData || {};

  //Filtering the employees by their attendance status
  const presentEmployeeCount = attendanceOverviewDataResult.filter(
    (pEmployee) => pEmployee.AttendanceStatus === "Present",
  ).length;
  const absentEmployeeCount = attendanceOverviewDataResult.filter(
    (aEmployee) => aEmployee.AttendanceStatus === "Absent",
  ).length;
  const onLeaveEmployeeCount = attendanceOverviewDataResult.filter(
    (k) => k.AttendanceStatus === "Leave",
  ).length;

  const totalNumberOfEmployees = attendanceOverviewData.length;

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
      <h2 className="text-lg font-semibold text-gray-800">
        Attendance Overview
      </h2>

      <div
        className=" bg-white rounded-xl p-8"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <h3 className="text-sm text-gray-500 font-medium ">Team Attendance</h3>

        <div className="grid grid-cols-2 items-center gap-4">
          {/* Left DONUT */}
          <div className="relative h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={10}
                >
                  {data.map((t, i) => (
                    <Cell key={i} fill={t.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* CENTER TOTAL */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-xl font-bold text-gray-800">
                {totalNumberOfEmployees}
              </p>
            </div>
          </div>
          {/* Right LEGEND */}
          <div className="space-y-3">
            {data.map((t, i) => (
              <div key={i} className="rounded-lg p-2 flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: t.color }}
                ></div>
                <p className="font-semibold text-[22px]">{t.value}</p>
                <p className="text-sm text-gray-500 font-medium">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm font-bold text-left p-1 ml-20">
          {totalNumberOfEmployees} Total Employees
        </p>
      </div>
    </div>
  );
}
