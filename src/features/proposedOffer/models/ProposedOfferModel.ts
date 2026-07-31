import type { ApiResponse } from "@/core/api/ApiResponse"

//=============================================================
// [ PDF ]
//=============================================================

export interface FilterWithPaginationProposedOfferPdfRequest {
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export type ProposedOfferPDFResponse = ApiResponse<string>;
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
    Remark?: string

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
    Remark?: string

}

export type ProposedOfferExtraCarpetAreaListResponse = ApiResponse<ProposedOfferExtraCarpetAreaData[]>;
export type ProposedOfferExtraCarpetAreaSaveResponse = ApiResponse<ProposedOfferExtraCarpetAreaData[]>;

//=============================================================
// [ HARDSHIP DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferHardshipDetailsRequest {

    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferHardshipDetailsData {
    ProposedOfferHardshipDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    HardshipOfferedToResidentialAmount?: number
    HardshipOfferedToCommercialAmount?: number
    ProposedOfferHardshipDetailsWithPaymentStageData?: ProposedOfferHardshipDetailsWithPaymentStageData[]
    Remark?: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProposedOfferHardshipDetailsWithPaymentStageData {
    ProposedOfferHardshipDetailsWithPaymentStageId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Type?: string
    Stage?: string
    StagePercentage?: number
    StagePercentageText?: string
    Amount?: number
    UnitSqFtLumsum?: string
    CarpetAreaSqFt?: number
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferHardshipDetailsRequest {
    ProposedOfferHardshipDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    HardshipOfferedToResidentialAmount?: number
    HardshipOfferedToCommercialAmount?: number
    HardshipDetailsWithPaymentStageJSON?: string
    Remark?: string
}

export interface DeleteProposedOfferHardshipDetailsRequest {
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferHardshipDetailsListResponse = ApiResponse<ProposedOfferHardshipDetailsData[]>;
export type ProposedOfferHardshipDetailsSaveResponse = ApiResponse<ProposedOfferHardshipDetailsData[]>;
export type ProposedOfferHardshipDetailsDeleteResponse = ApiResponse<number>;
//=============================================================
// [ RENT DETAILS ]
//=============================================================

export interface FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest {

    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferTemporaryAccommodationAlternativeData {
    ProposedOfferTemporaryAccommodationAlternativeDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    IsAdditionalTemporaryAccommodationAlternative?: boolean
    Type?: string
    Tenure?: string
    Amount?: number
    UnitSqFtLumsum?: string
    CarpetAreaSqFt?: number
    TemporaryAccommodationAlternativeStartDate?: string
    TemporaryAccommodationAlternativeEndDate?: string
    IsPayBrokerage?: boolean
    Remark?: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest {
    ProposedOfferTemporaryAccommodationAlternativeDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    IsAdditionalTemporaryAccommodationAlternative?: boolean
    Type?: string
    Tenure?: string
    Amount?: number
    UnitSqFtLumsum?: string
    CarpetAreaSqFt?: number
    TemporaryAccommodationAlternativeStartDate?: string
    TemporaryAccommodationAlternativeEndDate?: string
    IsPayBrokerage?: boolean
    Mode?: string
    Brokerage?: number
    Remark?: string
}

export interface DeleteProposedOfferTemporaryAccommodationAlternativeRequest {
    ProposedOfferTemporaryAccommodationAlternativeDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferTemporaryAccommodationAlternativeListResponse = ApiResponse<ProposedOfferTemporaryAccommodationAlternativeData[]>;
export type ProposedOfferTemporaryAccommodationAlternativeSaveResponse = ApiResponse<ProposedOfferTemporaryAccommodationAlternativeData[]>;
export type ProposedOfferTemporaryAccommodationAlternativeDeleteResponse = ApiResponse<number>;
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
    Remark?: string
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
    StagePercentageText?: string | ''
    Remark?: string

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
    Remark?: string
    ShiftingDetailsWithPaymentStageJSON?: string

}

export interface DeleteProposedOfferShiftingDetailsRequest {
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferShiftingDetailsListResponse = ApiResponse<ProposedOfferShiftingDetailsData[]>;
export type ProposedOfferShiftingDetailsSaveResponse = ApiResponse<ProposedOfferShiftingDetailsData[]>;
export type ProposedOfferShiftingDetailsDeleteResponse = ApiResponse<number>;

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
    InterestAmount?: number
    Remark?: string
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
    InterestAmount?: number
    Remark?: string
    SecurityDepositToSocietyWithPaymentStageJSON?: string
}

export interface DeleteProposedOfferSecurityDepositDetailsRequest {
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferSecurityDepositDetailsListResponse = ApiResponse<ProposedOfferSecurityDepositDetailsData[]>;
export type ProposedOfferSecurityDepositDetailsSaveResponse = ApiResponse<ProposedOfferSecurityDepositDetailsData[]>;
export type ProposedOfferSecurityDepositDetailsDeleteResponse = ApiResponse<number>;
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
    ResidentialInventoryFlatId?: string
    ResidentialFlat?: string
    NumberOfCommercialLienUnits?: number
    CommercialInventoryFlatId?: string
    CommercialFlat?: string
    Remark?: string
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
    ResidentialInventoryFlatId?: string
    NumberOfCommercialLienUnits?: number
    CommercialInventoryFlatId?: string
    Remark?: string
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
    Remark?: string
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
    Remark?: string
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
    Remark?: string

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
    Remark?: string
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
    Remark?: string

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
    Remark?: string
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
    TotalNumberOfBuilding?: number;
    BuildingProposedPlanData?: BuildingProposedPlanData[] | null;
}

export interface BuildingProposedPlanData {
    BuildingProposedPlanId?: number
    Uniquekey?: string
    ProposedOfferProposedPlanId?: number;
    ProjectId?: number;
    BuildingName?: string;
    TotalNumberOfWing?: number;
    TotalPodium?: number;
    TotalUnits?: number;
    TotalParking?: number;
    PlanDocumentURL?: string;
    ThreeDViewURL?: string;
    WalkthroughViewURL?: string
    SalesPlanURL?: string
    Amenities?: string
    SalesResidentialParking?: number;
    SalesCommercialParking?: number;
    SalesVisitorsParking?: number;
    MemberResidentialParking?: number;
    MemberCommercialParking?: number;
    MemberVisitorsParking?: number;
    WingProposedPlanData?: WingProposedPlanData[] | null;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface WingProposedPlanData {
    ProposedPlanWingWiseId: number | null
    BuildingName: string | null
    Wings: string | null
    MainEntranceLobbyAreaSqFt: number | null;
    TotalNumberOfLifts: number | null;
    TotalNumberOfUnits: number | null;
    TotalNumberOfUnitsForMember: number | null;
    TotalNumberOfUnitsForSale: number | null;
    TotalNumberOfAreaForMemberSqFt: number | null;
    TotalNumberOfAreaForSaleSqFt: number | null;
}

export interface AddUpdateProposedPlanRequest {
    ProposedOfferProposedPlanId?: number;
    Uniquekey?: string;
    ProjectId?: number;
    TotalNumberOfBuilding?: number
}

export interface CopyProposedPlanRequest {
    ProjectId?: number;
    ProposedOfferProposedPlanId?: number;
    SourceBuildingProposedPlanId?: number;
    CopyBuildingProposedPlanId?: string;
}

export interface AddUpdateBuildingProposedPlanRequest {
    ProposedOfferProposedPlanId?: number
    BuildingProposedPlanId?: number
    Uniquekey?: string
    ProjectId?: number
    TotalNumberOfWing?: number
    TotalPodium?: number
    TotalUnits?: number
    TotalParking?: number
    PlanDocumentURL?: File[] | null
    RemovePlanDocumentURL?: string
    ThreeDViewURL?: File[] | null
    RemoveThreeDViewURL?: string
    WalkthroughViewURL?: File[] | null
    RemoveWalkthroughViewURL?: string
    SalesPlanURL?: File[] | null
    RemoveSalesPlanURL?: string
    Amenities?: string
    SalesResidentialParking?: number;
    SalesCommercialParking?: number;
    SalesVisitorsParking?: number;
    MemberResidentialParking?: number;
    MemberCommercialParking?: number;
    MemberVisitorsParking?: number;
    WingProposedPlanJSON?: string | null
}

export type ProposedOfferProposedPlanListResponse = ApiResponse<ProposedOfferProposedPlanData[]>;
export type ProposedOfferProposedPlanSaveResponse = ApiResponse<ProposedOfferProposedPlanData[]>;

//=============================================================
// [ GENERATE PROPOSED PLAN ]
//=============================================================

export interface AddUpdateGenerateProposedOfferRequest {
    BuildingId?: number
    ProjectId: number
    Tenure?: string
    ChargeType?: string
    IsPayBrokerage?: boolean
    IsAdditionalTemporaryAccommodationAlternative?: boolean
}

export type GenerateProposedOfferResponse = ApiResponse<number>;


//=============================================================
// [ READY RECKONER ]
//=============================================================

export interface FilterWithPaginationProposedOfferReadyReckonerRateRequest {

    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ProposedOfferReadyReckonerRateData {
    ProposedOfferReadyReckonerRateDetailsId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Zone?: string
    SubZone?: string
    ResidentialRate?: number
    CommercialRate?: number
    ShopRate?: number
    IndustrialRate?: number
    LandRate?: number
    EffectiveStartDate?: string
    EffectiveEndDate?: string
    FinancialYear?: string
    Remark?: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateProposedOfferReadyReckonerRateRequest {
    ProposedOfferReadyReckonerRateDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    Zone?: string
    SubZone?: string
    ResidentialRate?: number
    CommercialRate?: number
    ShopRate?: number
    IndustrialRate?: number
    LandRate?: number
    EffectiveStartDate?: string
    EffectiveEndDate?: string
    FinancialYear?: string
    Remark?: string
}

export interface DeleteProposedOfferReadyReckonerRateRequest {
    ProposedOfferReadyReckonerRateDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferReadyReckonerRateListResponse = ApiResponse<ProposedOfferReadyReckonerRateData[]>;
export type ProposedOfferReadyReckonerRateSaveResponse = ApiResponse<ProposedOfferReadyReckonerRateData[]>;
export type ProposedOfferReadyReckonerRateDeleteResponse = ApiResponse<number>;

// ADDITIONAL INFORMATION

export interface FilterWithPaginationAdditionalInformationRequest {
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface AdditionalInformationData {
    ProposedOfferAdditionalInformationId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number
    TaxAndDutiesDetails?: string
    TaxRemark?: string
    PurchaseOfAdditonalAreaRemark?: string,
    AdditionalRemark?: string
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateAdditionalInformationRequest {
    ProposedOfferAdditionalInformationId?: number,
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number,
    TaxAndDutiesDetails?: string,
    TaxRemark?: string,
    PurchaseOfAdditonalAreaRemark?: string,
    AdditionalRemark?: string
}

export type AdditionalInformationListResponse = ApiResponse<AdditionalInformationData[]>;
export type AdditionalInformationSaveResponse = ApiResponse<AdditionalInformationData[]>;



