import type { ApiResponse } from "@/core/api/ApiResponse";

export interface MaterialRequisitionQuotationDetailsTermsData {
    MaterialRequisitionQuotationTermsId: number;
    Uniquekey:string;
    MaterialRequisitionId:number;
    VendorId:number;
    ExpectedDeliveryInDays:number;
    ExpectedPaymentInDays:number;
    Total:number;
    MaterialRequisitionQuotationData:MaterialRequisitionQuotationDetailsData[];
    SystemGeneratedCode:string;
    ProjectName:string;
    CompanyName:string;
    VendorName:string;
    MobileNumber:string;
    EmailId:string;
}
export interface MaterialRequisitionQuotationDetailsData {
    MaterialRequisitionQuotationId:number;
    Uniquekey:string;
    MaterialRequisitionQuotationTermsId: number;
    MaterialRequisitionDetailId:number;
    MaterialCode:string;
    MaterialName:string;
    SubMaterialName:string;
    UomCode:string;
    Uom:string;
    MaterialQuantity:number;
    MaterialPerUnit:number;
    Logistics:string;
    Amount:number;
    CGST:number;
    SGST:number;
    UGST:number;
    TGST:number;
    
}

export interface AddUpdateMaterialRequestQuotation {
    MaterialRequisitionQuotationTermsId: number;
    Uniquekey:string;
    MaterialRequisitionId:number;
    VendorId:number;
    ExpectedDeliveryInDays:number;
    ExpectedPaymentInDays:number;
    Total:number;
    ProjectId:number;
    MaterialRequisitionQuotationJSON:string;

}

export interface DeleteMaterialRequisitionQuotation{
    MaterialRequisitionQuotationTermsId: number;
    Uniquekey: string;
    VendorId: number;
    ProjectId:number;
}

export type MaterialRequisitionQuotationListResponse = ApiResponse<MaterialRequisitionQuotationDetailsTermsData[]>;
export type MaterialRequisitionQuotationSaveReponse = ApiResponse<MaterialRequisitionQuotationDetailsTermsData>;
export type DeletMaterialRequisitionDeleteResponse = ApiResponse<number>;