import type { ApiResponse } from "@/core/api/ApiResponse"
import type { MaterialRequisitionQuotationDetailsTermsData } from "./MaterialRequisitionQuotationApi"

export interface FilterWithPaginationVendorForEnquiryRequest {
    MaterialRequisitionId: number | 0
    Uniquekey:string | null
    ProjectId: number | 0
}

export interface FilterWithPaginationVendorForSelectedEnquiryRequest {
    MaterialRequisitionId: number | 0
    Uniquekey: string | null
    ProjectId: number |0
    ExportType? : 'VENDOR COMPARISON CHART'

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
//used for material quotation
export interface AddVendorForEnquiryRequest { 
    MaterialRequisitionId:number;
    Uniquekey:string;
    VendorId: string | null;
    ProjectId:number | 0;

}
export type SelectedVendorListResponse = ApiResponse<SelectedVendorData[]>;
export type AddVendorForEnquiryRequestResponse = ApiResponse<SelectedVendorData>;
