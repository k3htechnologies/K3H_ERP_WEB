import * as E from 'fp-ts/Either'
import type { Failure } from '@/core/api/FailureResponse'

import { ProposedOfferDatasourceImpl } from '@/features/proposedOffer/datasources/ProposedOfferDatasource'

import type {

    // EXTRA CARPET
    FilterWithPaginationProposedOfferExtraCarpetAreaRequest,
    AddUpdateProposedOfferExtraCarpetAreaRequest,
    ProposedOfferExtraCarpetAreaListResponse,
    ProposedOfferExtraCarpetAreaSaveResponse,

    // CORPUS
    FilterWithPaginationProposedOfferHardshipDetailsRequest,
    AddUpdateProposedOfferHardshipDetailsRequest,
    ProposedOfferHardshipDetailsListResponse,
    ProposedOfferHardshipDetailsSaveResponse,

    // RENT
    FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest,
    AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest,
    DeleteProposedOfferTemporaryAccommodationAlternativeRequest,
    ProposedOfferTemporaryAccommodationAlternativeListResponse,
    ProposedOfferTemporaryAccommodationAlternativeSaveResponse,
    ProposedOfferTemporaryAccommodationAlternativeDeleteResponse,

    // SHIFTING
    FilterWithPaginationProposedOfferShiftingDetailsRequest,
    AddUpdateProposedOfferShiftingDetailsRequest,
    ProposedOfferShiftingDetailsListResponse,
    ProposedOfferShiftingDetailsSaveResponse,

    // SECURITY DEPOSIT
    FilterWithPaginationProposedOfferSecurityDepositDetailsRequest,
    AddUpdateProposedOfferSecurityDepositDetailsRequest,
    ProposedOfferSecurityDepositDetailsListResponse,
    ProposedOfferSecurityDepositDetailsSaveResponse,

    // LIEN
    FilterWithPaginationProposedOfferLienToSocietyDetailsRequest,
    AddUpdateProposedOfferLienToSocietyDetailsRequest,
    ProposedOfferLienToSocietyDetailsListResponse,
    ProposedOfferLienToSocietyDetailsSaveResponse,

    // PARKING
    FilterWithPaginationProposedOfferParkingAllotmentRequest,
    AddUpdateProposedOfferParkingAllotmentRequest,
    ProposedOfferParkingAllotmentListResponse,
    ProposedOfferParkingAllotmentSaveResponse,

    // GST
    FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest,
    AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest,
    ProposedOfferGSTonExistingPlusFreeAreaListResponse,
    ProposedOfferGSTonExistingPlusFreeAreaSaveResponse,

    // PROJECT COMPLETION
    FilterWithPaginationProposedOfferProjectCompletionRequest,
    AddUpdateProposedOfferProjectCompletionRequest,
    ProposedOfferProjectCompletionListResponse,
    ProposedOfferProjectCompletionSaveResponse,

    // PROPOSED PLAN
    FilterWithPaginationProposedOfferProposedPlanRequest,
    ProposedOfferProposedPlanListResponse,
    ProposedOfferProposedPlanSaveResponse,
    AddUpdateGenerateProposedOfferRequest,
    GenerateProposedOfferResponse,
    DeleteProposedOfferHardshipDetailsRequest,
    ProposedOfferHardshipDetailsDeleteResponse,
    DeleteProposedOfferShiftingDetailsRequest,
    ProposedOfferShiftingDetailsDeleteResponse,
    DeleteProposedOfferSecurityDepositDetailsRequest,
    ProposedOfferSecurityDepositDetailsDeleteResponse,

    // READY RECKONER
    ProposedOfferReadyReckonerRateListResponse,
    FilterWithPaginationProposedOfferReadyReckonerRateRequest,
    ProposedOfferReadyReckonerRateSaveResponse,
    AddUpdateProposedOfferReadyReckonerRateRequest,


    // ADDITIONAL INFO
    FilterWithPaginationAdditionalInformationRequest,
    AdditionalInformationListResponse,
    AddUpdateAdditionalInformationRequest,
    AdditionalInformationSaveResponse,
    ProposedOfferReadyReckonerRateDeleteResponse,
    DeleteProposedOfferReadyReckonerRateRequest,
    FilterWithPaginationProposedOfferPdfRequest,
    ProposedOfferPDFResponse,
    

} from '@/features/proposedOffer/models/ProposedOfferModel'

//=============================================================
// [ DATASOURCE INSTANCE ]
//=============================================================
const proposedOfferDatasource = new ProposedOfferDatasourceImpl()

//=============================================================
// [ SERVICE ]
//=============================================================
export const proposedOfferService = {

    //==================== PDF ====================
    apiCallPullProposedOfferPDF: async (params: FilterWithPaginationProposedOfferPdfRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferPDFResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullProposedOfferPDF(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== EXTRA CARPET ====================
    apiCallPullExtraCarpetArea: async (params: FilterWithPaginationProposedOfferExtraCarpetAreaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferExtraCarpetAreaListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullExtraCarpetArea(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateExtraCarpetArea: async (params: AddUpdateProposedOfferExtraCarpetAreaRequest): Promise<E.Either<Failure, ProposedOfferExtraCarpetAreaSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateExtraCarpetArea(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== CORPUS ====================
    apiCallPullHardshipDetails: async (params: FilterWithPaginationProposedOfferHardshipDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferHardshipDetailsListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullHardshipDetails(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateHardshipDetails: async (params: AddUpdateProposedOfferHardshipDetailsRequest): Promise<E.Either<Failure, ProposedOfferHardshipDetailsSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateHardshipDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteHardshipDetails: async (params: DeleteProposedOfferHardshipDetailsRequest): Promise<E.Either<Failure, ProposedOfferHardshipDetailsDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteHardshipDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== RENT ====================
    apiCallPullTemporaryAccommodationAlternative: async (params: FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferTemporaryAccommodationAlternativeListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullTemporaryAccommodationAlternative(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateTemporaryAccommodationAlternative: async (params: AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest): Promise<E.Either<Failure, ProposedOfferTemporaryAccommodationAlternativeSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateTemporaryAccommodationAlternative(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteTemporaryAccommodationAlternative: async (params: DeleteProposedOfferTemporaryAccommodationAlternativeRequest): Promise<E.Either<Failure, ProposedOfferTemporaryAccommodationAlternativeDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteTemporaryAccommodationAlternative(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== SHIFTING ====================
    apiCallPullShiftingDetails: async (params: FilterWithPaginationProposedOfferShiftingDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferShiftingDetailsListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullShiftingDetails(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateShiftingDetails: async (params: AddUpdateProposedOfferShiftingDetailsRequest): Promise<E.Either<Failure, ProposedOfferShiftingDetailsSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateShiftingDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteShiftingDetails: async (params: DeleteProposedOfferShiftingDetailsRequest): Promise<E.Either<Failure, ProposedOfferShiftingDetailsDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteShiftingDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },
    //==================== SECURITY DEPOSIT ====================
    apiCallPullSecurityDepositDetails: async (params: FilterWithPaginationProposedOfferSecurityDepositDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferSecurityDepositDetailsListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullSecurityDepositDetails(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateSecurityDepositDetails: async (params: AddUpdateProposedOfferSecurityDepositDetailsRequest): Promise<E.Either<Failure, ProposedOfferSecurityDepositDetailsSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateSecurityDepositDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteSecurityDepositDetails: async (params: DeleteProposedOfferSecurityDepositDetailsRequest): Promise<E.Either<Failure, ProposedOfferSecurityDepositDetailsDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteSecurityDepositDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== LIEN ====================
    apiCallPullLienToSocietyDetails: async (params: FilterWithPaginationProposedOfferLienToSocietyDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferLienToSocietyDetailsListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullLienToSocietyDetails(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateLienToSocietyDetails: async (params: AddUpdateProposedOfferLienToSocietyDetailsRequest): Promise<E.Either<Failure, ProposedOfferLienToSocietyDetailsSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateLienToSocietyDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== PARKING ====================
    apiCallPullParkingAllotment: async (params: FilterWithPaginationProposedOfferParkingAllotmentRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferParkingAllotmentListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullParkingAllotment(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateParkingAllotment: async (params: AddUpdateProposedOfferParkingAllotmentRequest): Promise<E.Either<Failure, ProposedOfferParkingAllotmentSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateParkingAllotment(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== GST ====================
    apiCallPullGSTonExistingPlusFreeArea: async (params: FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferGSTonExistingPlusFreeAreaListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullGSTonExistingPlusFreeArea(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateGSTonExistingPlusFreeArea: async (params: AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest): Promise<E.Either<Failure, ProposedOfferGSTonExistingPlusFreeAreaSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateGSTonExistingPlusFreeArea(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== PROJECT COMPLETION ====================
    apiCallPullProjectCompletion: async (params: FilterWithPaginationProposedOfferProjectCompletionRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferProjectCompletionListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullProjectCompletion(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateProjectCompletion: async (params: AddUpdateProposedOfferProjectCompletionRequest): Promise<E.Either<Failure, ProposedOfferProjectCompletionSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateProjectCompletion(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== PROPOSED PLAN ====================
    apiCallPullProposedPlan: async (params: FilterWithPaginationProposedOfferProposedPlanRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferProposedPlanListResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.pullProposedPlan(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateProposedPlan: async (formData: FormData): Promise<E.Either<Failure, ProposedOfferProposedPlanSaveResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.addUpdateProposedPlan(formData))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    //====================GENERATE PROPOSED PLAN ====================

    apiCallAddUpdateGenerateProposedOffer: async (params: AddUpdateGenerateProposedOfferRequest): Promise<E.Either<Failure, GenerateProposedOfferResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.addUpdateGenerateProposedOffer(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    // ==================== READY RECKONER ====================
    apiCallPullReadyReckonerRate: async (params: FilterWithPaginationProposedOfferReadyReckonerRateRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferReadyReckonerRateListResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.pullReadyReckonerRate(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateReadyReckonerRate: async (params: AddUpdateProposedOfferReadyReckonerRateRequest): Promise<E.Either<Failure, ProposedOfferReadyReckonerRateSaveResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.addUpdateReadyReckonerRate(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallDeleteReadyReckonerRate: async (params: DeleteProposedOfferReadyReckonerRateRequest): Promise<E.Either<Failure, ProposedOfferReadyReckonerRateDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteReadyReckonerRate(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    // ADDITONAL INFO

    apiCallPullAdditionalInformation: async (params: FilterWithPaginationAdditionalInformationRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, AdditionalInformationListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullAdditionalInformation(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateAdditionalInformation: async (params: AddUpdateAdditionalInformationRequest): Promise<E.Either<Failure, AdditionalInformationSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateAdditionalInformation(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

   


}
