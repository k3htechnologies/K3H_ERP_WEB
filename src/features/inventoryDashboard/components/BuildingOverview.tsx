import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import React, { useMemo } from "react";

interface Props {
  buildingOverviewData: any[];
}

const BuildingOverview: React.FC<Props> = ({ buildingOverviewData }) => {

  const buildingColumns = useMemo<any[]>(
    () => [
      {
        key: "Building",
        label: "Building",
        align: "left",
        render: (value: string) => (
          <span className="font-medium text-black">
            {(value || '')}
          </span>
        )
      },
      {
        key: "Basement",
        label: "Basement",
        align: "center",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
      {
        key: "Podiums",
        label: "Podiums",
        align: "center",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
      {
        key: "Wings",
        label: "Wings",
        align: "center",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
      {
        key: "Floors",
        label: "Floors",
        align: "center",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
      {
        key: "Units",
        label: "Units",
        align: "center",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
      {
        key: "Parking",
        label: "Parking",
        align: "center",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
    ],
    []
  );

  return (

    <div className="space-y-3 ">

      <h2 className="text-lg font-semibold text-gray-800">
        Building Overview
      </h2>

      <div className="bg-white rounded-xl p-4 h-[500px]" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

        <DataTableWithOutBorder
          data={buildingOverviewData}
          columns={buildingColumns}
          emptyMessage="No Building Data Found"
          fixedHeight={true}
          className="flex-1"
        />

      </div>
    </div>
  );
};

export default BuildingOverview;
