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
    FilterWithPaginationProposedOfferCorpusDetailsRequest,
    AddUpdateProposedOfferCorpusDetailsRequest,
    ProposedOfferCorpusDetailsListResponse,
    ProposedOfferCorpusDetailsSaveResponse,

    // RENT
    FilterWithPaginationProposedOfferRentDetailsRequest,
    AddUpdateProposedOfferRentDetailsRequest,
    DeleteProposedOfferRentDetailsRequest,
    ProposedOfferRentDetailsListResponse,
    ProposedOfferRentDetailsSaveResponse,
    ProposedOfferRentDetailsDeleteResponse,

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
    DeleteProposedOfferCorpusDetailsRequest,
    ProposedOfferCorpusDetailsDeleteResponse,
    DeleteProposedOfferShiftingDetailsRequest,
    ProposedOfferShiftingDetailsDeleteResponse,
    DeleteProposedOfferSecurityDepositDetailsRequest,
    ProposedOfferSecurityDepositDetailsDeleteResponse,

    // READY RECKONER
    FilterWithPaginationReadyReckonerRequest,
    ReadyReckonerListResponse,
    ReadyReckonerSaveResponse,
    AddUpdateReadyReckonerRequest,

    // CARPET AREA
    FilterWithPaginationCarpetAreaRequest,
    CarpetAreaListResponse,
    AddUpdateCarpetAreaRequest,
    CarpetAreaSaveResponse,

    // ADDITIONAL INFO
    FilterWithPaginationAdditionalInformationRequest,
    AdditionalInformationListResponse,
    AddUpdateAdditionalInformationRequest,
    AdditionalInformationSaveResponse,
    FilterWithPaginationPlotAreaRequest,
    PlotAreaListResponse,
    AddUpdatePlotAreaRequest,
    PlotAreaSaveResponse,
    AddUpdateProposedPlanRequest,

} from '@/features/proposedOffer/models/ProposedOfferModel'

//=============================================================
// [ DATASOURCE INSTANCE ]
//=============================================================
const proposedOfferDatasource = new ProposedOfferDatasourceImpl()

//=============================================================
// [ SERVICE ]
//=============================================================
export const proposedOfferService = {

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
    apiCallPullCorpusDetails: async (params: FilterWithPaginationProposedOfferCorpusDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferCorpusDetailsListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullCorpusDetails(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateCorpusDetails: async (params: AddUpdateProposedOfferCorpusDetailsRequest): Promise<E.Either<Failure, ProposedOfferCorpusDetailsSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateCorpusDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteCorpusDetails: async (params: DeleteProposedOfferCorpusDetailsRequest): Promise<E.Either<Failure, ProposedOfferCorpusDetailsDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteCorpusDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    //==================== RENT ====================
    apiCallPullRentDetails: async (params: FilterWithPaginationProposedOfferRentDetailsRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ProposedOfferRentDetailsListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullRentDetails(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateRentDetails: async (params: AddUpdateProposedOfferRentDetailsRequest): Promise<E.Either<Failure, ProposedOfferRentDetailsSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateRentDetails(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallDeleteRentDetails: async (params: DeleteProposedOfferRentDetailsRequest): Promise<E.Either<Failure, ProposedOfferRentDetailsDeleteResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.deleteRentDetails(params))
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

    apiCallAddUpdateProposedPlan: async (params: AddUpdateProposedPlanRequest): Promise<E.Either<Failure, ProposedOfferProposedPlanSaveResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.addUpdateProposedPlan(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateBuildingProposedPlanRequest: async (formData: FormData): Promise<E.Either<Failure, ProposedOfferProposedPlanSaveResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.addUpdateBuildingProposedPlanRequest(formData))

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
    apiCallPullReadyReckoner: async (params: FilterWithPaginationReadyReckonerRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, ReadyReckonerListResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.pullReadyReckoner(params, options?.signal))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    apiCallAddUpdateReadyReckoner: async (params: AddUpdateReadyReckonerRequest): Promise<E.Either<Failure, ReadyReckonerSaveResponse>> => {
        try {

            return E.right(await proposedOfferDatasource.addUpdateReadyReckoner(params))

        } catch (error: any) {

            return E.left({ message: error.message, code: error.code })

        }
    },

    // CARPET AREA 

    apiCallPullCarpetArea: async (params: FilterWithPaginationCarpetAreaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, CarpetAreaListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullCarpetArea(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdateCarpetArea: async (params: AddUpdateCarpetAreaRequest): Promise<E.Either<Failure, CarpetAreaSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdateCarpetArea(params))
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

    // Plot Area

    apiCallPullPlotArea: async (params: FilterWithPaginationPlotAreaRequest, options?: { signal?: AbortSignal }): Promise<E.Either<Failure, PlotAreaListResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.pullPlotArea(params, options?.signal))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },

    apiCallAddUpdatePlotArea: async (params: AddUpdatePlotAreaRequest): Promise<E.Either<Failure, PlotAreaSaveResponse>> => {
        try {
            return E.right(await proposedOfferDatasource.addUpdatePlotArea(params))
        } catch (error: any) {
            return E.left({ message: error.message, code: error.code })
        }
    },


}
