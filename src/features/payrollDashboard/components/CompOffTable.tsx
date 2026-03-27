import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { formatDate_dd_MonthName_yy } from "@/core/utils/dateFormat";
import type { Table2 } from "@/features/payrollDashboard/models/PayrollDashboardModel";
import { getSafeString } from "@/core/utils/comman";

interface Props {
  compOffData: Table2[];
}

export default function CompOffTable({ compOffData }: Props) {
  const columns = [

    {
      key: "CreatedBy",
      label: "Employee Name",
      align: "left" as const,
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg shrink-0">
            {getSafeString(value).charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-black ">{getSafeString(value)}</span>
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
      // render: (value: string) => (
      //   <div className="flex flex-col">
      //     <span className="font-medium text-gray-900">{value}</span>
      //     <span className="text-xs text-gray-500">{record.Status}</span>
      //   </div>
      // )
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      width: "150px",
      // render: (record: CompOffTableRecord) => (
      //   <button
      //     className={`px-4 py-1 rounded-md text-sm font-medium text-white ${record.Status === "Approved"
      //       ? "bg-blue-500 "
      //       : "bg-gray-400 cursor-not-allowed"
      //       }`}
      //   >
      //     {record.Status === "Approved" ? "Approve" : "Approved"}
      //   </button>
      // )
    }
  ];
  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Comp-Off Management
      </h2>
      <div
        className="bg-white rounded-xl p-4 h-[300px] shadow-sm"

      >
        {compOffData?.length > 0 ? (
          <DataTableWithOutBorder
            columns={columns}
            data={compOffData.slice(0, 4)}
            emptyMessage="No records Found"
            fixedHeight={true}
          />
        ) : (
          <div>
            <DataTableWithOutBorder
              columns={columns}
              data={[]}
              emptyMessage="No Data Available"
            />
          </div>
        )}
      </div>
    </div>
  );
};

