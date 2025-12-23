import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationTenantApplicantChargesRequest {
    // Pagination
    PageSize: number
    PageNumber: number


    // Rent / Tenant filters
    ProjectId?: number
    BuildingId?: number
    TenantId?: number
    TenantApplicantChargesId?: number

    Tenure?: string
    ChargeType?: string
    ApplicantType?: string
    ApplicantName?: string

    // Flat details
    FlatNumber?: string
    FlatCarpetAreaSqFt?: number
    FlatType?: string
    FlatConfiguration?: string

    // Sorting & Export
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}


export interface TenantApplicantCharges {
    TenantApplicantChargesId: number
    TenantId?: number
    TenantApplicantId: number
    BuildingId: number
    ProjectId: number

    // Applicant details
    ApplicantType?: string
    ApplicantName?: string

    // Flat details
    FlatNumber?: string
    FlatCarpetAreaSqFt?: number
    FlatType?: string
    FlatConfiguration?: string

    // Charge details
    Tenure?: string
    Stage?: string
    ProposedOfferAmount?: number
    Amount?: number
    Unit?: string
    Date?: string | Date
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}


export type TenantApplicantChargesListResponse = ApiResponse<TenantApplicantCharges[]>;
