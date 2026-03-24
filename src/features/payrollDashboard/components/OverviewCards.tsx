import { MapPin, Calendar1, Clock1, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Table0, Table5 } from "../models/PayrollDashboardModel";

interface Props {
  overViewData: Table0[];
  attendanceAlert: Table5[];
}

export default function OverviewCards({ overViewData, attendanceAlert }: Props) {

  const absentTotalCount = attendanceAlert[0]?.AbsentCount || 0;

  const navigate = useNavigate();
  const data = overViewData[0] || {};

  const cards = [
    {
      title: "On Leave Today",
      value: data.OnLeave ?? 0,
      icon: Calendar1,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    {
      title: "Outdoor Today",
      value: data.Outdoor ?? 0,
      icon: MapPin,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Pending Approval",
      value: data.PendingApproval ?? 0,
      icon: Clock1,
      subData: "View Pending List",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Attendance Alert",
      value: absentTotalCount ?? 0,
      subData: "Late Logins",
      icon: NotebookPen,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Overview</h2>

      <div className="grid grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;

          return (
            <div
              key={i}
              className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col justify-between h-32 relative cursor-pointer"
            >
              <div className="text-base font-semibold " onClick={() => {
                if (c.title === 'On Leave Today') {
                  navigate('/payrollReport?tab=Leave');
                }
                else if (c.title === 'Outdoor Today') {
                  navigate('/payrollReport?tab=Outdoor');
                }
                else if (c.title === 'Pending Approval') {
                }
                else if (c.title === 'Attendance Alert') {

                }
              }}>
                <p className="text-sm text-gray-500">{c.title}</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {c.value}
                </p>
              </div>

              <div
                className={`absolute top-4 right-4 p-2 rounded-lg ${c.iconBg}`}
              >
                <Icon size={20} className={c.iconColor} />
              </div>

              <div className="mt-2">
                {c.subData ? (
                  <button className="text-xs text-blue-600 font-normal ">
                    {c.subData}
                  </button>
                ) : (
                  <div className="flex -space-x-2 -mt-5">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200" />
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300" />
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-300" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
