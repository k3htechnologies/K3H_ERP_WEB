export interface CalendarEvent {
  id: string | number;
  title: string;
  type?: "TASK" | "MEETING" | "CONFERENCE";
  color?: "blue" | "orange" | "green";
  start: string;
  end?: string;
  description?: string;
  fullname?: string;
  projectName?: string;
  priority?: string;
  CreatedBy?: string | ''
  CreatedDate?: string | null
}
