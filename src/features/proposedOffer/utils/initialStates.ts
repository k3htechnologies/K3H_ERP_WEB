import type {
  AddUpdateProposedOfferExtraCarpetAreaRequest,
  ProposedOfferCorpusDetailsWithPaymentStageData,
  AddUpdateProposedOfferCorpusDetailsRequest,
  ProposedOfferSecurityDepositDetailsWithPaymentStageData,
  AddUpdateProposedOfferSecurityDepositDetailsRequest,
  ProposedOfferShiftingDetailsWithPaymentStageData,
  AddUpdateProposedOfferShiftingDetailsRequest,
  ProposedOfferLienToSocietyDetailsWithPaymentStageData,
  AddUpdateProposedOfferLienToSocietyDetailsRequest,
  AddUpdateProposedOfferParkingAllotmentRequest,
  AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest,
  AddUpdateProposedOfferProjectCompletionRequest,
  AddUpdateProposedOfferRentDetailsRequest,
} from '@/features/proposedOffer/models/ProposedOfferModel';

//#region INITIAL FORM STATE - EXTRA CARPET AREA
export const initialFormStateExtraCarpetArea = (): AddUpdateProposedOfferExtraCarpetAreaRequest => ({
  ProposedOfferExtraCarpetAreaId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  ExtraCarpetAreaOfferedType: '',
  ResidentialExtraCarpetPercent: 0,
  CommercialExtraCarpetPercent: 0
});
//#endregion

//#region INITIAL FORM STATE - CORPUS DETAILS
export const initialFormStateCorpusDetails = (): AddUpdateProposedOfferCorpusDetailsRequest => ({
  ProposedOfferCorpusDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  CorpusOfferedToResidentialAmount: 0,
  CorpusOfferedToCommercialAmount: 0,
  CorpusDetailsWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - CORPUS PAYMENT STAGE
export const initialFormStateCorpusPaymentStage = (): ProposedOfferCorpusDetailsWithPaymentStageData => ({
  ProposedOfferCorpusDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  StagePercentage: 0,
  StagePercentageText: '',
  Amount: 0,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - SECURITY DEPOSIT DETAILS
export const initialFormStateSecurityDepositDetails = (): AddUpdateProposedOfferSecurityDepositDetailsRequest => ({
  ProposedOfferSecurityDepositDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  SecurityDepositToSocietyAmount: 0,
  SecurityDepositToSocietyWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - SECURITY DEPOSIT PAYMENT STAGE
export const initialFormStateSecurityDepositPaymentStage = (): ProposedOfferSecurityDepositDetailsWithPaymentStageData => ({
  ProposedOfferSecurityDepositDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  Amount: 0,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - SHIFTING DETAILS
export const initialFormStateShiftingDetails = (): AddUpdateProposedOfferShiftingDetailsRequest => ({
  ProposedOfferShiftingDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  ShiftingOfferedToResidentialAmount: 0,
  ShiftingOfferedToCommercialAmount: 0,
  ShiftingDetailsWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - SHIFTING PAYMENT STAGE
export const initialFormStateShiftingPaymentStage = (): ProposedOfferShiftingDetailsWithPaymentStageData => ({
  ProposedOfferShiftingDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  StagePercentage: 0,
  StagePercentageText: '',
  Amount: 0,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - LIEN TO SOCIETY DETAILS
export const initialFormStateLienToSocietyDetails = (): AddUpdateProposedOfferLienToSocietyDetailsRequest => ({
  ProposedOfferLienToSocietyDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  ResidentialAreaSqFt: 0,
  CommercialAreaSqFt: 0,
  NumberOfResidentialLienUnits: 0,
  NumberOfCommercialLienUnits: 0,
  LienToSocietyWithPaymentStageJSON: ''
});
//#endregion

//#region INITIAL FORM STATE - LIEN TO SOCIETY PAYMENT STAGE
export const initialFormStateLienToSocietyPaymentStage = (): ProposedOfferLienToSocietyDetailsWithPaymentStageData => ({
  ProposedOfferLienToSocietyDetailsWithPaymentStageId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  Type: '',
  Stage: '',
  CarpetAreaSqFt: 0,
  IsRelease: false,
  CreatedById: 0,
  CreatedBy: '',
  CreatedDate: null,
  ModifiedById: 0,
  ModifiedBy: '',
  ModifiedDate: null,
  LastModifiedBy: '',
  LastModifiedDate: null
});
//#endregion

//#region INITIAL FORM STATE - PARKING ALLOTMENT
export const initialFormStateParkingAllotment = (): AddUpdateProposedOfferParkingAllotmentRequest => ({
  ProposedOfferParkingAllotmentId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  NumberOfParkingAllottedToMembers: 0,
  TotalParkingPercentageAllottedToSociety: 0
});
//#endregion

//#region INITIAL FORM STATE - GST ON EXISTING PLUS FREE AREA
export const initialFormStateGSTonExistingPlusFreeArea = (): AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest => ({
  ProposedOfferGSTonExistingPlusFreeAreaId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  GSTOnAreaByMemberPercent: 0,
  GSTOnAreaByDeveloperPercent: 0
});
//#endregion

//#region INITIAL FORM STATE - PROJECT COMPLETION
export const initialFormStateProjectCompletion = (): AddUpdateProposedOfferProjectCompletionRequest => ({
  ProposedOfferProjectCompletionId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  CompletionTimelineMonths: 0,
  GracePeriodMonths: 0
});
//#endregion

//#region INITIAL FORM STATE - RENT DETAILS
export const initialFormStateRentDetails = (): AddUpdateProposedOfferRentDetailsRequest => ({
  ProposedOfferRentDetailsId: 0,
  Uniquekey: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  BuildingId: 0,
  ProjectId: 0,
  IsAdditionalRent: false,
  Type: '',
  Tenure: '',
  Amount: 0,
  UnitSqFtLumsum: '',
  CarpetAreaSqFt: 0,
  RentStartDate: '',
  RentEndDate: '',
  IsPayBrokerage: false
});
//#endregion

