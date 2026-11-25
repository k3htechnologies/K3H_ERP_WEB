import type { ApiResponse } from "@/core/api/ApiResponse";

export interface FilterMaterialRequisitionQuotationRequest {
    MaterialRequisitionId: number;
    Uniquekey: string;
    VendorId: string | null;
    ProjectId: number | 0;
}
export interface MaterialRequisitionQuotationTermsData {
    MaterialRequisitionQuotationTermsId: number;
    Uniquekey:string;
    MaterialRequisitionId:number;
    VendorId:number;
    ExpectedDeliveryInDays:number;
    ExpectedPaymentInDays:number;
    QuotationURL: string | null
    Total:number;
    MaterialRequisitionQuotationData:MaterialRequisitionQuotationData[];
    SystemGeneratedCode:string;
    ProjectName:string;
    CompanyName:string;
    VendorName:string;
    MobileNumber:string;
    EmailId:string;
}
export interface MaterialRequisitionQuotationData {
    MaterialRequisitionQuotationId:number;
    Uniquekey:string;
    MaterialRequisitionQuotationTermsId: number;
    MaterialRequisitionDetailId:number;
    MaterialCode:string;
    MaterialName:string;
    SubMaterialName:string;
    UomCode:string;
    Uom:string;
    MaterialRequisitionType:string;
    LevelId1:number;
    Level1Name:string;
    LevelId2:number;
    Level2Name:string;
    LevelId3:number;
    Level3Name:string;
    LevelId4:number;
    Level4Name:string;
    Level4SubMaterialUomCode:string;
    Level4SubMaterialUom:string;
    MaterialQuantity:number;
    MaterialPerUnit:number;
    Logistics:string;
    Amount:number;
    Installation:number;
    CGST:number;
    SGST:number;
    UGST:number;
    TGST:number;
    IsFinalized: boolean;
    ApprovalStatus: string | null;
}

export interface AddUpdateMaterialRequestQuotation {
    MaterialRequisitionQuotationTermsId: number;
    Uniquekey:string;
    MaterialRequisitionId:number;
    VendorId:number;
    ExpectedDeliveryInDays:number;
    ExpectedPaymentInDays:number;
    Total:number;
    QuotationURL: (File | string)[] | null;
    RemoveQuotationURL: string | '';
    ProjectId:number;
    MaterialRequisitionQuotationJSON:string;
}

export interface DeleteMaterialRequisitionQuotationRequest{
    MaterialRequisitionQuotationTermsId: number;
    Uniquekey: string;
    VendorId: number;
    ProjectId:number;
}

export interface FilterWithMaterialRequisitionSummaryOfQuotationRequest {
    MaterialRequisitionId?: number | 0
    ProjectId: number | 0
    VendorName?: string | null
}

export interface MaterialRequisitionSummaryOfQuotationData {
    VendorName:string;
    CompanyName:string;
    ExpectedDeliveryInDays:number;
    ExpectedPaymentInDays:number;
    Total:number;
    QuotationURL: string | null
    QuotationType:string;
    QuotationLevel:string;
}
export interface FilterSelectedVendorForQuotationRequest {
    MaterialRequisitionId?: number
    Uniquekey?: string
    ProjectId: number | 0
    MaterialRequisitionDetailId?:string
    ExportType?:'Excel' | 'PDF' | 'VENDOR COMPARISON CHART'
}

export interface SelectedVendorQuotationData {
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
    MaterialRequisitionQuotationTermsData: MaterialRequisitionQuotationTermsData[];
    SubMaterialMasterData: any[];
    ContractTypeMasterData: any[];
    MagicLinkURL: string;
    SystemGeneratedCode: string;
    ProjectName: string;
}


export type MaterialRequisitionQuotationListResponse = ApiResponse<MaterialRequisitionQuotationTermsData[]>;
export type MaterialRequisitionQuotationSaveReponse = ApiResponse<MaterialRequisitionQuotationTermsData>;
export type DeletMaterialRequisitionQuotationResponse = ApiResponse<number>;
export type MaterialRequisitionSummaryOfQuotationListResponse = ApiResponse<MaterialRequisitionSummaryOfQuotationData[]>;
export type SelectedVendorForQuotationListResponse = ApiResponse<SelectedVendorQuotationData[]>;