import type { ApiResponse } from "@/core/api/ApiResponse"

export interface InterviewRouteCandidate {
    id?: string | number
    candidateId?: number
    jobOpeningMasterId?: number
    name?: string
    role?: string
    appliedRole?: string
}

export interface InterviewScheduleFormState {
    candidate: string
    position: string
    interviewerId: string
    date: string
    startTime: string
    stage: string
    remarks: string
}

export interface InterviewScheduleFormErrors {
    candidate?: string
    position?: string
    interviewer?: string
    date?: string
    startTime?: string
    stage?: string
}

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
    AttachmentUrl?: string | string[] | null
    InterviewPanelName?: string | null
    Photograph?: string | null
    ResumeURL?: string | null
    RoleName?: string | null
    Remarks?: string | null
    InterviewStatus?: string | null
}

export interface AddUpdateCandidateInterviewRequest {
    InterviewId: number
    UniqueKey: string
    CandidateId: number
    JobOpeningMasterId: number
    Stage: string
    InterviewPanel: string
    InterviewDate: string
    InterviewTime: string
    AttachmentUrl: Array<File | string>
    RemoveattachmentUrl: string
    Remarks: string
}

export interface FilterWithPaginationCandidateInterviewRequest {
    PageSize: number
    PageNumber: number
    InterviewId?: number
    InterviewDate?: string | number
    Month?: number
    Year?: number
    CandidateName?: string
    Stage?: string
}

export type CandidateInterviewSaveResponse = ApiResponse<number>
export type CandidateInterviewListResponse = ApiResponse<CandidateInterviewData[]>
