import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useNavigate } from "react-router-dom";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";


interface LeaveManagementRecord {
  FullName: string,
  NoOfDays: number,
  StartDate: string,
  EndDate: string,
  LeaveTypeMasterId: number
  status: "Approved" | "Pending";
}

interface Props {
  leaveData: LeaveManagementRecord[]
}

export default function LeaveManagement({ leaveData = [] }: Props) {
  const navigate = useNavigate();

  const columns = [
    {
      label: 'Employee Name',
      key: 'FullName',
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 " />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-black ">{value}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">Full-Stack Developer </span>
          </div>
        </div>
      )
    },
    {
      key: 'LeaveTypeMasterId',
      label: 'Leave Type',
      align: 'center' as const,
      render: (value: string) => (
        <span className="font-medium text-black text-base">{value}</span>
      )
    },
    {
      key: 'duration',
      label: 'Duration',
      width: '350px',
      align: 'center' as const,

      render: ( record: LeaveManagementRecord) => (
        <span className="font-medium text-black text-base">{formatDate_dd_MonthName_yy(record.StartDate)} - {formatDate_dd_MonthName_yy(record.EndDate)}</span>
      )
    },
    {
      key: 'noOfDays',
      label: 'No. Of Days',
      align: 'center' as const,
      render: (value: string, record: LeaveManagementRecord) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="font-medium text-black ">{record.NoOfDays} Days</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (value: string) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          {/* <span className="text-xs text-gray-500">{record.Status}</span> */}
          <span className="font-medium text-red-600">Pending</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      render: ( record: LeaveManagementRecord) => (
        <button
          className={`px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm ${record.status === "Approved"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {record.status === "Approved" ? "Approved" : "Approve"}
        </button>
      )
    },
    {
      key: 'viewAll',
      label: 'View All',
      align: 'center' as const,
      render: (_value: string, _record: LeaveManagementRecord) => (
        <span onClick={() => navigate('/payrollReport?tab=Leave')} className="text-blue-600 hover:text-blue-700 cursor-pointer">
          View All
        </span>
      )

    }

  ];

  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">Leave Management</h2>
      <div className="bg-white rounded-xl p-4 h-[295px]">
        <DataTableWithOutBorder
          columns={columns}
          data={leaveData.slice(0, 4)}
          emptyMessage="No Leave Records Found"
          fixedHeight={true}
        />
      </div>
    </div>
  )
}

