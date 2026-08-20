import type { TableColumn } from '@/ui/components/DataTable/DataTable'
import type { AddUpdateEventRequest } from '@/features/event/event/models/EventModel'

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'
export type TaskTab = 'Task' | 'Agenda Task'

export const DEFAULT_EVENT_UNIQUE_KEY = '3fa85f64-5717-4562-b3fc-2c963f66afa6'

export const INITIAL_EVENT_FORM_STATE: AddUpdateEventRequest = {
  EventId: 0,
  Uniquekey: DEFAULT_EVENT_UNIQUE_KEY,
  Type: '',
  Title: '',
  ProjectId: '',
  DepartmentId: '',
  EmployeeId: '',
  Date: '',
  DeadlineDate: '',
  StartTime: '',
  EndTime: '',
  Room: '',
  Priority: '',
  Description: '',
  DocumentURL: null,
  RemoveDocumentURL: '',
}

export const getInitialEventFormState = (): AddUpdateEventRequest => ({
  ...INITIAL_EVENT_FORM_STATE,
})

export const CALENDAR_VIEW_OPTIONS = [
  { id: 'dayGridMonth', name: 'Month' },
  { id: 'timeGridWeek', name: 'Week' },
  { id: 'timeGridDay', name: 'Day' },
] as const

export const EVENT_TAB_LIST = [
  { id: 'All', label: 'All' },
  { id: 'Task', label: 'Task' },
  { id: 'Meeting', label: 'Meeting' },
  { id: 'Conference', label: 'Conference' },
]

export const TASK_TABS = [
  { id: 'Task', label: 'Task' },
  { id: 'Agenda Task', label: 'Agenda Task' },
] as const

export const MEETING_PAGE_SIZE = 10

export const REQUIRED_MEETING_COLUMN_KEYS: string[] = ['MeetingType']

export const REQUIRED_TASK_COLUMN_KEYS: string[] = ['EventId', 'Action']

export const getMeetingCardOptions = (): TableColumn[] => [
  { key: 'MeetingType', label: 'Meeting Type', width: '25' },
  { key: 'Date', label: 'Date', width: '25' },
  { key: 'Location', label: 'Location', width: '25' },
  { key: 'Status', label: 'Status', width: '25' },
]

export const getAllMeetingColumnKeys = (): string[] =>
  getMeetingCardOptions().map((column) => column.key)

export const getTaskColumnKeys = (): string[] => [
  'EventId',
  'Title',
  'Priority',
  'DeadlineDate',
  'Action',
]
