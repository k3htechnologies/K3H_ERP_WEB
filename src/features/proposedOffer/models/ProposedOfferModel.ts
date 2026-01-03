import type { ApiResponse } from "@/core/api/ApiResponse"

//=============================================================
// [ EXTRA CARPET ]
//=============================================================

export interface FilterWithPaginationProposedOfferExtraCarpetAreaRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferExtraCarpetAreaData {
    ProposedOfferExtraCarpetAreaId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number
    ExtraCarpetAreaOfferedType?: string
    ResidentialExtraCarpetPercent?: number
    CommercialExtraCarpetPercent?: number

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferExtraCarpetAreaRequest {
    ProposedOfferExtraCarpetAreaId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    ExtraCarpetAreaOfferedType?: string
    ResidentialExtraCarpetPercent?: number
    CommercialExtraCarpetPercent?: number
}

export type ProposedOfferExtraCarpetAreaListResponse = ApiResponse<ProposedOfferExtraCarpetAreaData[]>;
export type ProposedOfferExtraCarpetAreaSaveResponse = ApiResponse<ProposedOfferExtraCarpetAreaData[]>;

//=============================================================
// [ CORPUS DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferCorpusDetailsRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferCorpusDetailsData {
    ProposedOfferCorpusDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    CorpusOfferedToResidentialAmount?: number
    CorpusOfferedToCommercialAmount?: number
    ProposedOfferCorpusDetailsWithPaymentStageData?: ProposedOfferCorpusDetailsWithPaymentStageData[]

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProposedOfferCorpusDetailsWithPaymentStageData {
    ProposedOfferCorpusDetailsWithPaymentStageId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Type?: string
    Stage?: string
    StagePercentage?: number
    StagePercentageText?: string
    Amount?: number
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferCorpusDetailsRequest {
    ProposedOfferCorpusDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    CorpusOfferedToResidentialAmount?: number
    CorpusOfferedToCommercialAmount?: number
    CorpusDetailsWithPaymentStageJSON?: string
}

export type ProposedOfferCorpusDetailsListResponse = ApiResponse<ProposedOfferCorpusDetailsData[]>;
export type ProposedOfferCorpusDetailsSaveResponse = ApiResponse<ProposedOfferCorpusDetailsData[]>;
//=============================================================
// [ RENT DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferRentDetailsRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferRentDetailsData {
    ProposedOfferRentDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    IsAdditionalRent?: boolean
    Type?: string
    Tenure?: string
    Amount?: number
    UnitSqFtLumsum?: string
    CarpetAreaSqFt?: number
    RentStartDate?: string
    RentEndDate?: string
    IsPayBrokerage?: boolean

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferRentDetailsRequest {
    ProposedOfferRentDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    IsAdditionalRent?: boolean
    Type?: string
    Tenure?: string
    Amount?: number
    UnitSqFtLumsum?: string
    CarpetAreaSqFt?: number
    RentStartDate?: string
    RentEndDate?: string
    IsPayBrokerage?: boolean
}

export interface DeleteProposedOfferRentDetailsRequest {
    ProposedOfferRentDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferRentDetailsListResponse = ApiResponse<ProposedOfferRentDetailsData[]>;
export type ProposedOfferRentDetailsSaveResponse = ApiResponse<ProposedOfferRentDetailsData[]>;
export type ProposedOfferRentDetailsDeleteResponse = ApiResponse<number>;
//=============================================================
// [ SHIFTING DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferShiftingDetailsRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferShiftingDetailsData {
    ProposedOfferShiftingDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    ShiftingOfferedToResidentialAmount?: number
    ShiftingOfferedToCommercialAmount?: number
    ProposedOfferShiftingDetailsWithPaymentStageData?: ProposedOfferShiftingDetailsWithPaymentStageData[]

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProposedOfferShiftingDetailsWithPaymentStageData {
    ProposedOfferShiftingDetailsWithPaymentStageId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Type?: string
    Stage?: string
    StagePercentage?: number
    StagePercentageText? :string | ''
    Amount?: number
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferShiftingDetailsRequest {
    ProposedOfferShiftingDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    ShiftingOfferedToResidentialAmount?: number
    ShiftingOfferedToCommercialAmount?: number
    ShiftingDetailsWithPaymentStageJSON?: string
}

export type ProposedOfferShiftingDetailsListResponse = ApiResponse<ProposedOfferShiftingDetailsData[]>;
export type ProposedOfferShiftingDetailsSaveResponse = ApiResponse<ProposedOfferShiftingDetailsData[]>;


//=============================================================
// [ SECURITY DEPOSIT DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferSecurityDepositDetailsRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferSecurityDepositDetailsData {
    ProposedOfferSecurityDepositDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    SecurityDepositToSocietyAmount?: number
    ProposedOfferSecurityDepositDetailsWithPaymentStageData?: ProposedOfferSecurityDepositDetailsWithPaymentStageData[]

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProposedOfferSecurityDepositDetailsWithPaymentStageData {
    ProposedOfferSecurityDepositDetailsWithPaymentStageId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Type?: string
    Stage?: string
    Amount?: number

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferSecurityDepositDetailsRequest {
    ProposedOfferSecurityDepositDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    SecurityDepositToSocietyAmount?: number
    SecurityDepositToSocietyWithPaymentStageJSON?: string
}

export type ProposedOfferSecurityDepositDetailsListResponse = ApiResponse<ProposedOfferSecurityDepositDetailsData[]>;
export type ProposedOfferSecurityDepositDetailsSaveResponse = ApiResponse<ProposedOfferSecurityDepositDetailsData[]>;

//=============================================================
// [ LIEN TO SOCIETY DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferLienToSocietyDetailsRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferLienToSocietyDetailsData {
    ProposedOfferLienToSocietyDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    ResidentialAreaSqFt?: number
    CommercialAreaSqFt?: number
    NumberOfResidentialLienUnits?: number
    NumberOfCommercialLienUnits?: number
    ProposedOfferSecurityDepositDetailsWithPaymentStageData?: ProposedOfferLienToSocietyDetailsWithPaymentStageData[]

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProposedOfferLienToSocietyDetailsWithPaymentStageData {
    ProposedOfferLienToSocietyDetailsWithPaymentStageId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Type?: string
    CarpetAreaSqFt?: number
    Stage?: string
    IsRelease?: boolean

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferLienToSocietyDetailsRequest {
    ProposedOfferLienToSocietyDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    ResidentialAreaSqFt?: number
    CommercialAreaSqFt?: number
    NumberOfResidentialLienUnits?: number
    NumberOfCommercialLienUnits?: number
    LienToSocietyWithPaymentStageJSON?: string
}

export type ProposedOfferLienToSocietyDetailsListResponse = ApiResponse<ProposedOfferLienToSocietyDetailsData[]>;
export type ProposedOfferLienToSocietyDetailsSaveResponse = ApiResponse<ProposedOfferLienToSocietyDetailsData[]>;

//=============================================================
// [ PARKING ALLOTMENT ]
//=============================================================

export interface FilterWithPaginationProposedOfferParkingAllotmentRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferParkingAllotmentData {
    ProposedOfferParkingAllotmentId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    NumberOfParkingAllottedToMembers?: number
    TotalParkingPercentageAllottedToSociety?: number

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferParkingAllotmentRequest {
    ProposedOfferParkingAllotmentId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    NumberOfParkingAllottedToMembers?: number
    TotalParkingPercentageAllottedToSociety?: number
}


export type ProposedOfferParkingAllotmentListResponse = ApiResponse<ProposedOfferParkingAllotmentData[]>;
export type ProposedOfferParkingAllotmentSaveResponse = ApiResponse<ProposedOfferParkingAllotmentData[]>;

//=============================================================
// [ GST ON EXISTING + FREE AREA ]
//=============================================================

export interface FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferGSTonExistingPlusFreeAreaData {
    ProposedOfferGSTonExistingPlusFreeAreaId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    GSTOnAreaByMemberPercent?: number
    GSTOnAreaByDeveloperPercent?: number

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest {
    ProposedOfferGSTonExistingPlusFreeAreaId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    GSTOnAreaByMemberPercent?: number
    GSTOnAreaByDeveloperPercent?: number
}

export type ProposedOfferGSTonExistingPlusFreeAreaListResponse = ApiResponse<ProposedOfferGSTonExistingPlusFreeAreaData[]>;
export type ProposedOfferGSTonExistingPlusFreeAreaSaveResponse = ApiResponse<ProposedOfferGSTonExistingPlusFreeAreaData[]>;

//=============================================================
// [ PROJECT COMPLETION ]
//=============================================================
export interface FilterWithPaginationProposedOfferProjectCompletionRequest {
    
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferProjectCompletionData {
    ProposedOfferProjectCompletionId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    CompletionTimelineMonths?: number
    GracePeriodMonths?: number

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferProjectCompletionRequest {
    ProposedOfferProjectCompletionId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    CompletionTimelineMonths?: number
    GracePeriodMonths?: number
}

export type ProposedOfferProjectCompletionListResponse = ApiResponse<ProposedOfferProjectCompletionData[]>;
export type ProposedOfferProjectCompletionSaveResponse = ApiResponse<ProposedOfferProjectCompletionData[]>;

//=============================================================
// [ PROPOSED PLAN ]
//=============================================================
export interface FilterWithPaginationProposedOfferProposedPlanRequest {
    
    ProjectId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferProposedPlanData {
    ProposedOfferProposedPlanId?: number
    Uniquekey?: string
    ProjectId: number
    TotalNumberOfFloors?: number
    TotalUnits?: number
    PlanDocumentURL?: string
    TotalParking?: number
    Amenities?: string

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferProposedPlanRequest {
    ProposedOfferProposedPlanId?: number
    Uniquekey?: string
    ProjectId?: number
    TotalNumberOfFloors?: number
    TotalUnits?: number
    PlanDocumentURL?: File[] | null
    RemovePlanDocumentURL?: string
    TotalParking?: number
    Amenities?: string
}

export type ProposedOfferProposedPlanListResponse = ApiResponse<ProposedOfferProposedPlanData[]>;
export type ProposedOfferProposedPlanSaveResponse = ApiResponse<ProposedOfferProposedPlanData[]>;

