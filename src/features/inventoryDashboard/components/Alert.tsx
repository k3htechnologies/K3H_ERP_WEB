import React from "react";
import { AlertTriangle } from "lucide-react";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table3 } from "@/features/inventoryDashboard/models/InventoryDashboardModel";

interface Props {
  alertsData: Table3[];
}

const AlertsPanel: React.FC<Props> = ({ alertsData}) => {
  return (
    <div className="space-y-3">

      <h2 className="text-lg font-semibold text-gray-800">
        Alerts
      </h2>

      <div
        className="bg-white rounded-xl p-4 h-[500px] flex flex-col border border-gray-100"
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >

        <div className="flex-1 overflow-y-auto thin-scroll space-y-3 pr-1">
          {alertsData.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-16">
              <NoDataView />
            </p>
          )}

          {alertsData.map((alert, i) => (
            <div
              key={i}
              className="relative bg-orange-50 rounded-lg p-3 border border-orange-100"
            >
              
              {/* Left Accent */}
              <span className="absolute left-0 top-0 h-full w-1 bg-orange-400 rounded-l-lg" />

              <div className="flex gap-3">

                {/* Icon */}
                <div className="pt-1">
                  <AlertTriangle size={18} className="text-orange-500" />
                </div>

                {/* Content */}
                <div>
                  <p className="text-sm font-semibold text-orange-800">
                    {alert.BuildingName || "-"}
                  </p>

                  <p className="text-sm text-orange-700 mt-1">
                    {alert.Issue || "-"}
                  </p>
                </div>

              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AlertsPanel;
