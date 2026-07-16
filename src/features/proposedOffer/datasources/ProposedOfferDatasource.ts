import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { ProposedOfferApi } from '@/features/proposedOffer/api/ProposedOfferApi'
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
    FilterWithPaginationReadyReckonerRequest,
    ReadyReckonerListResponse,
    ReadyReckonerSaveResponse,
    AddUpdateReadyReckonerRequest,

    // CARPET AREA
    FilterWithPaginationCarpetAreaRequest,
    AddUpdateCarpetAreaRequest,
    CarpetAreaListResponse,
    CarpetAreaSaveResponse,

    // ADDITIONAL INFORMATION
    FilterWithPaginationAdditionalInformationRequest,
    AddUpdateAdditionalInformationRequest,
    AdditionalInformationListResponse,
    AdditionalInformationSaveResponse,

    // PLOT AREA
    FilterWithPaginationPlotAreaRequest,
    PlotAreaListResponse,
    AddUpdatePlotAreaRequest,
    PlotAreaSaveResponse,

} from '@/features/proposedOffer/models/ProposedOfferModel'

//=============================================================
// [ DATASOURCE ]
//=============================================================
export abstract class ProposedOfferDatasource {

    abstract pullExtraCarpetArea(params: FilterWithPaginationProposedOfferExtraCarpetAreaRequest, signal?: AbortSignal): Promise<ProposedOfferExtraCarpetAreaListResponse>
    abstract addUpdateExtraCarpetArea(data: AddUpdateProposedOfferExtraCarpetAreaRequest): Promise<ProposedOfferExtraCarpetAreaSaveResponse>

    abstract pullHardshipDetails(params: FilterWithPaginationProposedOfferHardshipDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferHardshipDetailsListResponse>
    abstract addUpdateHardshipDetails(data: AddUpdateProposedOfferHardshipDetailsRequest): Promise<ProposedOfferHardshipDetailsSaveResponse>
    abstract deleteHardshipDetails(params: DeleteProposedOfferHardshipDetailsRequest): Promise<ProposedOfferHardshipDetailsDeleteResponse>

    abstract pullRentDetails(params: FilterWithPaginationProposedOfferRentDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferRentDetailsListResponse>
    abstract addUpdateRentDetails(data: AddUpdateProposedOfferRentDetailsRequest): Promise<ProposedOfferRentDetailsSaveResponse>
    abstract deleteRentDetails(params: DeleteProposedOfferRentDetailsRequest): Promise<ProposedOfferRentDetailsDeleteResponse>

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
    abstract addUpdateProposedPlan(formData: FormData): Promise<ProposedOfferProposedPlanSaveResponse>

    abstract addUpdateGenerateProposedOffer(params: AddUpdateGenerateProposedOfferRequest): Promise<GenerateProposedOfferResponse>
}
//=============================================================
// [ IMPLEMENTATION – YOUR STYLE ]
//=============================================================
export class ProposedOfferDatasourceImpl implements ProposedOfferDatasource {

    private get k3hHttpClient() {
        return baseClient
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
    async pullRentDetails(params: FilterWithPaginationProposedOfferRentDetailsRequest, signal?: AbortSignal): Promise<ProposedOfferRentDetailsListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_RENT_DETAILS}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {

            console.error('ERROR: PULL RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullRentDetails(params, signal)
            }

            throw error
        }
    }

    async addUpdateRentDetails(params: AddUpdateProposedOfferRentDetailsRequest): Promise<ProposedOfferRentDetailsSaveResponse> {
        try {
            return await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_RENT_DETAILS,
                params
            )
        } catch (error) {

            console.error('ERROR: ADD UPDATE RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateRentDetails(params)
            }

            throw error
        }
    }

    async deleteRentDetails(params: DeleteProposedOfferRentDetailsRequest): Promise<ProposedOfferRentDetailsDeleteResponse> {

        try {
            const queryParams = new URLSearchParams()
            queryParams.append('ProposedOfferRentDetailsId', params.ProposedOfferRentDetailsId.toString())
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.Uniquekey) queryParams.append('Uniquekey', params.Uniquekey)

            return await this.k3hHttpClient.deleteRequestWithAuthentication(
                `${ProposedOfferApi.DELETE_RENT_DETAILS}?${queryParams.toString()}`
            )
        } catch (error) {

            console.error('ERROR: DELETE RENT DETAILS:', error)

            if (error instanceof TokenExpiredException) {

                return await this.deleteRentDetails(params)
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

    async addUpdateProposedPlan(formData: FormData): Promise<ProposedOfferProposedPlanSaveResponse> {
        try {
            return await this.k3hHttpClient.multipartRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_PROPOSED_PLAN,
                formData
            )
        } catch (error) {
            console.error('ERROR: ADD UPDATE PROPOSED PLAN:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateProposedPlan(formData)
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
    async pullReadyReckoner(params: FilterWithPaginationReadyReckonerRequest, signal?: AbortSignal): Promise<ReadyReckonerListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_READY_RECKONER}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL READY RECKONER:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullReadyReckoner(params);
            }

            throw error
        }
    }

    async addUpdateReadyReckoner(params: AddUpdateReadyReckonerRequest): Promise<ReadyReckonerSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_READY_RECKONER,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update READY RECKONER :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateReadyReckoner(params);
            }
            throw error
        }
    }

    //====================CARPET AREA ====================
    async pullCarpetArea(params: FilterWithPaginationCarpetAreaRequest, signal?: AbortSignal): Promise<CarpetAreaListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_CARPET_AREA}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL CARPET AREA:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullCarpetArea(params);
            }

            throw error
        }
    }

    async addUpdateCarpetArea(params: AddUpdateCarpetAreaRequest): Promise<CarpetAreaSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_CARPET_AREA,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update CARPET AREA :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateCarpetArea(params);
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

    // PLOT AREA
    async pullPlotArea(params: FilterWithPaginationPlotAreaRequest, signal?: AbortSignal): Promise<PlotAreaListResponse> {
        try {
            const queryParams = new URLSearchParams()
            if (params.ProjectId) queryParams.append('ProjectId', params.ProjectId.toString())
            if (params.BuildingId) queryParams.append('BuildingId', params.BuildingId.toString())
            if (params.ExportType) queryParams.append('ExportType', params.ExportType)

            return await this.k3hHttpClient.getRequestWithAuthentication(
                `${ProposedOfferApi.PULL_PLOT_AREA}?${queryParams.toString()}`,
                { signal }
            )
        } catch (error) {
            console.error('ERROR: PULL PLOT AREA:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullPlotArea(params);
            }

            throw error
        }
    }

    async addUpdatePlotArea(params: AddUpdatePlotAreaRequest): Promise<PlotAreaSaveResponse> {

        try {

            const response = await this.k3hHttpClient.postRequestWithAuthentication(
                ProposedOfferApi.ADD_UPDATE_PLOT_AREA,
                params
            )

            return response
        } catch (error) {
            console.error('Error: Add Update PLOT AREA :', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdatePlotArea(params);
            }
            throw error
        }
    }


}
