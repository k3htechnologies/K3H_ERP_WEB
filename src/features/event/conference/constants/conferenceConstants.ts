import { EVENT_TYPE } from '@/core/constants'

export type ConferenceScheduleView = 'month' | 'day'

export const CONFERENCE_EVENT_TYPE = String(
  EVENT_TYPE.find((type) => String(type.name).toUpperCase().includes('CONFERENCE'))?.id ?? 'Conference',
)
