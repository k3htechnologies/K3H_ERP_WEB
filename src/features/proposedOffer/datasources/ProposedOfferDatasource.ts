import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ProposedOfferApi } from '@/features/proposedOffer/api/ProposedOfferApi'
import type {

    FilterWithPaginationProposedOfferPdfRequest,
    ProposedOfferPDFResponse,
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
    GenerateProposedOfferResponse,

    //GENERATE PROPOSED PLAN

    AddUpdateGenerateProposedOfferRequest,
    ProposedOfferHardshipDetailsDeleteResponse,
    DeleteProposedOfferHardshipDetailsRequest,
    DeleteProposedOfferShiftingDetailsRequest,
    ProposedOfferShiftingDetailsDeleteResponse,
    DeleteProposedOfferSecurityDepositDetailsRequest,
    ProposedOfferSecurityDepositDetailsDeleteResponse,

    // READY RECKONER
    FilterWithPaginationProposedOfferReadyReckonerRateRequest,
    ProposedOfferReadyReckonerRateListResponse,
    ProposedOfferReadyReckonerRateSaveResponse,


    // ADDITIONAL INFORMATION
    FilterWithPaginationAdditionalInformationRequest,
    AddUpdateAdditionalInformationRequest,
    AdditionalInformationListResponse,
    AdditionalInformationSaveResponse,
    ProposedOfferReadyReckonerRateDeleteResponse,
    DeleteProposedOfferReadyReckonerRateRequest,
    AddUpdateProposedOfferReadyReckonerRateRequest,
    AddUpdateProposedPlanRequest,
    CopyProposedPlanRequest,


} from '@/features/proposedOffer/models/ProposedOfferModel'

//=============================================================
// [ DATASOURCE ]
//=============================================================
export abstract class ProposedOfferDatasource {

    abstract pullProposedOfferPDF(params: FilterWithPaginationProposedOfferPdfRequest, signal?: AbortSignal): Promise<ProposedOfferPDFResponse>

    abstract pullExtraCarpetArea(params: FilterWithPaginationProposedOfferExtraCarpetAreaRequest, signal?: AbortSignal): Promise<ProposedOfferExtraCarpetAreaListResponse>
    abstract addUpdateExtraCarpetArea(data: AddUpdateProposedOfferExtraCarpetAreaRequest): Promise<ProposedOfferExtraCarpetAreaSaveResponse>

    abstract pullHardshipDetails(params: FilterWithPaginationProposedOfferHardshipDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferHardshipDetailsListResponse>
    abstract addUpdateHardshipDetails(data: AddUpdateProposedOfferHardshipDetailsRequest): Promise<ProposedOfferHardshipDetailsSaveResponse>
    abstract deleteHardshipDetails(params: DeleteProposedOfferHardshipDetailsRequest): Promise<ProposedOfferHardshipDetailsDeleteResponse>

    abstract pullTemporaryAccommodationAlternative(params: FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest, signal?: AbortSignal): Promise<ProposedOfferTemporaryAccommodationAlternativeListResponse>
    abstract addUpdateTemporaryAccommodationAlternative(data: AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest): Promise<ProposedOfferTemporaryAccommodationAlternativeSaveResponse>
    abstract deleteTemporaryAccommodationAlternative(params: DeleteProposedOfferTemporaryAccommodationAlternativeRequest): Promise<ProposedOfferTemporaryAccommodationAlternativeDeleteResponse>

    abstract pullShiftingDetails(params: FilterWithPaginationProposedOfferShiftingDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferShiftingDetailsListResponse>
    abstract addUpdateShiftingDetails(data: AddUpdateProposedOfferShiftingDetailsRequest): Promise<ProposedOfferShiftingDetailsSaveResponse>
    abstract deleteShiftingDetails(params: DeleteProposedOfferShiftingDetailsRequest): Promise<ProposedOfferShiftingDetailsDeleteResponse>

    abstract pullSecurityDepositDetails(params: FilterWithPaginationProposedOfferSecurityDepositDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferSecurityDepositDetailsListResponse>
    abstract addUpdateSecurityDepositDetails(data: AddUpdateProposedOfferSecurityDepositDetailsRequest): Promise<ProposedOfferSecurityDepositDetailsSaveResponse>
    abstract deleteSecurityDepositDetails(params: DeleteProposedOfferSecurityDepositDetailsRequest): Promise<ProposedOfferSecurityDepositDetailsDeleteResponse>

    abstract pullLienToSocietyDetails(params: FilterWithPaginationProposedOfferLienToSocietyDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferLienToSocietyDetailsListResponse>
    abstract addUpdateLienToSocietyDetails(data: AddUpdateProposedOfferLienToSocietyDetailsRequest): Promise<ProposedOfferLienToSocietyDetailsSaveResponse>

    abstract pullParkingAllotment(params: FilterWithPaginationProposedOfferParkingAllotmentRequest, signal?: AbortSignal): Promise<ProposedOfferParkingAllotmentListResponse>
    abstract addUpdateParkingAllotment(data: AddUpdateProposedOfferParkingAllotmentRequest): Promise<ProposedOfferParkingAllotmentSaveResponse>

    abstract pullGSTonExistingPlusFreeArea(params: FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest, signal?: AbortSignal): Promise<ProposedOfferGSTonExistingPlusFreeAreaListResponse>
    abstract addUpdateGSTonExistingPlusFreeArea(data: AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest): Promise<ProposedOfferGSTonExistingPlusFreeAreaSaveResponse>

    abstract pullProjectCompletion(params: FilterWithPaginationProposedOfferProjectCompletionRequest, signal?: AbortSignal): Promise<ProposedOfferProjectCompletionListResponse>
    abstract addUpdateProjectCompletion(data: AddUpdateProposedOfferProjectCompletionRequest): Promise<ProposedOfferProjectCompletionSaveResponse>

    abstract pullProposedPlan(params: FilterWithPaginationProposedOfferProposedPlanRequest, signal?: AbortSignal): Promise<ProposedOfferProposedPlanListResponse>
    abstract addUpdateProposedPlan(params: AddUpdateProposedPlanRequest): Promise<ProposedOfferProposedPlanSaveResponse>
    abstract copyProposedPlan(params: CopyProposedPlanRequest): Promise<ProposedOfferProposedPlanSaveResponse>
    abstract addUpdateBuildingProposedPlanRequest(formData: FormData): Promise<ProposedOfferProposedPlanSaveResponse>

    abstract addUpdateGenerateProposedOffer(params: AddUpdateGenerateProposedOfferRequest): Promise<GenerateProposedOfferResponse>;

    abstract pullReadyReckonerRate(params: FilterWithPaginationProposedOfferReadyReckonerRateRequest, signal?: AbortSignal): Promise<ProposedOfferReadyReckonerRateListResponse>;
    abstract addUpdateReadyReckonerRate(params: AddUpdateProposedOfferReadyReckonerRateRequest): Promise<ProposedOfferReadyReckonerRateSaveResponse>;
    abstract deleteReadyReckonerRate(params: DeleteProposedOfferReadyReckonerRateRequest): Promise<ProposedOfferReadyReckonerRateDeleteResponse>;
}
//=============================================================
// [ IMPLEMENTATION – YOUR STYLE ]
//=============================================================
export class ProposedOfferDatasourceImpl implements ProposedOfferDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    //==================== EXTRA CARPET ====================

    async pullProposedOfferPDF(params: FilterWithPaginationProposedOfferPdfRequest, signal?: AbortSignal): Promise<ProposedOfferPDFResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_PROPOSED_OFFER_PDF}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {

            console.error('ERROR: PULL PROPOSED OFFER PDF :', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullProposedOfferPDF(params);
            }

            throw error
        }
    }


    //==================== EXTRA CARPET ====================

    async pullExtraCarpetArea(params: FilterWithPaginationProposedOfferExtraCarpetAreaRequest, signal?: AbortSignal): Promise<ProposedOfferExtraCarpetAreaListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_EXTRA_CARPET_AREA}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL EXTRA CARPET AREA:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullExtraCarpetArea(params);
            }

            throw error
        }
    }

    async addUpdateExtraCarpetArea(params: AddUpdateProposedOfferExtraCarpetAreaRequest): Promise<ProposedOfferExtraCarpetAreaSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_EXTRA_CARPET_AREA,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update EXTRA CARPET AREA :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateExtraCarpetArea(params);
            }
            throw error
        }
    }

    //==================== CORPUS ====================
    async pullHardshipDetails(params: FilterWithPaginationProposedOfferHardshipDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferHardshipDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams()

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_HARSHIP_DETAILS}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL CORPUS DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullHardshipDetails(params);
            }
            throw error
        }
    }

    async addUpdateHardshipDetails(params: AddUpdateProposedOfferHardshipDetailsRequest): Promise<ProposedOfferHardshipDetailsSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_HARSHIP_DETAILS,
                params

            )

            return response
        } catch (error) {
            console.error('Error: Add Update EXTRA CARPET AREA :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateHardshipDetails(params);
            }
            throw error
        }
    }

    async deleteHardshipDetails(params: DeleteProposedOfferHardshipDetailsRequest): Promise<ProposedOfferHardshipDetailsDeleteResponse> {

        try {
            const queryParams = new URLSearchParams()
            queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProposedOfferApi.DELETE_HARSHIP_DETAILS}?${queryParams.toString()}`
            )
        } catch (error) {

            console.error('ERROR: DELETE CORPUS DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteHardshipDetails(params)
            }

            throw error
        }
    }

    //==================== RENT ====================
    async pullTemporaryAccommodationAlternative(params: FilterWithPaginationProposedOfferTemporaryAccommodationAlternativeRequest, signal?: AbortSignal): Promise<ProposedOfferTemporaryAccommodationAlternativeListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_TEMPORARY_ACCOMMODATION_ALTERNATIVE}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {

            console.error('ERROR: PULL RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullTemporaryAccommodationAlternative(params, signal)
            }

            throw error
        }
    }

    async addUpdateTemporaryAccommodationAlternative(params: AddUpdateProposedOfferTemporaryAccommodationAlternativeRequest): Promise<ProposedOfferTemporaryAccommodationAlternativeSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_TEMPORARY_ACCOMMODATION_ALTERNATIVE,
                params
            )
        } catch (error) {

            console.error('ERROR: ADD UPDATE RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTemporaryAccommodationAlternative(params)
            }

            throw error
        }
    }

    async deleteTemporaryAccommodationAlternative(params: DeleteProposedOfferTemporaryAccommodationAlternativeRequest): Promise<ProposedOfferTemporaryAccommodationAlternativeDeleteResponse> {

        try {
            const queryParams = new URLSearchParams()
            queryParams.append('ProposedOfferTemporaryAccommodationAlternativeDetailsId', params.ProposedOfferTemporaryAccommodationAlternativeDetailsId.toString())
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.Uniquekey) queryParams.append('Uniquekey', params.Uniquekey)

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProposedOfferApi.DELETE_TEMPORARY_ACCOMMODATION_ALTERNATIVE}?${queryParams.toString()}`
            )
        } catch (error) {

            console.error('ERROR: DELETE RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteTemporaryAccommodationAlternative(params)
            }

            throw error
        }
    }

    //==================== SHIFTING ====================
    async pullShiftingDetails(params: FilterWithPaginationProposedOfferShiftingDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferShiftingDetailsListResponse> {
        try {

            const queryParams = new URLSearchParams()

            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_SHIFTING_DETAILS}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {

            console.error('ERROR: PULL SHIFTING DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullShiftingDetails(params, signal)
            }

            throw error
        }
    }

    async addUpdateShiftingDetails(params: AddUpdateProposedOfferShiftingDetailsRequest): Promise<ProposedOfferShiftingDetailsSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_SHIFTING_DETAILS,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE SHIFTING DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateShiftingDetails(params)
            }

            throw error
        }
    }

    async deleteShiftingDetails(params: DeleteProposedOfferShiftingDetailsRequest): Promise<ProposedOfferShiftingDetailsDeleteResponse> {

        try {
            const queryParams = new URLSearchParams()
            queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProposedOfferApi.DELETE_SHIFTING_DETAILS}?${queryParams.toString()}`
            )
        } catch (error) {

            console.error('ERROR: DELETE SHIFTING DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteShiftingDetails(params)
            }

            throw error
        }
    }

    //==================== SECURITY DEPOSIT ====================
    async pullSecurityDepositDetails(params: FilterWithPaginationProposedOfferSecurityDepositDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferSecurityDepositDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_SECURITY_DEPOSIT_DETAILS}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL SECURITY DEPOSIT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullSecurityDepositDetails(params, signal)
            }

            throw error
        }
    }

    async addUpdateSecurityDepositDetails(params: AddUpdateProposedOfferSecurityDepositDetailsRequest): Promise<ProposedOfferSecurityDepositDetailsSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_SECURITY_DEPOSIT_DETAILS,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE SECURITY DEPOSIT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateSecurityDepositDetails(params)
            }

            throw error
        }
    }

    async deleteSecurityDepositDetails(params: DeleteProposedOfferSecurityDepositDetailsRequest): Promise<ProposedOfferSecurityDepositDetailsDeleteResponse> {

        try {
            const queryParams = new URLSearchParams()
            queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProposedOfferApi.DELETE_SECURITY_DEPOSIT_DETAILS}?${queryParams.toString()}`
            )
        } catch (error) {

            console.error('ERROR: DELETE SECURITY DEPOSIT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteSecurityDepositDetails(params)
            }

            throw error
        }
    }
    //==================== LIEN TO SOCIETY ====================
    async pullLienToSocietyDetails(params: FilterWithPaginationProposedOfferLienToSocietyDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferLienToSocietyDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_LIEN_TO_SOCIETY_DETAILS}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL LIEN TO SOCIETY DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullLienToSocietyDetails(params, signal)
            }

            throw error
        }
    }

    async addUpdateLienToSocietyDetails(params: AddUpdateProposedOfferLienToSocietyDetailsRequest): Promise<ProposedOfferLienToSocietyDetailsSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_LIEN_TO_SOCIETY_DETAILS,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE LIEN TO SOCIETY DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateLienToSocietyDetails(params)
            }

            throw error
        }
    }

    //==================== PARKING ALLOTMENT ====================
    async pullParkingAllotment(params: FilterWithPaginationProposedOfferParkingAllotmentRequest, signal?: AbortSignal): Promise<ProposedOfferParkingAllotmentListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_PARKING_ALLOTMENT}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL PARKING ALLOTMENT:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullParkingAllotment(params, signal)
            }

            throw error
        }
    }

    async addUpdateParkingAllotment(params: AddUpdateProposedOfferParkingAllotmentRequest): Promise<ProposedOfferParkingAllotmentSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_PARKING_ALLOTMENT,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE PARKING ALLOTMENT:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateParkingAllotment(params)
            }

            throw error
        }
    }

    //==================== GST ON EXISTING + FREE AREA ====================
    async pullGSTonExistingPlusFreeArea(params: FilterWithPaginationProposedOfferGSTonExistingPlusFreeAreaRequest, signal?: AbortSignal): Promise<ProposedOfferGSTonExistingPlusFreeAreaListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_GST_ON_EXISTING_PLUS_FREE_AREA}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL GST ON EXISTING PLUS FREE AREA:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullGSTonExistingPlusFreeArea(params, signal)
            }

            throw error
        }
    }

    async addUpdateGSTonExistingPlusFreeArea(params: AddUpdateProposedOfferGSTonExistingPlusFreeAreaRequest): Promise<ProposedOfferGSTonExistingPlusFreeAreaSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_GST_ON_EXISTING_PLUS_FREE_AREA,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE GST ON EXISTING PLUS FREE AREA:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateGSTonExistingPlusFreeArea(params)
            }

            throw error
        }
    }

    //==================== PROJECT COMPLETION ====================
    async pullProjectCompletion(params: FilterWithPaginationProposedOfferProjectCompletionRequest, signal?: AbortSignal): Promise<ProposedOfferProjectCompletionListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_PROJECT_COMPLETION}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL PROJECT COMPLETION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullProjectCompletion(params, signal)
            }

            throw error
        }
    }

    async addUpdateProjectCompletion(params: AddUpdateProposedOfferProjectCompletionRequest): Promise<ProposedOfferProjectCompletionSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_PROJECT_COMPLETION,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE PROJECT COMPLETION:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProjectCompletion(params)
            }

            throw error
        }
    }

    //==================== PROPOSED PLAN ====================
    async pullProposedPlan(params: FilterWithPaginationProposedOfferProposedPlanRequest, signal?: AbortSignal): Promise<ProposedOfferProposedPlanListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_PROPOSED_PLAN}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL PROPOSED PLAN:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullProposedPlan(params, signal)
            }

            throw error
        }
    }

    async addUpdateProposedPlan(params: AddUpdateProposedPlanRequest): Promise<ProposedOfferProposedPlanSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_PROPOSED_PLAN,
                params
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE PROPOSED PLAN:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProposedPlan(params)
            }

            throw error
        }
    }
    async copyProposedPlan(params: CopyProposedPlanRequest): Promise<ProposedOfferProposedPlanSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.COPY_PROPOSED_PLAN,
                params
            )
        } catch (error) {
            console.error('ERROR: COPY PROPOSED PLAN:', error)

            if (error instanceof TokenExpiredException) {

                return await this.copyProposedPlan(params)
            }

            throw error
        }
    }

    async addUpdateBuildingProposedPlanRequest(formData: FormData): Promise<ProposedOfferProposedPlanSaveResponse> {
        try {
            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_BUILDING_PROPOSED_PLAN,
                formData
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE BUILDING PROPOSED PLAN:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateBuildingProposedPlanRequest(formData)
            }

            throw error
        }
    }


    //====================GENERATE PROPOSED PLAN ====================

    async addUpdateGenerateProposedOffer(params: AddUpdateGenerateProposedOfferRequest): Promise<GenerateProposedOfferResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_GENERATE_PROPOSED_PLAN,
                params

            )

            return response
        } catch (error) {
            console.error('Error: GENERATE PROPOSED OFFER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateGenerateProposedOffer(params);
            }
            throw error
        }
    }

    //====================READY RECKONER ====================
    async pullReadyReckonerRate(params: FilterWithPaginationProposedOfferReadyReckonerRateRequest, signal?: AbortSignal): Promise<ProposedOfferReadyReckonerRateListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_READY_RECKONER_Rate}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL READY RECKONER RATE:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullReadyReckonerRate(params);
            }

            throw error
        }
    }

    async addUpdateReadyReckonerRate(params: AddUpdateProposedOfferReadyReckonerRateRequest): Promise<ProposedOfferReadyReckonerRateSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_READY_RECKONER_Rate,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update READY RECKONER RATE :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateReadyReckonerRate(params);
            }
            throw error
        }
    }

    async deleteReadyReckonerRate(params: DeleteProposedOfferReadyReckonerRateRequest): Promise<ProposedOfferReadyReckonerRateDeleteResponse> {

        try {
            const queryParams = new URLSearchParams()
            queryParams.append('ProposedOfferReadyReckonerRateDetailsId', params.ProposedOfferReadyReckonerRateDetailsId.toString())
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.Uniquekey) queryParams.append('Uniquekey', params.Uniquekey)

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProposedOfferApi.DELETE_READY_RECKONER_Rate}?${queryParams.toString()}`
            )
        } catch (error) {

            console.error('ERROR: DELETE RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteReadyReckonerRate(params)
            }

            throw error
        }
    }
    // ADDITONAL INFORMATION
    async pullAdditionalInformation(params: FilterWithPaginationAdditionalInformationRequest, signal?: AbortSignal): Promise<AdditionalInformationListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_ADDITIONAL_INFORMATION}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL ADDITIONAL INFORMATION:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullAdditionalInformation(params);
            }

            throw error
        }
    }

    async addUpdateAdditionalInformation(params: AddUpdateAdditionalInformationRequest): Promise<AdditionalInformationSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_ADDITIONAL_INFORMATION,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update ADDITIONAL INFORMATION :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateAdditionalInformation(params);
            }
            throw error
        }
    }




}
