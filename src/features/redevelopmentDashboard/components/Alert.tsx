import React from "react";

interface Props {
  alertsData: any[];
}

const AlertsPanel: React.FC<Props> = ({ alertsData }) => {

  return (
    <div className="bg-white rounded-xl p-4 h-[500px] flex flex-col" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <h3 className="text-sm text-gray-500 font-medium mb-4">
        Alerts
      </h3>

      {/* Scroll Area */}
      <div className="flex-1 overflow-y-auto thin-scroll space-y-4 pr-1">

        {alertsData.length === 0 && (
          <p className="text-sm text-gray-400 text-center mt-10">
            No alerts available
          </p>
        )}

        {alertsData.map((alert, i) => (
          <div key={i} className="flex items-start justify-between">

            <div>
              <p className="text-sm font-medium text-gray-800">
                {alert.BuildingName || "-"}
                <span className="text-gray-400 ml-2">
                  {alert.UnitNumber || "-"}
                </span>
              </p>

              <p className="text-sm text-gray-600 mt-1">
                {alert.Issue || "-"}
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
};

export default AlertsPanel;
