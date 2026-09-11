import type { ApiResponse } from "@/core/api/ApiResponse"

export interface CandidateInterviewData {
    CalendarDate?: string | null
    InterviewId?: number | null
    UniqueKey?: string | null
    CandidateId?: number | null
    CandidateName?: string | null
    JobOpeningMasterId?: number | null
    InterviewPanel?: string | null
    InterviewDate?: string | null
    InterviewTime?: string | null
    Stage?: string | null
    AttachmentUrl?: string | null
    InterviewPanelName?: string | null
    Photograph?: string | null
    ResumeURL?: string | null
    RoleName?: string | null
    Remarks?: string | null
}

export interface AddUpdateCandidateInterviewRequest {
    InterviewId: number
    UniqueKey: string
    CandidateId: string
    JobOpeningMasterId: number
    Stage: string
    InterviewPanel: string
    InterviewDate: string
    InterviewTime: string
    AttachmentUrl: File[] | null
    RemoveattachmentUrl: string
    Remarks: string
}

export interface FilterWithPaginationCandidateInterviewRequest {
    PageSize: number
    PageNumber: number
    InterviewId?: number
    InterviewDate?: string
    Month?: number
    Year?: number
    CandidateName?: string
    Stage?: string
}

export type CandidateInterviewSaveResponse = ApiResponse<number>
export type CandidateInterviewListResponse = ApiResponse<CandidateInterviewData[]>
