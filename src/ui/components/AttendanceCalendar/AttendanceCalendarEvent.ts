export interface AttendanceCalendarEvent {
  id: string;
  title: string;
  type?: "PRESENT" | "ABSENT" | "LEAVE" | "HOLIDAY" | "LATE IN" | "HALF_DAY" | "WEEK OFF" | "EARLY LEAVE" | "COMP_OFF";
  start: string;
  end?: string;
  description?: string;
  employeeName?: string;
  employeeId?: string;
  status?: string;
  punchIn?: string;
  punchOut?: string;
  CreatedBy?: string | ''
  CreatedDate?: string | null
}


















