import { Mail, Phone, Send } from "lucide-react";
import NoDataView from '@/ui/components/NoDataView/NoDataView';
import { convert_yy_mm_dd_To_dd_mm_yyyy } from "@/core/utils/dateFormat";

interface Props {
    birthdays: any[];
    reportingData: any[];
}

export default function EventsMore({ birthdays = [], reportingData = [] }: Props) {



    return (
        <div className="space-y-3 pt-5 px-2 lg:px-0">
            <p className="text-md font-semibold text-gray-800 ml-2">Events & More</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Card-1: Upcoming Birthday*/}
                <div className="bg-white rounded-xl p-5 flex flex-col h-full shadow-sm min-h-[250px]">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                        <p className="text-base font-semibold text-gray-800">
                            Upcoming Birthday
                        </p>
                    </div>

                    <div className="h-42 overflow-y-auto thin-scroll overflow-x-hidden pr-1">
                        {birthdays?.length > 0 ? (
                            birthdays.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                            <img
                                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {item.FullName ?? '-'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {item.DepartmentName ?? '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 ml-2">
                                        <span className="text-xs text-gray-500 whitespace-nowrap">
                                            {item.DateOfBirth ? convert_yy_mm_dd_To_dd_mm_yyyy(item.DateOfBirth) : '-'}
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
                            <p className="text-sm text-gray-500 text-center py-6">
                                No upcoming birthdays
                            </p>
                        )}
                    </div>
                </div>

                {/* Card-2: Upcoming Events */}
                <div className="bg-white rounded-xl p-5 flex flex-col shadow-sm min-h-[250px]">
                    <p className="text-base font-semibold text-gray-800 mb-5">Upcoming Events</p>
                    <div className="flex-grow flex items-center justify-center">
                        <NoDataView message="No upcoming events" />
                    </div>
                </div>

                {/* Card-3: Reporting Manager */}
                <div className="bg-white rounded-xl p-5 shadow-sm min-h-[250px] md:col-span-2 lg:col-span-1">
                    <p className="text-base font-semibold text-gray-800 mb-5">
                        Reporting Manager
                    </p>

                    {reportingData?.length > 0 ? (
                        reportingData.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                                        alt="Manager"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-800">
                                        {item?.ManagerName ?? '-'}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {item.ManagerDesignation ?? '-'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {item.ManagerDepartment ?? '-'}
                                    </p>

                                    <div className="pt-2 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Mail size={14} className="text-blue-600 shrink-0" />
                                            <a
                                                href={`mailto:${item.ManagerEmail}`}
                                                className="text-blue-600 hover:underline truncate"
                                            >
                                                {item?.ManagerEmail || '-'}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Phone size={14} className="text-blue-600 shrink-0" />
                                            <a
                                                href={`tel:${item.ManagerPhone}`}
                                                className="hover:text-blue-600 transition-colors"
                                            >
                                                {item.ManagerPhone || '-'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-6">
                            No data available
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}