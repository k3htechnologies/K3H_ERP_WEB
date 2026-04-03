import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { Table1 } from "@/features/payrollDashboard/models/PayrollDashboardModel";
import { getSafeString } from "@/core/utils/comman";
import { getNameInitials } from "@/core/utils/getNameInitials";

interface Props {
  leaveData: Table1[];
}

type LeaveManagementRecord = Table1 & { status?: string };

const LeaveManagement: React.FC<Props> = ({ leaveData }) => {
  const navigate = useNavigate();

  const columns = useMemo(
    () => [
      {
        label: 'Employee Name',
        key: 'FullName',
        align: 'left' as const,
        render: (value: string) => (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-sm shrink-0">
               {getSafeString(getNameInitials(value))}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-black">{getSafeString(value)}</span>
            </div>
          </div>
        )
      },
      {
        key: 'LeaveType',
        label: 'Leave Type',
        align: 'left' as const,
        render: (value: string) => (
          <span className="font-medium text-black text-sm">{value || '-'}</span>
        )
      },
      {
        key: 'duration',
        label: 'Duration',
        // align: 'center' as const,
        render: (_: any, record: LeaveManagementRecord) => (
          <span className="font-medium text-black text-sm">
            {formatDate_dd_MonthName_yy(record.StartDate || '')} - {formatDate_dd_MonthName_yy(record.EndDate || '')}
          </span>
        )
      },
      {
        key: 'noOfDays',
        label: 'No. Of Days',
        align: 'center' as const,
        render: (_: any, record: LeaveManagementRecord) => (
          <span className="font-medium text-black text-sm">{record.NoOfDays || 0} Days</span>
        )
      },
      {
        key: 'Status',
        label: 'Status',
        align: 'center' as const,
        render: (value: string) => {
          if (value === "Rejected") {
            return (
              <span className="font-medium text-red-600 text-sm">{value}</span>
            )
          }
          else {
            return (
              <span className="font-medium text-green-600 text-sm">{value}</span>
            )
          }
        }
      },
      {
        key: 'action',
        label: 'Action',
        align: 'center' as const,
        render: (_: any, record: Table1) => {

          const isDisabled = record.CanApprove === 0;

          return (
            <button
              className={`px-4 py-1 rounded-md text-sm font-medium text-white transition-colors ${isDisabled
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
                }`}
              disabled={isDisabled}
            >
              {record.Status === "Approved" ? "Approved" : "Approve"}
            </button>
          );
        }
      },
    ],
    [navigate]
  );

  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Leave Management</h2>
      <div className="bg-white rounded-lg  p-4 h-[300px] border border-gray-100 overflow-y-auto thin-scroll" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
        <DataTableWithOutBorder
          columns={columns}
          data={leaveData || []}
          emptyMessage="No Data Available"
          fixedHeight={true}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default LeaveManagement;