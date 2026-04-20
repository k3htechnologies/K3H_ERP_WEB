import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialRequisitionGRN {
    PageSize: number
    PageNumber: number
    ProjectId?: number
    Uniquekey?: string
    MaterialRequisitionId?: number
    MaterialRequisitionGRNId?: number
    SortBy?: string
    ExportType?: "PDF" | "Excel"
}

export interface MaterialRequisitionGRNData {
    MaterialRequisitionGRNId: number | 0
    Uniquekey: string | null
    MaterialRequisitionId: number | 0
    ChallanNumber: string | 0
    VehicleNumber: string | null
    UploadChallanURL: string | null
    RemoveUploadChallanURL: string | ''
    Remarks: string | null
    ProjectId: number | 0
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: string;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: string;
}

export interface AddUpdateMaterialRequisitionGRNRequest {
    MaterialRequisitionGRNId: number | 0
    Uniquekey: string | null
    MaterialRequisitionId: number | 0
    ChallanNumber: string | 0
    VehicleNumber: string | null
    UploadChallanURL: string | null
    RemoveUploadChallanURL: string | ''
    Remarks: string | null
    ProjectId: number | 0
}

export interface DeleteMaterialRequisitionGRN {
    MaterialRequisitionGRNId: number
    Uniquekey: string
    MaterialRequisitionId: number
    ProjectId: number
}

export interface FilterWithPaginationMaterialRequisitionGRNSummary {
    PageSize: number
    PageNumber: number
    MaterialRequisitionId?: number
    Uniquekey?: string
}

export interface MaterialRequisitionGRNSummaryData {
    MaterialRequisitionDetailId: number | 0
    Uniquekey: string | null
    MaterialMasterId: number | null
    MaterialName: string | null
    SubMaterialName: string | null
    MaterialQuantity: number | 0
    ChallanNumber: string | 0
    VehicleNumber: string | null
    UploadChallanURL: string | null
    CreatedDate: string;

}


export type MaterialRequisitionGRNListResponse = ApiResponse<MaterialRequisitionGRNData[]>;
export type MaterialRequisitionGRNSaveResponse = ApiResponse<MaterialRequisitionGRNData[]>;
export type MaterialRequisitionGRNDeleteResponse = ApiResponse<number>;
export type MaterialRequisitionGRNSummaryListResponse = ApiResponse<MaterialRequisitionGRNSummaryData[]>