import React from "react";

interface Props {
  alertsData: any[];
}

const AlertsPanel: React.FC<Props> = ({ alertsData }) => {

  return (
    <div className="bg-white rounded-xl p-4">

      <h3 className="text-sm text-gray-500 mb-4">
        Alerts
      </h3>

      <div className="space-y-4">

        {alertsData.map((alert, i) => (
          <div
            key={i}
            className="flex items-start justify-between"
          >

            {/* LEFT */}
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
