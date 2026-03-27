import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import TooltipText from "@/ui/components/Tooltip/TooltipText";
import { useMemo } from "react";
import type { Table4 } from "@/features/payrollDashboard/models/PayrollDashboardModel";

interface Props {
  resignationData: Table4[];
}

const Resignation: React.FC<Props> = ({ resignationData }) => {
  const columns = useMemo<any[]>(
    () => [
      {
        key: "FullName",
        label: "Employee Name",
        align: "left",
        render: (value: string | null) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-200" />
            <span className="text-sm font-medium text-black">
              {value || "-"}
            </span>
          </div>
        ),
      },
      {
        key: "ResignationDate",
        label: "Resignation Date",
        align: "left",
        render: (value: string | null) => (
          <span className="font-medium text-black">
            {value ? formatDate_dd_MonthName_yy(value) : "-"}
          </span>
        ),
      },
      {
        key: "RelievingDate",
        label: "Relieving Date",
        align: "left",
        render: (value: string | null) => (
          <span className="font-medium text-black">
            {value ? formatDate_dd_MonthName_yy(value) : "-"}
          </span>
        ),
      },
      {
        key: "OfferInHand",
        label: "Offer In Hand",
        align: "left",
        render: (value: string | null) => (
          <TooltipText
            text={value || '-'}
            maxWidth="200px"
            tooltipThreshold={20}
          />
        )
      },
      {
        key: "status",
        label: "Action",
        align: "center",
        render: (value: string | null) => (
          <button
            className={`px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm ${value === "Approved"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              }`}
            disabled={value === "Approved"}
          >
            {value === "Approved" ? "Approved" : "Approve"}
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Resignation</h2>
      <div className="bg-white rounded-lg space-y-4 p-4 h-[300px] shadow-sm">
        <DataTableWithOutBorder
          columns={columns}
          data={resignationData?.slice(0, 4) || []}
          emptyMessage="No Data Available"
          fixedHeight={true}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default Resignation;