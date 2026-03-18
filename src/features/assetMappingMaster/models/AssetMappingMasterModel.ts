import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationAssetMappingMasterRequest {
    PageSize: number
    PageNumber: number
    IsCheckPermission?: boolean
    AssetMasterMappingId?: number
    AssetMasterId?: number
    AssetName?: string
    EmployeeName?: string
    EmployeeId?: number
    Status?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface AssetMappingMasterData {
    AssetMasterMappingId: number | null
    Uniquekey: string | null
    AssignedDate: string | null
    EmployeeId: number | null
    EmployeeName: string | null
    Department: string | null
    Designation: string | null
    Branch: string | null
    ReturnDate: string | null
    ConditionOnIssue: string | null
    ConditionOnReturn: string | null
    Remarks: string | null
    AssetMasterId: number | null
    AssetCode: string | null
    AssetName: string | null
    AssetType: string | null
    AssetModel: string | null
    AssetBrand: string | null
    SerialNumber: string | null
    PurchaseDate: string | null
    WarrantyExpiryDate: string | null
    AssetCost: number | null
    SupplierName: string | null
    Status: string | null
    IsEditAllowedForAssetAndEmployee:boolean
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateAssetMappingMasterRequest {
    AssetMasterMappingId: number | null
    Uniquekey: string | null
    AssetMasterId: number | null
    AssignedDate: string | null
    EmployeeId: number | null
    ReturnDate: string | null
    ConditionOnIssue: string | null
    ConditionOnReturn: string | null
    Remarks: string | null
}

export interface DeleteAssetMappingMasterRequest {
    AssetMasterMappingId: number
    UniqueKey: string
}

export type AssetMappingMasterListResponse = ApiResponse<AssetMappingMasterData[]>;
export type AssetMappingMasterSaveResponse = ApiResponse<AssetMappingMasterData[]>;
export type AssetMappingMasterDeleteResponse = ApiResponse<number>;
