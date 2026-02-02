import React, { useEffect } from "react";
import { attendanceService } from "@/features/attendanceCalendar/services/AttendanceService";
import * as E from "fp-ts/Either";

// interface AttendanceRow {
//   AttendanceId: number;
//   Uniquekey?: string;
//   PunchOutDate?: string;
// }

const AttendancePunch: React.FC = () => {
  // const [isCheckedIn, setIsCheckedIn] = useState(false);
  // const [attendanceId, setAttendanceId] = useState<number>(0);
  // const [uniqueKey, setUniqueKey] = useState<string>("");

  const today = new Date().toISOString().split("T")[0];

  // ---------------- FIRST LOAD ----------------
  useEffect(() => {
    loadTodayAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    const params = {
      PageSize: 1,
      PageNumber: 1,
      StartDate: today,
      EndDate: today,
    };

    const response = await attendanceService.apiCallPullAttendance(params);

    if (E.isRight(response)) {
      // const row: AttendanceRow | undefined = response.right.Data?.[0];

      // if (row) {
      //   setAttendanceId(row.AttendanceId);
      //   setUniqueKey(row.Uniquekey || "");
      //   setIsCheckedIn(!row.PunchOutDate); // no punch out → checked in
      // }
    }
  };

  // ---------------- SWIPE CLICK ----------------
  const handleToggle = async () => {
    const payload = {
      AttendanceId: 0,
      Uniquekey: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      PunchAddress: "Borivali East, Mumbai – 400066",
    };

    const response = await attendanceService.apiCallAddUpdateAttendance(payload);

    if (E.isRight(response)) {
      // const data = response.right.Data;

      // setAttendanceId(data.AttendanceId);
      // setUniqueKey(data.Uniquekey);
      // setIsCheckedIn(prev => !prev);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 max-w-[380px]">

      {/* Header */}
      <div className="flex justify-between text-sm text-gray-500">
        <span>Workday Overview</span>
        <span className="bg-blue-100 text-blue-600 px-2 rounded">
          {new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Timer */}
      <div className="text-center mt-5">
        <h2 className="text-2xl font-semibold">00:00:00</h2>
        <small className="text-gray-400">9:00:00</small>
      </div>

      {/* Swipe */}
      <div
        onClick={handleToggle}
        className="mt-5 h-12 rounded-xl bg-blue-100 relative cursor-pointer overflow-hidden"
      >
        {/* <div
          className={`absolute top-0 bottom-0 w-12 bg-blue-600 flex items-center justify-center text-white text-xl transition-all
          ${isCheckedIn ? "right-0" : "left-0"}`}
        >
          {isCheckedIn ? "‹" : "›"}
        </div>

        <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-medium">
          {isCheckedIn ? "Swipe To Punch Out" : "Swipe To Punch In"}
        </div> */}
      </div>

      {/* Details */}
      <div className="text-sm mt-4 space-y-1">
        <div><b>Punch In :</b> 9:00 am</div>
        <div>Borivali East, Mumbai – 400066</div>
        <div><b>Punch Out :</b> --</div>
      </div>

    </div>
  );
};

export default AttendancePunch;
