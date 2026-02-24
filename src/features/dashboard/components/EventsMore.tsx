import { Mail, Phone, Send } from "lucide-react";


interface BirthdayData {
    BirthDay: number;
    BirthMonth: number;
    DateOfBirth: string;
    FullName: string;
    MetaInformation: string;
}

interface ReportingData {
    DepartmentName: string;
    DesignationName: string;
    ManagerEmail: string;
    ManagerName: string;
    ManagerPhone: string;
}

interface Props {
    birthdays: BirthdayData[];
    reportingData: ReportingData[];
}


export default function EventsMore({ birthdays = [], reportingData = [] }: Props) {
    console.log("reportingData", reportingData);


    function formatDate(dateString: string) {
        const date = new Date(dateString);

        const day = date.getDate().toString().padStart(2, "0");
        const month = date.toLocaleString("en-GB", { month: "long" });

        return `${day}, ${month}`;
    }


    return (
        <div className="space-y-3 pt-5">
            <p className="text-md font-semibold text-gray-800">Events & More</p>
            <div className="grid grid-cols-3 gap-4">
                {/* Card-1: Upcoming Birthday */}

                {/* Birthday Card Map here */}
                {birthdays.length > 0 &&
                    <div className="bg-white rounded-xl shadow p-5 flex flex-col justify-between   ">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-base font-semibold text-gray-800">Upcoming Birthday</p>
                        </div>
                        {birthdays.map((item, index) => (
                            <div key={index}>
                               
                                <p className="text-sm font-semibold text-gray-800">{item.FullName}</p>
                                <div className="flex item-center justify-between">
                                    <p className="text-sm text-gray-500">{formatDate(item.DateOfBirth)}</p>
                                    <button className="bg-blue-600 text-white text-xs px-4 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors">
                                        Send <Send size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>}

                {/* Card-2: Upcoming Events */}

                <div className="bg-white rounded-xl shadow p-5 flex flex-col">
                    
                    <p className="text-base font-semibold text-gray-800 mb-5">Upcoming Events</p>

                    <div className="space-y-5">
                        {/* Event 1 */}
                        <div className="flex gap-6">
                            <div className="min-w-[90px]">
                                <p className="text-xs text-gray-500">21 October 2025</p>
                                <p className="text-xs text-gray-500">Monday</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Diwali Celebration</p>
                                <p className="text-xs text-gray-500">Andheri</p>
                            </div>
                        </div>

                        {/* Event 2 */}
                        <div className="flex gap-6">
                            <div className="min-w-[90px]">
                                <p className="text-xs text-gray-500">21 October 2025</p>
                                <p className="text-xs text-gray-500">Monday</p>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Team Building Program</p>
                                <p className="text-xs text-gray-500">Borivali</p>
                            </div>
                        </div>
                    </div>
                </div>


                {reportingData.length > 0 &&
                    <div className="bg-white rounded-xl shadow p-5">
                        <p className="text-base font-semibold text-gray-800 mb-5">Reporting Manager</p>

                        {reportingData.map((item, index) => (
                            <div key={index} className="flex gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
                                    <img
                                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                                        alt="Prachin Bari"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-800">
                                        {typeof item.ManagerName === 'object' ? JSON.stringify(item.ManagerName) : item.ManagerName}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">
                                        {typeof item.DesignationName === 'object' ? JSON.stringify(item.DesignationName) : item.DesignationName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {typeof item.DepartmentName === 'object' ? JSON.stringify(item.DepartmentName) : item.DepartmentName}
                                    </p>

                                    <div className="pt-2 space-y-1.5">
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Mail size={14} className="text-blue-600" />
                                            <span>
                                                {typeof item.ManagerEmail === 'object' ? JSON.stringify(item.ManagerEmail) : item.ManagerEmail}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                            <Phone size={14} className="text-blue-600" />
                                            <span>
                                                {typeof item.ManagerPhone === 'object' ? JSON.stringify(item.ManagerPhone) : item.ManagerPhone}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                }

                {/* Card-3: Reporting Manager */}

            </div>
        </div>
    )
}