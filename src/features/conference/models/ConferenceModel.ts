import type { ApiResponse } from "@/core/api/ApiResponse"
import type { DAY_CARD_THEMES } from "@/features/conference/constants/conferenceConstants"

export type ConferenceScheduleView = "week" | "day"

export type DayCardTheme = (typeof DAY_CARD_THEMES)[number]

export type VisitorModalMode = "new" | "existing"

export interface VisitorFormData {
    Name: string
    EmailId: string
    MobileNo: string
    VisitorRole: string
}

export interface AddUpdateConferenceDetailsRequest {
    ConferenceRoomBookingId: number
    UniqueKey: string
    RoomId: number
    MeetingDate: string
    StartTime: string
    EndTime: string
    MeetingId: number
    BookingStatus: string
    Conclusion: string
    Purpose: string
    ConferenceTitle: string
}

export interface DeleteConferenceBookingRequest {
    ConferenceRoomBookingId: number
    UniqueKey: string
}

export interface PullConferenceBookingDetailsRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ConferenceBookingId?: number
    ConferenceRoomId?: number
    MeetingId?: number
    BookingDate?: string
    StartDate?: string
    EndDate?: string
    SortBy?: string
}

export interface PullConferenceDetailsRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    RoomId: number
}

export interface ConferenceRoomData {
    ConferenceRoomId: number
    UniqueKey: string
    RoomName: string
    Capacity: number
    Location: string
    Description: string
    ImageUrl: string
    Floor: string
    TotalBookingCount: number
    ClientRegistrationId: number
    IsActive: boolean
    IsDeleted: boolean
    CreatedById: number
    CreatedDate: string | null
    ModifiedById: number
    ModifiedDate: string | null
}

export interface ConferenceDetailsData {
    ConferenceRoomBookingId: number
    UniqueKey: string
    RoomId: number
    MeetingDate: string
    StartTime: string
    EndTime: string
    MeetingId: number
    BookingStatus: string
    ConferenceTitle: string
    Purpose: string
    RoomName: string
    ClientRegistrationId: number
    IsActive: boolean
    IsDeleted: boolean
    CreatedById: number
    CreatedDate: string | null
    ModifiedById: number
    ModifiedDate: string | null
}

export type ConferenceDetailsSaveResponse = ApiResponse<ConferenceDetailsData[]>
export type ConferenceDetailsListResponse = ApiResponse<ConferenceDetailsData[]>
export type ConferenceRoomListResponse = ApiResponse<ConferenceRoomData[]>
export type ConferenceBookingDeleteResponse = ApiResponse<number>
