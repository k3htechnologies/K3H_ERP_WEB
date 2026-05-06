import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { Table0 } from "@/features/crmDashboard/models/CrmDashboardModel";
import NoDataView from "@/ui/components/NoDataView/NoDataView";

interface Props {
    bookingRegisteredData: Table0[];
}

// 🎨 Colors (Green, Orange, Blue)
const COLORS = ["#22C55E", "#F59E0B", "#2563EB"];

const BookingOverview: React.FC<Props> = ({ bookingRegisteredData }) => {

    // 👉 Get single object
    const data = bookingRegisteredData[0] || {};

    // 👉 Prepare chart data
    const chartData = [
        {
            name: "Registered Bookings",
            value: data.RegisteredBooking ?? 0,
        },
        {
            name: "Non-Registered Bookings",
            value: data.NonRegisteredBooking ?? 0,
        },
        {
            name: "Upcoming Registrations",
            value: data.UpcomingRegistration ?? 0,
        },
    ];

    // 👉 Total
    const total =
        (data.RegisteredBooking ?? 0) +
        (data.NonRegisteredBooking ?? 0) +
        (data.UpcomingRegistration ?? 0);

    return (
        <div className="pt-5">
            <h2 className="text-lg font-semibold text-gray-800">Booking Overview</h2>
            <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col" style={{ boxShadow: "0px 1px 2px rgba(0,0,0,0.05)" }}>


                {/* ================= PIE CHART ================= */}
                <div className="relative h-[170px] w-full max-w-[280px]">

                    {total === 0 ? (
                        <div className="flex justify-center items-center h-full">
                            <NoDataView />
                        </div>
                    ) : (
                        <>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius="60%"
                                        outerRadius="80%"
                                        paddingAngle={3}
                                        dataKey="value"
                                        cornerRadius={10}
                                    >
                                        {chartData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>

                            {/* CENTER TOTAL */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <p className="text-xl font-bold text-gray-800">{total}</p>
                                <p className="text-xs text-gray-500">Total</p>
                            </div>
                        </>
                    )}
                </div>

                {/* ================= LEGEND BELOW ================= */}
                <div className="w-full max-w-[280px] space-y-3 mt-4">

                    {chartData.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">

                            {/* LEFT */}
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[i] }}
                                />
                                <p className="text-sm text-gray-700">{item.name}</p>
                            </div>

                            {/* RIGHT VALUE */}
                            <p className="text-sm font-semibold text-gray-800">
                                {item.value}
                            </p>
                        </div>
                    ))}

                    {/* TOTAL LINE */}
                    <div className="pt-2">
                        <p className="text-sm text-gray-500">
                            Total Registration :{" "}
                            <span className="font-semibold text-gray-800">{total}</span>
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BookingOverview;