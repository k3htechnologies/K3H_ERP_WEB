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
    Remark?: string

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
    CorpusPaymentStageRemark?: string
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
    Remark?: string
}

export interface DeleteProposedOfferCorpusDetailsRequest {
    BuildingId?: number
    ProjectId: number
}

export type ProposedOfferCorpusDetailsListResponse = ApiResponse<ProposedOfferCorpusDetailsData[]>;
export type ProposedOfferCorpusDetailsSaveResponse = ApiResponse<ProposedOfferCorpusDetailsData[]>;
export type ProposedOfferCorpusDetailsDeleteResponse = ApiResponse<number>;
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

    RentOfferedToResidential?: number
    RentOfferedToCommercial?: number
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
    Mode?: string
    Brokerage?: number
    Remark?: string
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
    ShiftingDetailsWithPaymentStageJSON?: string
    Remark?: string
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

export interface AddUpdateProposedOfferSecurityDepositDetailsRequest {
    ProposedOfferSecurityDepositDetailsId: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId: number
    SecurityDepositToSocietyAmount?: number
    SecurityDepositToSocietyWithPaymentStageJSON?: string
    Remark?: string
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
    Remark?: string
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
    Remark?: string
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
    TotalNumberOfWing?: number;
    TotalPodium?: number;
    TotalUnits?: number;
    TotalParking?: number;
    PlanDocumentURL?: string;
    ThreeDViewURL?: string;
    WalkthroughViewURL?: string
    SalesPlanURL?: string
    Amenities?: string
    ProposedPlanWingWiseData?: ProposedPlanWingWiseData[] | null;
    SalesResidentialParking?: number;
    SalesCommercialParking?: number;
    SalesVisitorsParking?: number;
    MemberResidentialParking?: number;
    MemberCommercialParking?: number;
    MemberVisitorsParking?: number;
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface ProposedPlanWingWiseData {
    ProposedPlanWingWiseId: number | null
    BuildingId: number | null
    Wings: string | null
    MainEntranceLobbyAreaSqFt: number | null;
    TotalNumberOfLifts: number | null;
    TotalNumberOfUnits: number | null;
    TotalNumberOfUnitsForMember: number | null;
    TotalNumberOfUnitsForSale: number | null;
    TotalNumberOfAreaForMemberSqFt: number | null;
    TotalNumberOfAreaForSaleSqFt: number | null;
}

export interface AddUpdateProposedOfferProposedPlanRequest {
    ProposedOfferProposedPlanId?: number
    Uniquekey?: string
    ProjectId?: number
    TotalNumberOfBuilding?: number
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
    ProposedOfferProposedPlanJSON?: string | null
    SalesResidentialParking?: number;
    SalesCommercialParking?: number;
    SalesVisitorsParking?: number;
    MemberResidentialParking?: number;
    MemberCommercialParking?: number;
    MemberVisitorsParking?: number;
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
    IsAdditionalRent?: boolean
}

export type GenerateProposedOfferResponse = ApiResponse<number>;


//=============================================================
// [ READY RECKONER ]
//=============================================================

export interface FilterWithPaginationReadyReckonerRequest {
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface ReadyReckonerData {
    ReadyReckonerDataId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number
    ReadyReckonerZone: string
    LandReadyReckonerRate?: number
    ResidentialReadyReckonerRate?: number
    GroundShopReadyReckonerRate?: number
    OfficerReadyReckonerRate?: number
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateReadyReckonerRequest {
    ReadyReckonerId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number
    ReadyReckonerZone: string
    LandReadyReckonerRate?: number
    ResidentialReadyReckonerRate?: number
    GroundShopReadyReckonerRate?: number
    OfficeReadyReckonerRate?: number
    Remark?: string
}

export type ReadyReckonerListResponse = ApiResponse<ReadyReckonerData[]>;
export type ReadyReckonerSaveResponse = ApiResponse<ReadyReckonerData[]>;


//=============================================================
// [ READY RECKONER ]
//=============================================================

export interface FilterWithPaginationCarpetAreaRequest {
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface CarpetAreaData {
    CarpetAreaId?: number,
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number,
    ExistingCarpetAreaResidentialMembersSqFt?: number,
    ExistingCarpetAreaCommercialMembersSqft?: number,
    ExistingCarpetAreaOfEachGarageSqft?: number,
    TerraceAreaUtilizedByMembersSqFt?: number,
    Remark?: string,
    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdateCarpetAreaRequest {
    CarpetAreaId?: number,
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number,
    ExistingCarpetAreaResidentialMembersSqFt?: number,
    ExistingCarpetAreaCommercialMembersSqFt?: number,
    ExistingCarpetAreaOfEachGarageSqFt?: number,
    TerraceAreaUtilizedByMembersSqFt?: number,
    Remark?: string
}

export type CarpetAreaListResponse = ApiResponse<CarpetAreaData[]>;
export type CarpetAreaSaveResponse = ApiResponse<CarpetAreaData[]>;

// ADDITIONAL INFORMATION

export interface FilterWithPaginationAdditionalInformationRequest {
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface AdditionalInformationData {
    AdditionalInformationId?: number
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number
    TaxAndDutiesDetails?: string
    TaxRemark?: string
    PurchaseOfAdditonalAreaRemark?: string,
    AdditonalRemark?: string
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
    AdditionalInformationId?: number,
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


// PLOT AREA
export interface FilterWithPaginationPlotAreaRequest {
    ProjectId?: number
    BuildingId?: number
    ExportType?: 'Excel' | 'PDF'
}

export interface PlotAreaData {
    PlotAreaId?: number,
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number,


    GrossPlotAreaSqFt?: number,
    PlotAreaAsPhysicalSurveySqFt?: number,
    PlotAreaAsPerOldApprovedPlansSqFt?: number,
    PlotAreaAsPerConveyanceSqFt?: number,
    PlotAreaAsPerPrCardSqFt?: number,
    Remark?: string,

    CreatedById: number | 0
    CreatedBy: string | ''
    CreatedDate: string | null
    ModifiedById: number | 0
    ModifiedBy: string | ''
    ModifiedDate: string | null
    LastModifiedBy: string | ''
    LastModifiedDate: string | null
}

export interface AddUpdatePlotAreaRequest {
    PlotAreaId?: number,
    Uniquekey?: string
    BuildingId?: number
    ProjectId?: number,

    GrossPlotAreaSqFt?: number,
    PlotAreaAsPhysicalSurveySqFt?: number,
    PlotAreaAsPerOldApprovedPlansSqFt?: number,
    PlotAreaAsPerConveyanceSqFt?: number,
    PlotAreaAsPerPrCardSqFt?: number,
    Remark?: string,

}

export type PlotAreaListResponse = ApiResponse<PlotAreaData[]>;
export type PlotAreaSaveResponse = ApiResponse<PlotAreaData[]>;

