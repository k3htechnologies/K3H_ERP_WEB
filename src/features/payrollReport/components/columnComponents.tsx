import React from "react";
import polyline from "@mapbox/polyline";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { getStatusBadgeClasses } from "@/features/attendanceCalendar/utils/attendanceUtils";

export const EmployeeTooltip: React.FC<{ value: any }> = ({ value }) => (
  <TooltipText text={value || "-"} maxWidth="250px" tooltipThreshold={25} />
);

export const AddressTooltip: React.FC<{ value: any }> = ({ value }) => (
  <TooltipText text={value || "-"} maxWidth="200px" tooltipThreshold={20} />
);

export const StatusBadge: React.FC<{ value: any }> = ({ value }) => {
  const status = value || "-";
  if (status === "-") return <>-</>;

  const badge = getStatusBadgeClasses(status);

  return (
    <div className="flex items-center h-full">
      <div
        title={status}
        className="text-xs rounded border inline-flex items-center justify-center"
        style={{
          backgroundColor: `${badge.backgroundColor}20`,
          color: badge.color,
          borderColor: `${badge.backgroundColor}40`,
          height: "24px",
          width: "120px",
          fontSize: "12px",
          fontWeight: "500",
          padding: "0 8px",
          boxSizing: "border-box",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {status}
      </div>
    </div>
  );
};

export const MapLink: React.FC<{ value: any }> = ({ value }) => {
  const generateMapUrl = (): string => {
    if (!value) return "#";

    try {
      const decoded = polyline.decode(value) as [number, number][];
      if (!decoded.length) return "#";

      const origin = decoded[0];
      const destination = decoded[decoded.length - 1];

      const maxWaypoints = 20;
      const step = Math.ceil(decoded.length / maxWaypoints);

      const waypoints = decoded
        .filter((_, index) => index % step === 0)
        .map(([lat, lng]) => `${lat},${lng}`)
        .join("|");

      return `https://www.google.com/maps/dir/?api=1&origin=${origin[0]},${origin[1]}&destination=${destination[0]},${destination[1]}&waypoints=${waypoints}&travelmode=driving`;
    } catch {
      return "#";
    }
  };

  if (!value) return <>-</>;

  const url = generateMapUrl();
  if (url === "#") return <>-</>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline font-medium"
    >
      View Map
    </a>
  );
};
