import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import NoDataView from "@/ui/components/NoDataView/NoDataView";
import type { Table0, Table7 } from "../models/UserDashboardModel";
import { Modal } from "@/ui/components/Modal/Modal";
import { getSafeString } from "@/core/utils/comman";
import { DataTableWithOutBorder } from "@/ui/components/DataTable/DataTableWithoutBorder";
import { useState } from "react";

interface Props {
    attendanceSummaryData?: Table7[];
    employeeOverviewTable?: Table0[];
}

export default function AttendanceSummary({ attendanceSummaryData, employeeOverviewTable }: Props) {

    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const total = attendanceSummaryData?.[0]?.TotalEmployees;

    const data = [
        {
            name: "Present",
            value: attendanceSummaryData?.[0]?.PresentCount,
            color: "#135bec",
        },
        {
            name: "Absent",
            value: attendanceSummaryData?.[0]?.AbsentCount,
            color: "#13367A",
        },
        {
            name: "On Leave",
            value: attendanceSummaryData?.[0]?.OnLeaveCount,
            color: "#7a98a5",
        },
    ];

    const filteredEmployees = employeeOverviewTable?.filter((x) => {
        if (!selectedStatus) return true;

        switch (selectedStatus) {
            case "Present":
                return x.Status?.toLowerCase() === "present";

            case "Absent":
                return x.Status?.toLowerCase() === "absent";

            case "On Leave":
                return (
                    x.Status?.toLowerCase() === "leave" || x.Status?.toLowerCase() === "on leave"
                );

            default:
                return true;
        }
    }) ?? [];

    const employeeColumns = [
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
                <span className="text-black">
                    {(value || '')}
                </span>),
        },

        {
            key: "Status",
            label: "Status",
            align: "center",
            render: (value: string) => (
                <span className="text-black">
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
                    <span className=" text-black">
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
                    <span className="text-black">
                        {getSafeString(formattedTime)}
                    </span>
                );
            }
        },

    ]


    return (
        <div className="space-y-3 pt-5">
            <div className="bg-white p-5 rounded-xl  border border-gray-100 h-[370px]" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>
                <p className="text-md font-semibold pb-2">Attendance Summary</p>

                {(attendanceSummaryData?.length ?? 0 > 0) ? (
                    <>
                        <div className="grid grid-cols-2 items-center gap-4">
                            {/* Left DONUT */}
                            <div className="relative h-[220px] min-h-[220px] w-full min-w-0">
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie data={data} innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value" cornerRadius={10}>
                                            {data.map((t, i) => (
                                                <Cell key={i} fill={t.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>

                                {/* CENTER TOTAL */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                    <p className="text-xl font-bold text-gray-800">{total ?? 0}</p>
                                </div>
                            </div>

                            {/* Right LEGEND */}
                            <div className="space-y-3">
                                {data?.length > 0 ? (
                                    data.map((t, i) => (

                                        <div
                                            key={i}
                                            onClick={() => {
                                                if ((t.value ?? 0) > 0) {
                                                    setSelectedStatus(t.name);
                                                }
                                            }}
                                            className={`rounded-lg p-2 flex items-center gap-3 ${(t.value ?? 0) > 0
                                                    ? "cursor-pointer"
                                                    : "cursor-not-allowed opacity-50"
                                                }`}
                                        >

                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }}></div>

                                            <p className="font-semibold text-[22px]">{t.value ?? 0}</p>
                                            <p className="text-sm text-gray-500 font-medium">{t.name ?? "-"}</p>
                                        </div>
                                    ))
                                ) : (
                                    <NoDataView message="No data available" />
                                )}
                            </div>
                        </div>

                        <p className="text-sm font-bold text-left p-1 ml-20">{total ?? 0} Total Employees</p>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 text-center py-10">No attendance data available</p>
                )}
            </div>


            <Modal
                isOpen={!!selectedStatus}
                onClose={() => setSelectedStatus(null)}
                size="large80"
                title={
                    <div className="flex flex-col">
                        <span className="font-semibold text-base">
                            {selectedStatus} Employees
                        </span>

                        <span className="text-sm text-gray-500">
                            Total : {filteredEmployees.length}
                        </span>
                    </div>
                }
            >
                <DataTableWithOutBorder
                    data={filteredEmployees}
                    columns={employeeColumns}
                    emptyMessage="No Data Found"
                    className="flex-1"
                    fixedHeight={true}
                />
            </Modal>

        </div>
    );
}
