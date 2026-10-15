import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterWithPaginationVendorForEnquiryRequest {
  ContractRequisitionId?: number | 0;
  UniqueKey?: string;
  ProjectId: number | 0;
}

export interface FilterWithPaginationVendorForSelectedEnquiryRequest {
  ContractRequisitionId?: number;
  UniqueKey?: string;
  VendorId?: number;
  ClientRegistrationId?: string;
  ProjectId: number | 0;
  ExportType?: "Excel";
}

export interface SelectedVendorData {
  VendorId: number;
  UniqueKey: string;
  SystemGeneratedCode: string;
  VendorType: string;
  CompanyName: string;
  CompanyType: string;
  VendorName: string;
  MobileNumberCountryCode: string;
  MobileNumber: string;
  EmailId: string;
  AadharCardNumber: string;
  AadharCardURL: string;
  PanCardNumber: string;
  PanCardURL?: string;
  GSTNumber?: string;
  GSTCertificateURL?: string;
  Address?: string;
  CountryMasterId?: number;
  CountryName?: string;
  StateMasterId?: number;
  StateName?: string;
  DistrictMasterId?: number;
  DistrictName?: string;
  CityMasterId?: number;
  CityName?: string;
  AvailableMaterialList?: string;
  AvailableContractList?: string;
  CreatedById?: number;
  CreatedBy?: string;
  CreatedDate?: Date;
  ModifiedById?: number;
  ModifiedBy?: string;
  ModifiedDate?: Date;
  IsApproval?: boolean;
  IsFinalized?: boolean;
  VendorFinalizationApproval?: string;
  ContractRequisitionQuotationTermsData?: ContractRequisitionQuotationDetailsTermsData[];
  ContractTypeMasterData?: any[];
  MagicLinkURL?: string;
  ProjectName?: string;
}

export interface ContractRequisitionQuotationDetailsTermsData {
  ContractRequisitionQuotationTermsId?: number,
  Uniquekey?: string,
  ContractRequisitionId?: number,
  VendorId?: number,
  QuotationURL?: string,
  Total?: number,
  ContractRequisitionQuotationData?: ContractRequisitionQuotationData[]
}

export interface ContractRequisitionQuotationData {

}

//used for Contract quotation
export interface AddVendorForContractRequisitionEnquiryRequest {
  ContractRequisitionId: number;
  UniqueKey: string;
  VendorId: string | null;
  ProjectId: number | 0;
}

export interface RevokeFinalizationContractVendorRequest {
  ContractRequisitionId: number;
  UniqueKey: string;
  ProjectId: number;
}

export type SelectedVendorListResponse = ApiResponse<SelectedVendorData[]>;
export type AddVendorForEnquiryRequestResponse = ApiResponse<SelectedVendorData>;
