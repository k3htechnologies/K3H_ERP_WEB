
interface AttendanceSummaryShiftData {
    AvgLoginTime: string;
    Message: string;
    PresentDays: number;
    ShiftEndTime: string;
    ShiftPattern: string;
    ShiftStartTime: string;

}

interface AttendancePresentData {
    PresentDays: number;
}

interface Props {
    attendanceSummaryShiftData: AttendanceSummaryShiftData[];
    attendancePresentData: AttendancePresentData[];
}


export default function AttendanceSummaryCard({ attendanceSummaryShiftData = [], attendancePresentData = [] }: Props) {

    // Safety check for first elements
    const presentData = attendancePresentData[0];
    const shiftData = attendanceSummaryShiftData[0];

    function formatTime(timeString: string | undefined) {
        if (!timeString) return "--";
        try {
            const [hours] = timeString.split(":");
            const hourNum = parseInt(hours, 10);
            const period = hourNum >= 12 ? "PM" : "AM";
            const formattedHour = hourNum % 12 || 12;
            return `${formattedHour} ${period}`;
        } catch (e) {
            return "--";
        }
    }

    return (
        <div className="space-y-3 pt-5">
            <p className="text-md font-semibold text-gray-800">Attendance Summary</p>
            <div>
                <div className="grid grid-cols-2 gap-3">
                    {/* card-1 */}
                    {attendancePresentData.length > 0 && <div className="w-full bg-green-100 shadow-sm rounded-md p-2 border border-green-300 mt-2 leading-loose ">
                        <div className="text-sm">Attendance Summary</div>
                        {/* Use Optional Chaining or Short-circuit */}
                        <div className="font-bold text-lg text-green-500">
                            {presentData?.PresentDays ?? 0}
                        </div>
                        <div className="text-green-500 text-xs">This Month</div>
                    </div>}


                    {/* Card-2 */}
                    {attendanceSummaryShiftData.length > 0 && <div className="w-full bg-purple-100 shadow-sm rounded-md p-2 border border-purple-200 mt-2 leading-loose">
                        <div className="text-sm">Shift Pattern</div>
                        <div className="font-bold text-purple-600 truncate">
                            {shiftData?.ShiftPattern || "No Shift"}
                        </div>
                        <div className="font-bold text-purple-600 text-sm">
                            {shiftData ? `${formatTime(shiftData.ShiftStartTime)} - ${formatTime(shiftData.ShiftEndTime)}` : "Not Assigned"}
                        </div>
                    </div>}
                </div>
            </div>
        </div>
    )
}