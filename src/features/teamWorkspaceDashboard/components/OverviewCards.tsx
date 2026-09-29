import type { Table3, Table5 } from "@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel";

interface Props {
  overviewData?: Table5[];
  roomsData?: Table3[];
}

export default function OverviewCards({ overviewData = [], roomsData = [] }: Props) {
  const data = overviewData[0] || {};
  const rooms = roomsData[0] || {};

  const cards = [
    {
      title: "Total Tasks",
      value: data.TotalTasks ?? 0,
      subtitle: `${data.CompletedTasks ?? 0} Completed · ${data.PendingTasks ?? 0} Pending`,
      subtitleClass: "text-gray-500",
    },
    {
      title: "In Progress",
      value: data.InProgressTasks ?? 0,
      subtitle: `${data.PendingTasks ?? 0} Pending`,
      subtitleClass: "text-gray-500",
    },
    {
      title: "Pending",
      value: data.PendingTasks ?? 0,
      subtitle: `${data.CompletedTasks ?? 0} Completed`,
      subtitleClass: "text-gray-500",
    },
    {
      title: "Conference Rooms",
      value: rooms.AvailableRooms ?? 0,
      subtitle: `${rooms.AvailableRooms ?? 0} Available · ${rooms.TotalRooms ?? 0} Total`,
      subtitleClass: "text-gray-500",
    },
  ];

  return (
    <div className="space-y-3 pt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-4 border border-gray-100"
            style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
          >
            <p className="text-sm text-gray-500">{c.title}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{c.value}</p>
            <p className={`text-xs mt-1 ${c.subtitleClass}`}>{c.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
