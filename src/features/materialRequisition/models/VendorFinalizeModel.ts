import type { ApiResponse } from "@/core/api/ApiResponse"
import type { MaterialRequisitionQuotationDetailsTermsData } from "./MaterialRequisitionQuotationModel"

export interface FilterWithPaginationVendorForEnquiryRequest {
    MaterialRequisitionId?: number | 0
    Uniquekey?: string
    ProjectId: number | 0
    SubMaterialMasterId?: string
}

export interface FilterWithPaginationVendorForSelectedEnquiryRequest {
    MaterialRequisitionId?: number
    Uniquekey?: string
    ProjectId: number | 0
    ExportType?: 'Excel' | 'PDF' | 'VENDOR COMPARISON CHART'
}

export interface SelectedVendorData {
    VendorId: number;
    Uniquekey: string;
    CompanyName: string;
    CompanyType: string;
    VendorName: string;
    MobileNumber: string;
    EmailId: string;
    AadharCardNumber: string;
    AadharCardURL: string;
    PanCardNumber: string;
    PanCardURL: string;
    GSTNumber: string;
    GSTCertificateURL: string;
    Address: string;
    CountryMasterId: number;
    CountryName: string;
    StateMasterId: number;
    StateName: string;
    DistrictMasterId: number;
    DistrictName: string;
    CityMasterId: number;
    CityName: string;
    AvailableMaterialList: string;
    AvailableContractList: string;
    CreatedById: number;
    CreatedBy: string;
    CreatedDate: Date;
    ModifiedById: number;
    ModifiedBy: string;
    ModifiedDate: Date;
    IsApproval: boolean;
    IsFinalized: boolean;
    VendorFinalizationApproval: string;
    MaterialRequisitionQuotationTermsData: MaterialRequisitionQuotationDetailsTermsData[];
    SubMaterialMasterData: any[];
    ContractTypeMasterData: any[];
    MagicLinkURL: string;
    SystemGeneratedCode: string;
    ProjectName: string;
}

export interface AddVendorForEnquiryRequest {
    MaterialRequisitionId: number;
    Uniquekey: string;
    ProjectId: number | 0;
}

export interface VendorForEnquiryData {
    MaterialRequisitionType: string | null
    MaterialMasterId: number | 0;
    MaterialCode: string | null;
    MaterialName: string | null;
    SubMaterialName: string | null;
    SubMaterialMasterId: number | 0;
    UomMasterId: number | 0;
    UomCode: string | null;
    Uom: string | null;
    MaterialQuantity: number;
    RequiredDate: string;
    VendorDetailsJSON: VendorDetails[];
}

export interface VendorDetails {
    VendorId: number | 0,
    VendorName: string | null,
    CompanyName: string | null,
    MobileNumber: string | null
    MobileNumberCountryCode: string | null
    EmailId: string | null
    GSTNumber: string | null
    Address: string | null
}

export interface RevokeFinalizationVendorRequest {
    MaterialRequisitionId: number,
    Uniquekey: string | null,
    ProjectId: number | 0,
}

export type SelectedVendorListResponse = ApiResponse<SelectedVendorData[]>;
export type AddVendorForEnquiryRequestResponse = ApiResponse<SelectedVendorData>;
export type VendorForEnquiryListResponse = ApiResponse<VendorForEnquiryData[]>;
export type AddVendorForEnquirysaveResponse = ApiResponse<VendorForEnquiryData[]>;
export type RevokeFinalizationVendorResponse = ApiResponse<number>;
