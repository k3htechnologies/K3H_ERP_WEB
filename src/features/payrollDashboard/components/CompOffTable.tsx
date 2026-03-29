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
    },
    {
      key: 'action',
      label: 'Action',
      align: 'center' as const,
      width: "150px",
    }
  ];
  return (
    <div className="space-y-3 pt-5">
      <h2 className="text-lg font-semibold text-gray-800">
        Comp-Off Management
      </h2>
      <div className="bg-white rounded-xl p-4 h-[300px] border border-gray-100" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>

      
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
