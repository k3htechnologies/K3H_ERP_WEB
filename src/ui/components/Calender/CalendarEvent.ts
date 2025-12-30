export interface CalendarEvent {
  id: string;
  title: string;
  type?: "TASK" | "MEETING" | "CONFERENCE";
  start: string;
  end?: string;
  description?: string;
  fullname?: string;
  projectName?: string;
  priority?: string;
  CreatedBy?: string | ''
  CreatedDate?: string | null
}
