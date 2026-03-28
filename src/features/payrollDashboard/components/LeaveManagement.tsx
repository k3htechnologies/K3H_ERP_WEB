import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useNavigate } from "react-router-dom";


interface LeaveManagementRecord {
  FullName: string,
  NoOfDays: number,
  StartDate: string,
  EndDate: string,
  LeaveTypeMasterId: number
  Status: "Approved" | "Pending";
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
      key: 'LeaveType',
      label: 'Leave Type',
      align: 'center' as const,
      render: (value: string) => (
        <span className="font-medium text-black text-base">{value}</span>
      )
    },
    {
      key: 'NoOfDays',
      label: 'Duration',
      width: '350px',
      align: 'center' as const,

      render: (value: string) => (
        <span className="font-medium text-black text-base">{value}</span>
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
      key: 'Status',
      label: 'Status',
      align: 'center' as const,
      render: (value: string, record: LeaveManagementRecord) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value || record.Status}</span>
          <span className="font-medium text-red-600">{(value || record.Status) === 'Pending' ? 'Pending' : ''}</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      render: (_value: any, record: LeaveManagementRecord) => (
        <button
          className={`px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm ${record?.Status === "Approved"
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {record?.Status === "Approved" ? "Approved" : "Approve"}
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

