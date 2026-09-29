import type { ApiResponse } from '@/core/api/ApiResponse'

export interface MOMDocumentData {
    MomDocumentId?: number
    MOMId?: number
    UniqueKey?: string
    MeetingId?: number
    PresentationDocumentUrl?: string
    MOMDocumentUrl?: string
    SupportingDocumentUrl?: string
}

export type MOMDocumentSaveResponse = ApiResponse<MOMDocumentData[]>
