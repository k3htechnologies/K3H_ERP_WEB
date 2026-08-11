import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationVisitorManagement {
    PageSize: number
    PageNumber: number
    FromDate?: string
    ToDate?: string
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface VisitorManagementData {
    VisitorId: number;
    Uniquekey: string;
    VisitorName: string
    // AppointementWith: string
    EmployeeId: string | null,
    AppointmentDate: string
    // IN future ApprovalStatus may come check with backend
    AppointmentStatus: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateVisitorManagementRequest {
    VisitorId: number;
    Uniquekey?: string | '';
    MobileNumber: string;
    MobileNumberCountryCode: string;
    VisitorName: string | '';
    //Fetch the employee dropdown in the below key (Appointment With)
    EmployeeId: string | null;
    AppointmentDate: string | null;
    AppointmentTime: string | null;
}

export interface DeleteVisitorRequest {
    VisitorId: number;
    Uniquekey: string;
}

export interface FilterWithPaginationVisitorsByMobileNoRequest {
    PageSize?: number
    PageNumber?: number
    MobileNumber?: string
}

export type VisitorManagementListResponse = ApiResponse<VisitorManagementData[]>;
export type VisitorManagementSaveReponse = ApiResponse<VisitorManagementData[]>;
export type VisitorManagementDeleteResponse = ApiResponse<number>;