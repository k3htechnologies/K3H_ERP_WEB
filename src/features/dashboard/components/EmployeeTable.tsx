import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Mail } from "lucide-react";
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import type { Table0 } from "../models/UserDashboardModel";
import { getSafeString } from "@/core/utils/comman";

interface EmployeeTableData {
    EmailId?: string;
}

interface Props {
    employeeOverviewTable: Table0[];
}

function sendEmail(email: string) {
    if (email) {
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, '_blank');
    }
}

export default function EmployeeTable({ employeeOverviewTable }: Props) {

    const columns = [
        {
            key: "EmployeeCode",
            label: "Employee Code",
            align: "left" as any,
            render: (value: string) => (
                <span className="font-medium text-black">
                    {(value || '')}
                </span>),
        },
        {
            key: "Name",
            label: "Employee Name",
            align: "left" as any,
            render: (value: string) => (<span className="font-medium text-black"> {(value || '')}  </span>),
        },
        {
            key: "DesignationName",
            label: "Designation",
            align: "left" as any,
            render: (value: string) => (
                <span className="font-medium text-black">
                    {(value || '')}
                </span>),
        },

        {
            key: "Status",
            label: "Status",
            align: "center",
            render: (value: string) => (
                <span className="font-medium text-black">
                    {(value || '')}
                </span>),
        },
        {
            key: "PunchIn",
            label: "Punch In",
            align: "center" as any,
            render: (value: any) => {
                if (!value || typeof value !== 'string') return '-';

                const parts = value.split(':');

                if (parts.length < 2) return '-';

                const formattedTime = `${Number(parts[0])}:${parts[1]}`;

                return (
                    <span className="font-medium text-black">
                        {getSafeString(formattedTime)}
                    </span>
                );
            }
        },
        {
            key: "PunchOut",
            label: "Punch Out",
            align: "center" as any,
            render: (value: any) => {
                if (!value || typeof value !== 'string') return '-';

                const parts = value.split(':');

                if (parts.length < 2) return '-';

                const formattedTime = `${Number(parts[0])}:${parts[1]}`;

                return (
                    <span className="font-medium text-black">
                        {getSafeString(formattedTime)}
                    </span>
                );
            }
        },
        {
            key: "Action",
            label: "Action",
            align: "center" as any,
            render: (_: any, row: EmployeeTableData) => (
                <div className="flex items-center justify-center gap-2 " onClick={() => sendEmail(row.EmailId || '')}>
                    <Mail className={`w-4 h-4 cursor-pointer ${row.EmailId ? 'text-blue-500' : 'text-gray-500'}`} />
                </div>
            )
        },
    ]

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 ml-1 sm:ml-2">Team Overview</h2>

            <div className="bg-white rounded-xl p-4 h-[310px] border border-gray-100 flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
               
                {employeeOverviewTable?.length > 0 ? (
                    <div className="min-w-[500px] sm:min-w-full flex-1 overflow-hidden flex flex-col">
                        <DataTableWithOutBorder
                            data={employeeOverviewTable}
                            columns={columns}
                            recordsPerPage={6}
                            fixedHeight={true}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center flex-1 text-center px-2">
                        <NoDataView message="No employee data available" />
                    </div>
                )}

            </div>
        </div>

    )
}