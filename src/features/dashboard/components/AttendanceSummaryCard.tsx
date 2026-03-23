import { convert_hh_mm_ss_to_hh_mm } from "@/core/utils/dateFormat";

interface Props {
    attendanceSummaryShiftData: any[];
    attendancePresentData: any[];
}


export default function AttendanceSummaryCard({ attendanceSummaryShiftData = [], attendancePresentData = [] }: Props) {

    const presentData = attendancePresentData[0];
    const shiftData = attendanceSummaryShiftData[0];

    return (
        <div className="space-y-3 pt-4 sm:pt-5">
            <p className="text-sm sm:text-md font-semibold text-gray-800">
                Attendance Summary
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">

                {/* Card-1: Present Days */}
                <div className="w-full bg-green-100 shadow-sm rounded-md 
                    p-3 sm:p-4 border border-green-300 leading-loose">

                    <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1 sm:mb-2">
                        Present Days
                    </div>

                    <div className="font-bold text-base sm:text-lg text-green-600 mb-1 sm:mb-2">
                        {attendancePresentData?.length > 0
                            ? presentData?.PresentDays ?? 0
                            : "-"}
                    </div>

                    <div className="text-green-600 text-xs">
                        {attendancePresentData?.length > 0
                            ? "This Month"
                            : "No data"}
                    </div>

                </div>

                {/* Card-2: Shift Pattern */}
                <div className="w-full bg-purple-100 shadow-sm rounded-md 
                    p-3 sm:p-4 border border-purple-300 leading-loose">

                    <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1 sm:mb-2">
                        Shift Pattern
                    </div>

                    <div className="font-bold text-base sm:text-lg text-purple-600 mb-1 sm:mb-2 break-words">
                        {attendanceSummaryShiftData?.length > 0
                            ? shiftData?.ShiftName ?? "No Shift"
                            : "-"}
                    </div>

                    <div className="text-purple-600 text-xs break-words">
                        {attendanceSummaryShiftData?.length > 0 && shiftData
                            ? `${convert_hh_mm_ss_to_hh_mm(shiftData.ShiftBeginTime)} - ${convert_hh_mm_ss_to_hh_mm(shiftData.ShiftEndTime)}`
                            : "--"}
                    </div>

                </div>

            </div>
        </div>
    )
}