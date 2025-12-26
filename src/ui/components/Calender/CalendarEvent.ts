export interface CalendarEvent {
  id: string;
  title: string;
  type?: "TASK" | "MEETING" | "CONFERENCE";
  start: string;
  end?: string;
  description?: string;
  CreatedBy?: string | ''
  CreatedDate?: string | null
}
