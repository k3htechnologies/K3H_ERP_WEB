import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";

interface CompOffTableRecord {
  CompoffDate: string,
  WorkingDate: string,
  CreatedBy: string,
  CreatedDate: string,
  status: "Approved" | "Pending";
}

interface Props {
  compOffData: CompOffTableRecord[];
}

export default function CompOffTable({ compOffData = [] }: Props) {
  const columns = [

    {
      key: "CreatedBy",
      label: "Employee Name",
      align: "left" as const,
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-200 " />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-black ">{value}</span>
            <span className="text-xs text-gray-400 font-medium mt-1">Full-Stack Developer </span>
          </div>
        </div>
      ),
    },
    {
      key: "CompoffDate",
      label: "Comp-Off Date",
      render: (value: string) => <span className="font-medium text-black">{formatDate_dd_MonthName_yy(value)}</span>,
    },
    {
      key: "WorkingDate",
      label: "Working Date",
      render: (value: string) => <span className="font-medium text-black">{formatDate_dd_MonthName_yy(value)}</span>,
    },

    {
      key: "CreatedDate",
      label: "Requested Date",
      render: (value: string) => <span className="font-medium text-black">{formatDate_dd_MonthName_yy(value)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (value: string, record: CompOffTableRecord) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          {/* <span className="text-xs text-gray-500">{record.Status}</span> */}
          <span className="font-medium text-green-700 ">Approved</span>
        </div>
      )
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      width: "150px",
      render: (value: string, record: CompOffTableRecord) => (
        <button
          className={`px-4 py-1 rounded-md text-sm font-medium text-white shadow-sm ${record.status === "Approved"
            ? "bg-blue-500 "
            : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {record.status === "Approved" ? "Approve" : "Approved"}
        </button>
      )
    }
  ];
  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Comp-Off Management
      </h2>
      <div
        className="bg-white rounded-xl p-4 h-[300px] "
        style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}
      >
        <DataTableWithOutBorder
          columns={columns}
          data={compOffData.slice(0, 4)}
          emptyMessage="No records Found"
          fixedHeight={true}
          showRowBorders={true}
        />
      </div>
    </div>
  );
};

