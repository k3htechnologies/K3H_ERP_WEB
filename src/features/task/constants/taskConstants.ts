export const TASK_TYPE = {
    Task: 'Task',
    SubTask: 'SubTask',
} as const

export const DISCUSSION_SORT_OPTIONS = [
    { label: 'Most recent', value: 'Most recent' },
    { label: 'Oldest first', value: 'Oldest first' },
] as const

export const DISCUSSION_PAGE_SIZE = 100

export const MENTION_TOKEN_REGEX = /(@[A-Za-z][A-Za-z\s]*?)(?=\s|$|[.,!?])/g

export const ALLOWED_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
export const MAX_ATTACHMENT_SIZE_MB = 10
export const MAX_ATTACHMENT_FILES = 5

export const TIMELINE_ACTIVITY_WIDTH = 320
export const TIMELINE_COLUMN_WIDTH = 112
export const TIMELINE_ROW_HEIGHT = 88
