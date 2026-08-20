import type { ApiResponse } from "@/core/api/ApiResponse"

export interface AddUpdateConferenceDetailsRequest {
    ConferenceRoomBookingId: number
    UniqueKey: string
    RoomId: number
    MeetingDate: string
    StartTime: string
    EndTime: string
    MeetingId: number
    BookingStatus: string
}

export interface DeleteConferenceBookingRequest {
    ConferenceRoomBookingId: number
    UniqueKey: string
}

export interface PullConferenceBookingDetailsRequest {
    PageSize: number
    PageNumber: number
    SortBy: string
    ConferenceRoomBookingId?: number
    MeetingId?: number
}

export interface PullConferenceDetailsRequest {
    PageSize: number
    PageNumber: number
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
    RoomName?: string
    ConferenceRoomName?: string
    MeetingDate: string
    StartTime: string
    EndTime: string
    MeetingId: number
    BookingStatus: string
}

export type ConferenceDetailsSaveResponse = ApiResponse<ConferenceDetailsData[]>
export type ConferenceDetailsListResponse = ApiResponse<ConferenceDetailsData[]>
export type ConferenceRoomListResponse = ApiResponse<ConferenceRoomData[]>
export type ConferenceBookingDeleteResponse = ApiResponse<number>
