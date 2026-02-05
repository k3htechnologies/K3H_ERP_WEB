import type { ApiResponse } from "@/core/api/ApiResponse"

export interface FilterWithPaginationAssetMasterRequest {
    PageSize: number
    PageNumber: number
    AssetMasterId?: number
    AssetName?: string
    AssetType?: string | null
    AssetModel?: string | null
    AssetBrand?: string | null
    SerialNumber?: string | null
    Status?: string
    SortBy?: string
    ExportType?: 'Excel' | 'PDF'
}

export interface AssetMasterData {
    AssetMasterId: number | null
    Uniquekey: string | null
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
    AssetInvoiceURL: string | null
    Status: string | null
    EmployeeName: string | null
    Department: string | null
    Designation: string | null
    Branch: string | null
    AssignedDate: string | null
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateAssetMasterRequest {
    AssetMasterId: number | null
    Uniquekey: string | null
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
    AssetInvoiceURL: (File | string)[] | null;
    RemoveAssetInvoiceURL: string | '';
}

export interface DeleteAssetMasterRequest {
    AssetMasterId: number
    UniqueKey: string
}

export type AssetMasterListResponse = ApiResponse<AssetMasterData[]>;
export type AssetMasterSaveResponse = ApiResponse<AssetMasterData[]>;
export type AssetMasterDeleteResponse = ApiResponse<number>;
