export interface CalendarEvent {
  id: string | number;
  title: string;
  color?: "blue" | "orange" | "green";
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
