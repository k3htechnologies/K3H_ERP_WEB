import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { Mail } from "lucide-react";
// import {for}
import { parseTimeFromISO, formatDate_dd_MonthName_yy_hh_mm } from "@/core/utils/dateFormat"

interface EmployeeTableData {
    Department: string;
    EmployeeCode: string;
    Message: string;
    Name: string;
    PunchIn?: string;
    PunchOut?: string;
    Status: string;
    EmailId?: string;
}

interface Props {
    employeeOverviewTable: EmployeeTableData[];
}

function sendEmail(email: string) {
    if (email) {
        window.location.href = `mailto:${email}`;
    } else {
        console.log('No email address provided');
    }
}

export default function EmployeeTable({ employeeOverviewTable = [] }: Props) {
    // console.log('employeeOverviewTable', employeeOverviewTable);
    const safeRender = (value: any) => {
        if (typeof value === 'object' && value !== null) {
            return '';
        }
        return value;
    };

    const columns = [
        { key: "Name", label: "Employee Name", render: safeRender },
        { key: "Department", label: "Department", render: safeRender },
        { key: "EmployeeCode", label: "Employee Code", render: safeRender },
        { key: "Status", label: "Status", render: safeRender },
        { key: "PunchIn", label: "Punch In", render: safeRender },
        { key: "PunchOut", label: "Punch Out", render: safeRender },
        {
            key: "action", label: "Action", align: "center" as any, render: (_: any, row: EmployeeTableData) => (

                <div className="flex items-center justify-center gap-2" onClick={() => sendEmail(row.EmailId || '')}>
                    <Mail className={`w-4 h-4 cursor-pointer ${row.EmailId ? 'text-blue-500' : 'text-blue-500'}`} />
                </div>
            )
        },
    ]

    // const dataWithDummyTime = employeeOverviewTable.map(emp => ({
    //     ...emp
    // }));

    // console.log("dataWithDummyTime", employeeOverviewTable);

    return (
        <div className="space-y-3 pt-5">
            <h2 className="text-sm font-semibold text-gray-800">
                Overview
            </h2>

            {employeeOverviewTable.length > 0 && <div className="bg-white rounded-xl shadow p-5 mt-5 h-[310px] flex flex-col">

                {/* Title */}
                <p className="text-md font-semibold text-gray-800">
                    Employee Overview (Team)
                </p>

                {/* Scrollable Table Area */}
                <div className="mt-5 flex-1 overflow-auto thin-scroll">
                    <DataTableWithOutBorder
                        data={employeeOverviewTable.slice(0, 7)}
                        columns={columns}
                        showRowBorders={true}
                    />
                </div>

            </div>}


        </div>

    )
}