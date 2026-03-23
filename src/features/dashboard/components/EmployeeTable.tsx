import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Mail } from "lucide-react";
import NoDataView from '@/ui/components/NoDataView/NoDataView';


interface EmployeeTableData {
    EmailId?: string;
}

interface Props {
    employeeOverviewTable: any[];
}

function sendEmail(email: string) {
    if (email) {
        window.location.href = `mailto:${email}`;
    }
}

export default function EmployeeTable({ employeeOverviewTable = [] }: Props) {

    const columns = [
        {
            key: "Name",
            label: "Employee Name",
            align:"left" as any,
            render: (value: string) => (<span className="font-medium text-black"> {(value || '')}  </span>),
        },
        {
            key: "Department",
            label: "Department",
            align:"left" as any,
            render: (value: string) => (
                <span className="font-medium text-black">
                    {(value || '')}
                </span>),
        },
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
            key: "Status",
            label: "Status",
            align:"center",
            render: (value: string) => (
                <span className="font-medium text-black">
                    {(value || '')}
                </span>),
        },
        {
            key: "PunchIn",
            label: "Punch In",
            align:"center" as any,
            render: (value: string) => (
                <span className="font-medium text-black">
                    {value ? (value ?? '00:00') : '-'}
                </span>)
        },
        {
            key: "PunchOut",
            label: "Punch Out",
            align:"center" as any,
            render: (value: string) => (
                <span className="font-medium text-black">
                    {value ? (value ?? '00:00') : '-'}
                </span>)
        },
        {
            key: "Action",
            label: "Action",
            align: "center" as any,
            render: (_: any, row: EmployeeTableData) => (
                <div className="flex items-center justify-center gap-2" onClick={() => sendEmail(row.EmailId || '')}>
                    <Mail className={`w-4 h-4 cursor-pointer ${row.EmailId ? 'text-blue-500' : 'text-gray-500'}`} />
                </div>
            )
        },
    ]

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 ml-1 sm:ml-2">Team Overview</h2>

            <div className="bg-white rounded-xl p-4 sm:p-5 mt-3 flex flex-col   min-h-[250px] sm:min-h-[310px] max-h-[60vh]">

                {/* Content */}

                {employeeOverviewTable?.length > 0 ? (
                    <div className="min-w-[500px] sm:min-w-full">
                        <DataTableWithOutBorder
                            data={employeeOverviewTable}
                            columns={columns}
                            fixedHeight={true}
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-center px-2">
                        <NoDataView message="No employee data available" />
                    </div>
                )}

            </div>
        </div>

    )
}