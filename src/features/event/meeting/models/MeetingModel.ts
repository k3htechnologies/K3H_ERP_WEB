import type { ApiResponse } from "@/core/api/ApiResponse"

export type MeetingType =
    | "Department"
    | "Employees"
    | "External Participant"

export type MeetingMode =
    | "Online"
    | "Physical"
    | "Onsite"
    | "Offline"

export type AgendaPriority =
    | "Low"
    | "Medium"
    | "High"

export type AgendaStatus =
    | "active"
    | "inactive"
    | "Pending"
    | "In Progress"
    | "Completed"

export interface MeetingAgenda {
    AgendaId: string | number
    UniqueKey?: string
    Title: string
    Description?: string
    CreatedBy: string
    ResponsiblePersonId?: string
    ResponsiblePerson: string
    ResponsiblePersonJson?: string
    Priority: AgendaPriority
    Status: AgendaStatus
    Remark?: string
    Discussion?: string
    Conclusion?: string
    DocumentUrl?: string
    MeetingTitle?: string
    MeetingDate?: string
}

export interface AddUpdateAgendaRequest {
    AgendaId: number
    UniqueKey: string
    MeetingId: number
    AgendaTitle: string
    AgendaDescription: string
    ResponsiblePersonId?: number
    ResponsiblePersonJson?: string
    Priority: string
    AgendaStatus: string
    Remark: string
    AgendaConclusion: string
    Discussion: string
    Description: string
    DocumentURLs: Array<File | string>
    RemoveDocumentURL: string
}

export interface DeleteAgendaRequest {
    AgendaId: number
    UniqueKey: string
}

export interface PullPreviousAgendaDetailsRequest {
    PageSize: number
    PageNumber: number
    meetingId: number
}

export interface PullAgendaRequest {
    PageSize: number
    PageNumber: number
    meetingId: number
    AgendaSource: string
}

export interface AgendaData {
    AgendaId: number
    UniqueKey: string
    MeetingId: number
    MeetingTitle?: string
    MeetingDate?: string
    AgendaTitle: string
    AgendaDescription: string
    ResponsiblePersonId?: number
    ResponsiblePerson?: string
    ResponsiblePersonName?: string
    ResponsiblePersonJson?: string
    AgendaStatus: string
    Remark: string
    DocumentURLs?: string
    AgendaConclusion?: string
    Discussion?: string
    Description?: string
    Priority?: string
    ClientRegistrationId?: number
    IsActive?: boolean | null
    IsDeleted?: boolean | null
    CreatedById?: number
    CreatedBy?: string
    CreatedDate?: string | null
    ModifiedById?: number
    ModifiedDate?: string | null
    DeletedById?: number
    DeletedDate?: string | null
}

export interface ExternalParticipantDetails {
    ParticipantName: string
    CompanyName: string
    DesignationId: string
    DesignationName: string
    MobileNumber: string
    Email: string
    Remark: string
}

export interface MeetingParticipantRequest {
    ParticipantType: "Employee" | "Department"
    ParticipantId: number
}

export interface ExternalMeetingParticipantRequest {
    FullName: string
    Email: string
    MobileNo: string
    OrganizationName: string
    NoOfParticipants: number
    ClientRegistrationId: number
    DesignationName?: string
    Remark?: string
}

export interface AddUpdateMeetingMasterRequest {
    MeetingId: number
    UniqueKey: string
    MeetingStartTime: string
    MeetingEndTime: string
    MeetingDate: string
    MeetingTitle: string
    MeetingType: "Department" | "Employee" | "External"
    MeetingLocation: string
    MeetingLink: string
    MeetingStatus: string
    ParticipantDetailsJson: string
    ExternalParticipantJson: string
    MeetingMode: MeetingMode
    Remark: string
    ConferenceId: number
    ConferenceRoomId: number
}

export interface DeleteMeetingMasterRequest {
    MeetingId: number
    UniqueKey: string
}

export interface PullMeetingMasterRequest {
    PageSize: number
    PageNumber: number
    MeetingId?: number
    MeetingName?: string
    MeetingTitle?: string
    MeetingDate?: string
    MeetingStatus?: string
    SortBy?: string
    ExportType?: string
}

export interface MeetingParticipantData {
    ParticipantId: number
    ParticipantName: string
    ProfilePhotoURL?: string
    MeetingType: string
    UniqueKey: string
    DesignationName: string
    DepartmentName: string
    ExternalId: number
    EmaEmail: string
    MobileNo: string
    OrganizationName?: string
    Remark?: string
    CreatedDate: string | null
    ModifiedDate: string | null
}

export interface MeetingAgendaDetailData {
    AgendaId: number
    UniqueKey: string
    MeetingId: number
    AgendaTitle: string
    AgendaDescription: string
    ResponsiblePersonId?: number
    ResponsiblePerson?: string
    ResponsiblePersonName?: string
    ResponsiblePersonJson?: string
    AgendaStatus: string
    Remark: string
    DocumentURLs?: string
    AgendaConclusion?: string
    Discussion?: string
    Description?: string
    Priority?: string
    CreatedBy?: string
    MeetingTitle?: string
    MeetingDate?: string
    CreatedById?: number
    CreatedDate?: string | null
    ModifiedById?: number
    ModifiedDate?: string | null
}

export interface MeetingMasterData {
    MeetingId: number
    ConferenceId?: number
    ConferenceRoomBookingId?: number
    ConferenceRoomId?: number
    MeetingName?: string
    UniqueKey: string
    MeetingStartTime: string
    MeetingEndTime: string
    MeetingDate: string
    MeetingTitle: string
    MeetingType: string
    MeetingLocation: string
    RoomName?: string
    MeetingLink?: string
    MeetingStatus: string
    ParticipantDetailsJson: string
    ExternalParticipantJson: string
    MeetingMode: string
    Remark: string
    Participants: MeetingParticipantData[]
    ExternalMeetingParticipants?: MeetingParticipantData[]
    AgendaDetails?: MeetingAgendaDetailData[]
    PresentationDocumentUrl?: string
    MOMDocumentUrl?: string
    SupportingDocumentUrl?: string
    ClientRegistrationId: number
    IsActive: boolean | null
    IsDeleted: boolean | null
    CreatedById: number
    CreatedDate: string | null
    ModifiedById: number
    ModifiedDate: string | null
    DeletedById: number
    DeletedDate: string | null
}

export interface MeetingDocumentUrlGroups {
    presentation: string[]
    mom: string[]
    supporting: string[]
}

export interface MeetingMetadata {
    MeetingType: MeetingType
    MeetingMode: MeetingMode
    Remark: string
    MeetingStatus: string
    DepartmentName: string
    ExternalParticipants: string
    ExternalParticipantDetails: ExternalParticipantDetails
    Agendas: MeetingAgenda[]
}

export interface AddUpdateMOMDocumentsRequest {
    MomDocumentId: number
    UniqueKey: string
    MeetingId: number
    RemovePresentationDocumentUrl?: string
    RemoveMOMDocumentUrl?: string
    RemoveSupportingDocumentUrl?: string
    FormData: FormData
}

export interface PullMOMRequest {
    PageSize: number
    PageNumber: number
    MOMId: number
    MeetingId: number
    ExportType: string
}

export interface DeleteMOMRequest {
    MOMId: number
}

export interface MOMDocumentData {
    MomDocumentId?: number
    MOMDocumentId?: number
    MOMId?: number
    UniqueKey?: string
    MeetingId?: number
    PresentationDocumentUrl?: string
    MOMDocumentUrl?: string
    SupportingDocumentUrl?: string
}

export type MeetingMasterListResponse = ApiResponse<MeetingMasterData[]>;
export type MeetingMasterSaveResponse = ApiResponse<unknown>;
export type MeetingMasterDeleteResponse = ApiResponse<unknown>;

export type AgendaSaveResponse = ApiResponse<AgendaData[]>;
export type AgendaDeleteResponse = ApiResponse<number>;
export type PreviousAgendaDetailsResponse = ApiResponse<AgendaData[]>;
export type PullAgendaResponse = ApiResponse<AgendaData[]>;

export type MOMDocumentSaveResponse = ApiResponse<MOMDocumentData[]>;
export type MOMDocumentListResponse = ApiResponse<MOMDocumentData[]>;
export type MOMDocumentDeleteResponse = ApiResponse<number>;
