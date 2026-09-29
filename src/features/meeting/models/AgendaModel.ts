import type { ApiResponse } from '@/core/api/ApiResponse'

export interface AgendaResponsiblePersonDetail {
    ResponsiblePersonId: number
    ResponsiblePersonName: string
}

export interface AgendaReviewerDetail {
    ReviewerId: string
    ReviewerName: string
}

export interface AgendaTagsEmployeeDetail {
    TagId: string
    TagsName: string
}

export interface AddUpdateAgendaRequest {
    AgendaId: number
    UniqueKey: string
    MeetingId: number
    AgendaTitle: string
    AgendaDescription: string
    ResponsiblePersonJson?: string
    ReviewerJson?: string
    TagsEmployeeJson?: string
    PriorityId?: number
    AgendaStatusId?: number
    Remark: string
    AgendaConclusion: string
    Discussion: string
    AgendaSource: string
    ParentTaskId?: number
    TaskType?: string
    StartDate?: string
    DueDate?: string
    IsAgendaTask?: boolean
    DocumentURLs: Array<File | string>
    RemoveDocumentUrl: string
}

export interface DeleteAgendaRequest {
    AgendaId: number
    UniqueKey: string
}

export interface AddAgendaTaskRequest {
    AgendaId: number
    UniqueKey: string
    ParentTaskId: number
    TaskType: string
    IsAgendaTask: boolean
}

export interface FilterWithPaginationPreviousAgendaDetailsRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    meetingId: number
    AgendaTitle?: string
}

export interface FilterWithPaginationAgendaRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    MeetingId?: number
    AgendaId?: number
    AgendaParentId?: number
    AgendaSource?: string
    TaskType?: string
    IsAgendaTask?: boolean
    ParentTaskId?: number
    AgendaTitle?: string
    PriorityId?: number
    StatusId?: number
    StartDate?: string
    DueDate?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface AgendaData {
    AgendaId: number
    UniqueKey: string
    MeetingId: number
    SystemGeneratedCode: string
    ParentTaskId: number
    TaskType: string
    StartDate: string
    DueDate: string
    AgendaTitle: string
    AgendaDescription: string
    AgendaStatus: string
    Remark: string
    DocumentURLs: string
    AgendaConclusion: string
    Discussion: string
    Priority: string
    AgendaSource: string
    ReviewerDetails: AgendaReviewerDetail[]
    TagsEmployeeDetails: AgendaTagsEmployeeDetail[]
    ResponsiblePersonDetails: AgendaResponsiblePersonDetail[]
    AgendaStatusId: number
    PriorityId: number
    ClientRegistrationId: number
    IsActive: boolean | null
    IsDeleted: boolean | null
    CreatedById: number
    CreatedBy: string
    ModifiedBy: string
    DeletedBy: string
    CreatedDate: string | null
    ModifiedById: number
    ModifiedDate: string | null
    DeletedById: number
    DeletedDate: string | null
}

export type AgendaListResponse = ApiResponse<AgendaData[]>
export type AgendaSaveResponse = ApiResponse<AgendaData[]>
export type AgendaDeleteResponse = ApiResponse<number>
export type AgendaTaskSaveResponse = ApiResponse<AgendaData[]>
export type PreviousAgendaDetailsResponse = ApiResponse<AgendaData[]>
