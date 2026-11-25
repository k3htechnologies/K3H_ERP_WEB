import type { ApiResponse } from "@/core/api/ApiResponse"

export interface AddFinalizedVendorRequest {
    MaterialRequisitionId: number;
    Uniquekey: string;
    ProjectId: number;
    MaterialRequisitionDetailIdWiseVendorIdJSON: string;
}

export interface FilterMaterialWiseQuotationRequest {
    MaterialRequisitionId?: number
    Uniquekey?: string
    ProjectId: number | 0
}

export interface MaterialWiseQuotation {
    MaterialRequisitionQuotationId: number;
    Uniquekey?: string;
    MaterialRequisitionQuotationTermsId: number;
    MaterialRequisitionDetailId: number;

    MaterialCode?: string;
    MaterialName?: string;
    SubMaterialName?: string;
    UomCode?: string;
    Uom?: string;
    MaterialRequisitionType?: string;

    LevelId1?: number;
    Level1Name?: string;
    LevelId2?: number;
    Level2Name?: string;
    LevelId3?: number;
    Level3Name?: string;

    LevelId4?: number;
    Level4Name?: string;
    Level4SubMaterialUomCode?: string;
    Level4SubMaterialUom?: string;

    MaterialQuantity: number;
    RequiredDate: string;

    MaterialWiseVendorQuotationData?: MaterialWiseVendorQuotation[];
}
export interface MaterialWiseVendorQuotation {
    VendorId: number;
    SystemGeneratedCode?: string;
    CompanyName?: string;
    CompanyType?: string;
    VendorName?: string;
    MobileNumberCountryCode?: string;
    MobileNumber?: string;
    EmailId?: string;
    GSTNumber?: string;
    GSTCertificateURL?: string;
    Logistics?: string;
    Amount?: number;
    PerPieceAmount?: number;
    ExpectedDeliveryInDays?: number;
    Installation?: number;
    CGST?: number;
    SGST?: number;
    UGST?: number;
    TGST?: number;
    IsApproval: boolean;
    IsFinalized: boolean;
    ApprovalStatus?:string;
}

export interface RevokeFinalizationVendorRequest {
    MaterialRequisitionId: number,
    Uniquekey: string | null,
    ProjectId: number | 0,
}

export type AddFinalizedVendorRequestResponse = ApiResponse<MaterialWiseQuotation>;
export type MaterialWiseQuotationResponse = ApiResponse<MaterialWiseQuotation[]>;
export type RevokeFinalizationVendorResponse = ApiResponse<number>;
