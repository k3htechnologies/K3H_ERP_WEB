import { DataTableWithHeaderRowDivider } from "@/ui/components/DataTable/DataTableWithHeaderRowDivider";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
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
        render: (value: string) => (
          <span className="font-medium text-black">
            {(value || '')}
          </span>
        )
      },
      {
        key: "CTSNumber",
        label: "CTS Number",
        align: "left",
        render: (value:string) => <TooltipText text={value || "-"} maxWidth="180px" tooltipThreshold={18} />,
        
      },
      {
        key: "TotalPlotAreaSqFt",
        label: "Plot Area (Sq.Ft)",
        align: "right",
        render: (value: any) => (
          <span className="font-medium text-black">
            {(Number(value || 0))}
          </span>
        )
      },
      {
        key: "CityName",
        label: "City",
        align: "left",
        render: (value:string) => <TooltipText text={value || "-"} maxWidth="180px" tooltipThreshold={18} />,
        
      },
      {
        key: "VillageName",
        label: "Village",
        align: "left",
        render: (value:string) => <TooltipText text={value || "-"} maxWidth="180px" tooltipThreshold={18} />,
        
      },
      {
        key: "WardName",
        label: "Ward",
        align: "left",
        render: (value:string) => <TooltipText text={value || "-"} maxWidth="180px" tooltipThreshold={18} />,
        
      },
    ],
    []
  );

  return (
    <div className="bg-white rounded-xl p-4 h-[475px]" style={{boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      <h3 className="text-sm text-gray-500 font-medium mb-3">
        Building Overview
      </h3>

      <DataTableWithHeaderRowDivider
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
