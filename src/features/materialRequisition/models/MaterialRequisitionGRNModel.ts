import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationMaterialRequisitionGRN {
    ProjectId?: number
    Uniquekey?: string
    MaterialRequisitionId?: number
    MaterialRequisitionGRNId?: number
}

export interface MaterialRequisitionGRNData {
    MaterialRequisitionGRNId: number | 0
    Uniquekey: string | null
    MaterialRequisitionId: number | 0
    ChallanNumber: string | ''
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
    MaterialRequisitionDetailGRNData: MaterialRequisitionDetailGRNData[]
}

export interface MaterialRequisitionDetailGRNData {
    MaterialRequisitionDetailGRNId: number | 0,
    Uniquekey: string | null,
    MaterialRequisitionGRNId: number | 0,
    MaterialRequisitionDetailId: number | 0,
    MaterialName: string | null,
    SubMaterialName: string | null,
    MaterialQuantity: number | 0,
    UomCode: string | null,
    Uom: string | null,
    RequiredDate: string | null,
    TotalReceivedMaterialQuantity: number | 0,
    CreatedById: number | 0,
    CreatedBy: string | null,
    CreatedDate: string | null,
    ModifiedById: number | 0,
    ModifiedBy: string | null,
    ModifiedDate: string | null,
}
export interface AddUpdateMaterialRequisitionGRNRequest {
    MaterialRequisitionGRNId: number | 0
    Uniquekey: string | null
    MaterialRequisitionId: number | 0
    ChallanNumber: string | ''
    VehicleNumber: string | null
    UploadChallanURL: string | null
    RemoveUploadChallanURL: string | ''
    Remarks: string 
    ProjectId: number | 0
    MaterialRequisitionDetailGRNJSON:string
}

export interface MaterialRequisitionDetailGRN{
    MaterialMasterId: number;
    MaterialName: string;
    SubMaterialName: string;
    SubMaterialMasterId: number;
    UomMasterId: number;
    UomCode: string;
    MaterialQuantity: number | 0;
    QualityAnalystRemark: string;
    MaterialRequisitionDetailGRNId: number | 0
    MaterialRequisitionDetailId: number | 0;
    TotalReceivedMaterialQuantity:  number
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
    ChallanNumber: string | ''
    VehicleNumber: string | null
    UploadChallanURL: string | null
    CreatedDate: string;

}


export type MaterialRequisitionGRNListResponse = ApiResponse<MaterialRequisitionGRNData[]>;
export type MaterialRequisitionGRNSaveResponse = ApiResponse<MaterialRequisitionGRNData[]>;
export type MaterialRequisitionGRNDeleteResponse = ApiResponse<number>;
export type MaterialRequisitionGRNSummaryListResponse = ApiResponse<MaterialRequisitionGRNSummaryData[]>