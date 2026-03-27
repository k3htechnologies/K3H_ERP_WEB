import { Mail, Phone, Send } from "lucide-react";
import { getSafeString } from "@/core/utils/comman";
import type { Table8, Table10 } from "../models/UserDashboardModel";
import { formatDate_Day_MonthName } from "@/core/utils/dateFormat";

interface Props {
    birthdays: Table8[];
    reportingData: Table10[];
}

export default function EventsMore({ birthdays, reportingData }: Props) {

    const hasValidManager =
        Array.isArray(reportingData) &&
        reportingData.length > 0 &&
        typeof reportingData[0]?.ManagerName === "string" &&
        reportingData[0]?.ManagerName.trim() !== "";

    return (
        <div className="space-y-3 pt-5 px-2 lg:px-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 ml-1 sm:ml-2">
                Events & More
            </h2>

            <div className="flex flex-col lg:flex-row gap-4 w-full items-stretch">

                {/* Card-1: Upcoming Birthday */}
                <div className="bg-white rounded-xl p-5 flex flex-col flex-2 h-[220px] shadow-sm">

                    {/* Header */}
                    <p className="text-md font-semibold text-gray-500 pb-2 shrink-0">
                        Upcoming Birthdays
                    </p>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto thin-scroll pr-1">
                        {birthdays?.length > 0 ? (
                            birthdays.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg shrink-0">
                                            {getSafeString(item.FullName).charAt(0).toUpperCase() || '?'}
                                        </div>

                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {getSafeString(item.FullName)}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {getSafeString(item.DepartmentName)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {item.DateOfBirth ? formatDate_Day_MonthName(item.DateOfBirth) : '-'}
                                        </span>

                                        <button
                                            disabled
                                            className="bg-blue-600 text-white text-[10px] px-4 py-1.5 rounded flex items-center gap-1 opacity-50 cursor-not-allowed"
                                        >
                                            Send <Send size={10} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-sm text-gray-500">
                                    No upcoming birthdays
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Card-2: Upcoming Events */}
                <div className="bg-white rounded-xl p-5 flex flex-col flex-2 h-[220px] shadow-sm ">

                    {/* Header */}
                    <p className="text-md font-semibold text-gray-500 pb-2 shrink-0">
                        Upcoming Events
                    </p>

                    {/* Content */}
                    <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
                        Coming Soon
                    </div>
                </div>

                {/* Card-3: Reporting Manager */}
                {hasValidManager && (
                    <div className="bg-white rounded-xl p-5 flex flex-col flex-1 h-[220px] shadow-sm">

                        {/* Header */}
                        <p className="text-md font-semibold text-gray-500 pb-2 shrink-0">
                            Reporting Manager
                        </p>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto thin-scroll">
                            {reportingData?.length > 0 ? (
                                reportingData.map((item, index) => (
                                    <div key={index} className="flex gap-3 mt-2">

                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-lg shrink-0">
                                            {getSafeString(item?.ManagerName).charAt(0).toUpperCase() || '?'}
                                        </div>

                                        {/* Info */}
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-800">
                                                {getSafeString(item?.ManagerName)}
                                            </p>

                                            <p className="text-xs text-gray-500 font-medium">
                                                {getSafeString(item.ManagerDesignation || (item as any).DesignationName)}
                                            </p>

                                            <p className="text-xs text-gray-400">
                                                {getSafeString(item.ManagerDepartment || (item as any).DepartmentName)}
                                            </p>

                                            <div className="pt-2 space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Mail size={14} className="text-blue-600 shrink-0" />
                                                    <a
                                                        href={`mailto:${getSafeString(item.ManagerEmail, "")}`}
                                                        className="text-blue-600 text-sm hover:underline truncate"
                                                    >
                                                        {getSafeString(item?.ManagerEmail)}
                                                    </a>
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone size={14} className="text-blue-600 shrink-0" />
                                                    <a
                                                        href={`tel:${getSafeString(item.ManagerPhone, "")}`}
                                                        className="hover:text-blue-600 transition-colors text-sm"
                                                    >
                                                        {getSafeString(item.ManagerPhone)}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-sm text-gray-500">
                                        No data available
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}