import type { LucideIcon } from "lucide-react";
import type { ApiResponse } from "@/core/api/ApiResponse";

export type VisitorManagementDashboardFilterType = 'TODAY' | 'WEEKLY' | 'MONTHLY' | 'DATEWISE';

export interface FilterVisitorManagementDashboardRequest {
    Type: VisitorManagementDashboardFilterType;
    FromDate: string | null;
    ToDate: string | null;
}

export interface VisitorManagementDashboardModel {
    Table0: OverviewTable[];
    Table1: VisitorTable[];
    Table2: TimelineTable[];
    Table3: PurposeTable[];
    Table4: AlertTable[];
}

export interface OverviewTable {
    TotalVisitors: number;
    CurrentlyInside: number;
    ExpectedToday: number;
    CheckedOut?: number;
    Overstaying: number;
    PendingApprovals: number;
}

export interface VisitorTable {
    ExternalId: number;
    Uniquekey: string;
    VisitorName: string;
    Contact: string | null;
    NoOfParticipants: number;
    Address: string;
    EmployeeId: number;
    AppointmentWith: string;
    CheckInTime: string;
    CheckOutTime: any;
    Purpose: string;
    Status: VisitorGatePassStatus;
    Remark: string;
    PhotoURL: string;
    ClientRegistrationId: number;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string | null;
    ModifiedById: any;
    ModifiedBy: string | null;
    ModifiedDate: any;
    Message: string;
    TotalRecords: number;
    IsApproval?: boolean;
    ApprovalRemark?: string;
    IsCheckOutEnabled?: boolean;
    IsNoticationEnabled?: boolean;
    IsNotificationEnabled?: boolean;

}

export interface TimelineTable {
    ExternalId: number;
    VisitorName: string;
    NoOfParticipants: number;
    VisitTime: string;
    OutDateTime: any;
    Purpose: string;
    Status: VisitorGatePassStatus;
}

export interface PurposeTable {
    Purpose: string;
    VisitorCount: number;
    Percentage: number;
}

export interface VisitorOverviewCard {
    key: keyof OverviewTable;
    title: string;
    value: number;
    icon: LucideIcon;
    backgroundColor: string;
    color: string;
    titleColor?: string;
    text: string;
}

export interface AlertTable {
    AlertType: string;
    ExternalId: number;
    VisitorName: string;
    Contact: string | null;
    AppointmentWith: string;
    VisitTime: string;
    OutDateTime: any;
    Purpose: string;
    AlertMessage: string;
    Status: VisitorGatePassStatus;
}


export type VisitorGatePassStatus = 'Currently Inside' | 'Checked Out' | 'Not Checked Out' | 'Expected'; 

export interface VisitorTimelineEntry {
    VisitorName: string;
    NoOfParticipants: number;
    Status: VisitorGatePassStatus;
}

export interface VisitorTimelineSlot {
    TimeLabel: string;
    Entries: VisitorTimelineEntry[];
}

export type VisitorManagementDashboardResponse = ApiResponse<VisitorManagementDashboardModel>;