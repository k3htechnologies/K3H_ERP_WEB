import type { ApiResponse } from "@/core/api/ApiResponse"
import type { VendorData } from "@/features/vendor/models/VendorModel"

export interface FilterPullVendorForEnquiryRequest {
    MaterialRequisitionId?: number | 0
    MaterialRequisitionDetailId?: string | 0
    Uniquekey?: string
    ProjectId: number | 0
    SearchVendor?: string
}

export interface AddVendorForEnquiryRequest {
    MaterialRequisitionId: number;
    MaterialRequisitionDetailId?: string | 0
    Uniquekey: string;
    VendorId: string | null;
    ProjectId: number | 0;
}

export type PullVendorForEnquiryListResponse = ApiResponse<VendorData[]>;
export type AddVendorForEnquiryResponse = ApiResponse<string>;