import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import React, { useMemo } from "react";

interface Props {
  buildingData: any[];
}

const BuildingOverview: React.FC<Props> = ({ buildingData }) => {

  const buildingColumns = useMemo<any[]>(
    () => [
      {
        key: "BuildingName",
        label: "Building Name",
        align: "left",
        render: (value: string) => value || "-"
      },
      {
        key: "CTSNumber",
        label: "CTS Number",
        align: "left",
        render: (value: string) => value || "-"
      },
      {
        key: "TotalPlotAreaSqFt",
        label: "Plot Area (Sq.Ft)",
        align: "right",
        render: (value: any) =>
          Number(value || 0).toLocaleString()
      }
    ],
    []
  );

  return (
    <div className="bg-white rounded-xl p-4 shadow">

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Building Overview
      </h3>

      <DataTableWithOutBorder
        data={buildingData}
        columns={buildingColumns}
        emptyMessage="No Building Data Found"
        fixedHeight={true}
        className="flex-1"
      />

    </div>
  );
};

export default BuildingOverview;
