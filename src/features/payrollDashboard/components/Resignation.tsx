import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useMemo } from "react";
import type { Table4 } from "@/features/payrollDashboard/models/PayrollDashboardModel";
import { LocalStorageHelper } from "@/core/utils/localStorageHelper";
import { getSafeString } from "@/core/utils/comman";
import { getNameInitials } from "@/core/utils/getNameInitials";

interface Props {
  resignationData: Table4[];
}

const Resignation: React.FC<Props> = ({ resignationData }) => {
  const loggedInUser = LocalStorageHelper.getStoredEmployeeData();

  const columns = useMemo<any[]>(
    () => [
      {
        key: "FullName",
        label: "Employee Name",
        align: "left",
        render: (value: string) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
               {getSafeString(getNameInitials(value))}
            </div>
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
        key: "ExpectedRelievingDate",
        label: "Relieving Date",
        align: "left",
        render: (value: string | null) => (
          <span className="font-medium text-black">
            {value ? formatDate_dd_MonthName_yy(value) : "-"}
          </span>
        ),
      },
      {
        key: "IsAnyOfferInHand",
        label: "Offer In Hand",
        align: "left",
        render: (value: boolean | null) => (
          <span className="font-medium text-black">
            {value ? "Yes" : "No"}
          </span>
        )

      },
      {
        key: "status",
        label: "Action",
        align: "center",
        render: (value: string | null, record: Table4) => {
          const isApproved = value === "Approved";
          const isOwnRecord = loggedInUser?.FullName === record.FullName;

          return (
            <button
              className={`px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm transition-colors ${isApproved || isOwnRecord
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={isApproved || isOwnRecord}
            >
              {isApproved ? "Approved" : "Approve"}
            </button>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Resignation</h2>
      <div className="bg-white rounded-lg space-y-4 p-4 h-[300px] border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
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