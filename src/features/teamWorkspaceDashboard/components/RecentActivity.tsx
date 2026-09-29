import { useState } from "react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import Tabs from "@/ui/components/Tab/Tab";
import type { Table0 } from "@/features/teamWorkspaceDashboard/models/TeamWorkspaceDashboardModel";

interface Props {
  activityData: Table0[];
}

const ACTIVITY_TAB_LIST = [
  { id: "All", label: "All" },
  { id: "To Do", label: "To Do" },
  { id: "In Progress", label: "In Progress" },
  { id: "On Hold", label: "On Hold" },
];

export default function RecentActivity({ activityData }: Props) {
  const [activeTab, setActiveTab] = useState("All");

  const filteredData =
    activeTab === "All"
      ? activityData
      : activityData.filter((item) => item.Status === activeTab);

  return (
    <div className="pt-5">
      <div
        className="bg-white p-4 rounded-xl border border-gray-100 space-y-3 h-[420px] flex flex-col"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-500">Recent Activity</h3>
          <Tabs
            tabs={ACTIVITY_TAB_LIST}
            defaultActive={activeTab}
            islarge
            istoggleTab
            onTabChange={(tab) => setActiveTab(tab.id)}
          />
        </div>

        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
          {filteredData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <NoDataView />
            </div>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.TaskId}
                className="flex gap-3 border-b border-gray-100 pb-3 last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {(item.TaskTitle || "?").charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#2D2D2D]">
                    <span className="font-semibold">{item.TaskTitle || "-"}</span> ·{" "}
                    {item.Status || "-"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.TaskDescription || "-"} · Priority: {item.Priority || "-"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
