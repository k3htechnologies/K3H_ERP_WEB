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
  ExportType?: 'Excel' | 'PDF' | 'CONTRACT VENDOR COMPARISON CHART';
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
  IsApproval?: boolean;
  IsFinalized?: boolean;
  VendorFinalizationApproval?: string;
  ContractRequisitionQuotationTermsData?: ContractRequisitionQuotationDetailsTermsData[];
  ContractTypeMasterData?: any[];
  MagicLinkURL?: string;
  ProjectName?: string;
  Total?: number;
  BudgetAmount?: number;
  ExpectedCompletionInDays?: number;
  CreatedById?: number;
  CreatedBy?: string;
  CreatedDate?: Date;
  ModifiedById?: number;
  ModifiedBy?: string;
  ModifiedDate?: Date;
}

export interface ContractRequisitionQuotationDetailsTermsData {
  ContractRequisitionQuotationTermsId?: number,
  UniqueKey?: string,
  ContractRequisitionId?: number,
  VendorId?: number,
  QuotationURL?: string,
  ExpectedCompletionInDays?: number | null;
  ExpectedPaymentInDays?: number | null;
  Total?: number | null,
  ContractRequisitionQuotationData?: ContractRequisitionQuotationData[] | null
}

export interface ContractRequisitionQuotationData {
  BudgetId?: number | null
  ContractRequisitionBOQId?: number | null
  LevelType?: string | null
  LevelId1?: number | null
  LevelId2?: number | null
  LevelId3?: number | null
  LevelId4?: number | null
  OrderBy?: number | null
  Rate?: number | null
  Amount?: number | null
  WBSCode?: string | null
  CategoryName?: string | null
  Level1Name?: string | null
  Level2Name?: string | null
  Level3Name?: string | null
  Level4Name?: string | null
  Level4MaterialName?: string | null
  Uom?: string | null
  Quantity?: number | null
  LabourCost?: number | null
  MaterialCost?: number | null
  PMCost?: number | null
  TotalRate?: number | null
  BudgetAmount?: number | null
  Remark?: string | null
  CGST?: number | null
  SGST?: number | null
  IGST?: number | null
  IsSelected?: boolean
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
