import type { ApiResponse } from "@/core/api/ApiResponse"

export type VisitorManagementDashboardFilterType = 'TODAY' | 'WEEKLY' | 'MONTHLY';

export interface FilterVisitorManagementDashboardRequest {
    Type: VisitorManagementDashboardFilterType
}

export interface VisitorManagementDashboardModel {
    Table0: Table0[]
}

export interface Table0 {
    ExternalId: number | 0
    Uniquekey: string | ''
    FullName: string | ''
    MobileNumber: string | null
    NoOfParticipants: number | 0
    Address: string | ''
    EmployeeId: number | 0
    EmployeeName: string | ''
    PassDateTime: string | ''
    OutDateTime: string | ''
    GatePassStatus: VisitorGatePassStatus
    Remark: string | ''
    Purpose: string | ''
    PhotoURL: string | ''
    ClientRegistrationId: number | 0
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | null
    ModifiedBy: string | null
    ModifiedDate: string | null
    Message: string | ''
    TotalRecords: number | 0
}

export interface VisitorOverviewData {
    TotalVisitors: number
    CurrentlyInside: number
    ExpectedToday: number
    CheckedOut: number
    Overstaying: number
}

export interface PurposeWiseVisitorData {
    Purpose: string;
    VisitorCount: number;
}

export interface VisitorAlertData {
    AlertType: string;
    Message: string;
}

export type VisitorGatePassStatus = 'Currently Inside' | 'Checked Out' | 'Not Checked Out';

export interface VisitorTimelineEntry {
    FullName: string;
    NoOfParticipants: number;
    Status: VisitorGatePassStatus;
}

export interface VisitorTimelineSlot {
    TimeLabel: string;
    Entries: VisitorTimelineEntry[];
}

export type VisitorManagementDashboardResponse = ApiResponse<VisitorManagementDashboardModel>;
