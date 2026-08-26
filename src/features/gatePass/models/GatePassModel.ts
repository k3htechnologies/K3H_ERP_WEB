import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationGatePassRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    ExternalId?: number
    FullName?: string
    MobileNumber?: string
    Address?: string
    FromDate?: string | null;
    ToDate?: string | null;
    Purpose?: string
    EmployeeName?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface GatePassData {
    ExternalId: number | 0
    Uniquekey: string | ''
    MobileNumber: string | null;
    FullName: string | '';
    Address: string | '';
    Purpose: string | '';
    Remark: string | '';
    EmployeeId: number | 0;
    EmployeeName: string | '';
    PassDateTime: string | '';
    NoOfParticipants: number | 0;
    PhotoURL: string | ''
    OutDateTime: string | '';
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    IsDelete?:boolean
}

export interface AddUpdateGatePassRequest {
    ExternalId: number;
    Uniquekey: string;
    MobileNumber: string;
    FullName: string;
    Address: string;
    Purpose: string;
    Remark: string;
    EmployeeId: number;
    PassDateTime: string;
    NoOfParticipants: number;
    PhotoURL: (File | string)[] | null;
    RemovePhotoURL: string | '';
}

export interface UpdateGatePassOutRequest {
    ExternalId: number;
    Uniquekey: string;
    Type: string;
}

export interface DeleteGatePassRequest {
    ExternalId: number;
    Uniquekey: string;
}

export type GatePassListResponse = ApiResponse<GatePassData[]>;
export type GatePassSaveResponse = ApiResponse<GatePassData[]>;
export type GatePassOutResponse = ApiResponse<GatePassData[]>;
export type GatePassDeleteResponse = ApiResponse<number>;