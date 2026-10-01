import type { ApiResponse } from '@/core/api/ApiResponse'
import type { AgendaData } from '@/features/meeting/models/AgendaModel'

export type MeetingMode =
    | 'Online'
    | 'Physical'
    | 'Onsite'

export interface MeetingParticipantRequest {
    ParticipantType: 'Employee' | 'Department'
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
    MeetingType: 'Department' | 'Employee' | 'External'
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

export interface FilterWithPaginationMeetingMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
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

export interface MeetingMasterData {
    MeetingId: number
    UniqueKey: string
    MeetingStartTime: string
    MeetingEndTime: string
    MeetingDate: string
    MeetingTitle: string
    MeetingType: string
    MeetingLocation: string
    MeetingStatus: string
    ConferenceRoomBookingId?: number
    ParticipantDetailsJson: string
    ExternalParticipantJson: string
    MeetingMode: string
    Remark: string
    Participants: MeetingParticipantData[]
    ExternalMeetingParticipants?: MeetingParticipantData[]
    AgendaDetails?: AgendaData[]
    PresentationDocumentUrl?: string
    MOMDocumentUrl?: string
    SupportingDocumentUrl?: string
    MeetingLink?: string
    RoomName?: string
    ClientRegistrationId: number
    IsActive: boolean | null
    IsDeleted: boolean | null
    CreatedById: number
    CreatedBy?: string
    CreatedDate: string | null
    ModifiedBy?: string
    DeletedBy?: string
    ModifiedById: number
    ModifiedDate: string | null
    DeletedById: number
    DeletedDate: string | null
}

export interface FilterWithPaginationMeetingParticipantsRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    MeetingId: number
}

export type MeetingMasterListResponse = ApiResponse<MeetingMasterData[]>
export type MeetingParticipantListResponse = ApiResponse<MeetingParticipantData[]>
export type MeetingMasterSaveResponse = ApiResponse<MeetingMasterData[]>
export type MeetingMasterDeleteResponse = ApiResponse<number>
