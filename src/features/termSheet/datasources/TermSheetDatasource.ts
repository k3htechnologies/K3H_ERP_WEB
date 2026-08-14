import baseClient from '@/core/config/baseClient'
import { TokenExpiredException } from '@/core/config/baseClientexceptions'
import { TermSheetApi } from '@/features/termSheet/api/TermSheetApi'

import type {
    FilterWithPaginationTermSheetRequest,
    DeleteTermSheetRequest,

    AddUpdateTermSheetDisbursedAmountDetailsRequest,
    DeleteTermSheetDisbursedAmountDetailsRequest,

    AddUpdateTermSheetSweepRadioDetailsRequest,
    DeleteTermSheetSweepRadioDetailsRequest,

    AddUpdateTermSheetDirectSellingAgentRequest,
    DeleteTermSheetDirectSellingAgentRequest,

    FinalizeTermSheetDetails,

    TermSheetListResponse,
    TermSheetViewResponse,
    TermSheetSaveResponse,
    TermSheetDeleteResponse,
    TermSheetDisbursedAmountSaveResponse,
    TermSheetSweepRadioSaveResponse,
    TermSheetDirectSellingAgentSaveResponse,
    TermSheetFinalApprovalResponse,
    DeleteTermSheetRepayLedgerRequest,
    AddUpdateTermSheetRepayLedgerRequest,
    TermSheetRepayLedgerSaveResponse

} from '@/features/termSheet/models/TermSheetModel'


export abstract class TermSheetDatasource {

    abstract pullTermSheet(params: FilterWithPaginationTermSheetRequest, signal?: AbortSignal): Promise<TermSheetListResponse>

    abstract pullTermSheetView(params: { ProjectId?: number, TermSheetId?: number }, signal?: AbortSignal): Promise<TermSheetViewResponse>

    abstract addUpdateTermSheet(data: FormData): Promise<TermSheetSaveResponse>

    abstract deleteTermSheet(params: DeleteTermSheetRequest): Promise<TermSheetDeleteResponse>

    abstract addUpdateTermSheetDisbursedAmountDetails(params: AddUpdateTermSheetDisbursedAmountDetailsRequest): Promise<TermSheetDisbursedAmountSaveResponse>

    abstract deleteTermSheetDisbursedAmountDetails(params: DeleteTermSheetDisbursedAmountDetailsRequest): Promise<TermSheetDeleteResponse>

    abstract addUpdateTermSheetSweepRadioDetails(params: AddUpdateTermSheetSweepRadioDetailsRequest): Promise<TermSheetSweepRadioSaveResponse>

    abstract deleteTermSheetSweepRadioDetails(params: DeleteTermSheetSweepRadioDetailsRequest): Promise<TermSheetDeleteResponse>

    abstract addUpdateTermSheetDirectSellingAgent(params: AddUpdateTermSheetDirectSellingAgentRequest): Promise<TermSheetDirectSellingAgentSaveResponse>

    abstract deleteTermSheetDirectSellingAgent(params: DeleteTermSheetDirectSellingAgentRequest): Promise<TermSheetDeleteResponse>

    abstract finalizeTermSheetDetails(params: FinalizeTermSheetDetails): Promise<TermSheetFinalApprovalResponse>
}


export class TermSheetDatasourceImpl implements TermSheetDatasource {

    private get k3hHttpClient() {
        return baseClient
    }

    async pullTermSheet(params: FilterWithPaginationTermSheetRequest, signal?: AbortSignal): Promise<TermSheetListResponse> {

        try {

            const queryParams = new URLSearchParams({
                PageSize: (params.PageSize ?? 10).toString(),
                PageNumber: (params.PageNumber ?? 1).toString(),
                IsCheckPermission: (params.IsCheckPermission ?? true).toString()
            })

            if (params.ApprovalStatus?.trim()) { queryParams.append('ApprovalStatus', params.ApprovalStatus.trim()) }
            if (params.ProjectId) { queryParams.append('ProjectId', params.ProjectId.toString()) }
            if (params.TermSheetId) { queryParams.append('TermSheetId', params.TermSheetId.toString()) }
            if (params.TermSheetDetailsId) { queryParams.append('TermSheetDetailsId', params.TermSheetDetailsId.toString()) }
            if (params.NameOfInstitutionBankNBFC?.trim()) { queryParams.append('NameOfInstitutionBankNBFC', params.NameOfInstitutionBankNBFC.trim()) }
            if (params.ProjectName?.trim()) { queryParams.append('ProjectName', params.ProjectName.trim()) }
            if (params.CompanyName?.trim()) { queryParams.append('CompanyName', params.CompanyName.trim()) }
            if (params.SortBy?.trim()) { queryParams.append('SortBy', params.SortBy.trim()) }
            if (params.ExportType) { queryParams.append('ExportType', params.ExportType) }

            return await this.k3hHttpClient.getRequestWithAuthentication(`${TermSheetApi.PULL}?${queryParams.toString()}`, { signal })

        } catch (error: any) {

            console.error('ERROR: PULL TERM SHEET:', error)

            if (error instanceof TokenExpiredException) {
                return await this.pullTermSheet(params, signal)
            }

            throw error
        }
    }

    async pullTermSheetView(params: { ProjectId?: number, TermSheetId?: number }, signal?: AbortSignal): Promise<TermSheetViewResponse> {

        try {

            const queryParams = new URLSearchParams()

            if (params.ProjectId) { queryParams.append('ProjectId', params.ProjectId.toString()) }
            if (params.TermSheetId) { queryParams.append('TermSheetId', params.TermSheetId.toString()) }

            return await this.k3hHttpClient.getRequestWithAuthentication(`${TermSheetApi.PULL_VIEW}?${queryParams.toString()}`, { signal })


        } catch (error: any) {

            console.error('ERROR: PULL TERM SHEET VIEW:', error)

            if (error instanceof TokenExpiredException) {

                return await this.pullTermSheetView(params, signal)
            }

            throw error
        }
    }

    async addUpdateTermSheet(data: FormData): Promise<TermSheetSaveResponse> {

        try {

            return await this.k3hHttpClient.multipartRequestWithAuthentication(TermSheetApi.ADD_UPDATE, data);

        } catch (error) {

            console.error('Error: Add Update TERM SHEET:', error)

            if (error instanceof TokenExpiredException) {

                return await this.addUpdateTermSheet(data);
            }

            throw error
        }
    }


    async deleteTermSheet(params: DeleteTermSheetRequest): Promise<TermSheetDeleteResponse> {

        try {

            const queryParams = new URLSearchParams()

            queryParams.append('TermSheetId', (params.TermSheetId ?? 0).toString())

            queryParams.append('TermSheetDetailsId', params.TermSheetDetailsId.toString())

            queryParams.append('ProjectId', (params.ProjectId ?? 0).toString())

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${TermSheetApi.DELETE}?${queryParams.toString()}`)


        } catch (error: any) {

            console.error('ERROR: DELETE TERM SHEET:', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteTermSheet(params)
            }

            throw error
        }
    }

    async addUpdateTermSheetDisbursedAmountDetails(params: AddUpdateTermSheetDisbursedAmountDetailsRequest): Promise<TermSheetDisbursedAmountSaveResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(TermSheetApi.ADD_UPDATE_DISBURSED_AMOUNT, params);

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE DISBURSED AMOUNT:', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTermSheetDisbursedAmountDetails(params)
            }

            throw error
        }
    }


    async deleteTermSheetDisbursedAmountDetails(params: DeleteTermSheetDisbursedAmountDetailsRequest): Promise<TermSheetDeleteResponse> {

        try {

            const queryParams = new URLSearchParams({
                TermSheetDisbursedAmountDetailsId: (params.TermSheetDisbursedAmountDetailsId ?? 0).toString(),

                TermSheetId: (params.TermSheetId ?? 0).toString(),

                TermSheetDetailsId: params.TermSheetDetailsId.toString(),

                ProjectId: (params.ProjectId ?? 0).toString()
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${TermSheetApi.DELETE_DISBURSED_AMOUNT}?${queryParams.toString()}`)


        } catch (error: any) {

            console.error('ERROR: DELETE DISBURSED AMOUNT:', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteTermSheetDisbursedAmountDetails(params)
            }

            throw error
        }
    }


    async addUpdateTermSheetSweepRadioDetails(params: AddUpdateTermSheetSweepRadioDetailsRequest): Promise<TermSheetSweepRadioSaveResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(TermSheetApi.ADD_UPDATE_SWEEP_RADIO, params);

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE SWEEP RADIO:', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTermSheetSweepRadioDetails(params)
            }

            throw error
        }
    }

    async deleteTermSheetSweepRadioDetails(params: DeleteTermSheetSweepRadioDetailsRequest): Promise<TermSheetDeleteResponse> {

        try {

            const queryParams = new URLSearchParams({

                TermSheetSweepRadioDetailsId: (params.TermSheetSweepRadioDetailsId ?? 0).toString(),

                TermSheetId: (params.TermSheetId ?? 0).toString(),

                TermSheetDetailsId: params.TermSheetDetailsId.toString(),

                ProjectId: (params.ProjectId ?? 0).toString()
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${TermSheetApi.DELETE_SWEEP_RADIO}?${queryParams.toString()}`)

        } catch (error: any) {

            console.error('ERROR: DELETE SWEEP RADIO:', error)

            if (error instanceof TokenExpiredException) {
                return await this.deleteTermSheetSweepRadioDetails(params)
            }

            throw error
        }
    }

    async addUpdateTermSheetDirectSellingAgent(params: AddUpdateTermSheetDirectSellingAgentRequest): Promise<TermSheetDirectSellingAgentSaveResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(TermSheetApi.ADD_UPDATE_DIRECT_SELLING_AGENT, params);

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE DIRECT SELLING AGENT:', error)

            if (error instanceof TokenExpiredException) {
                return await this.addUpdateTermSheetDirectSellingAgent(params)
            }

            throw error
        }
    }


    async deleteTermSheetDirectSellingAgent(params: DeleteTermSheetDirectSellingAgentRequest): Promise<TermSheetDeleteResponse> {

        try {

            const queryParams = new URLSearchParams({

                TermSheetDirectSellingAgentId: (params.TermSheetDirectSellingAgentId ?? 0).toString(),

                TermSheetId: (params.TermSheetId ?? 0).toString(),

                TermSheetDetailsId: params.TermSheetDetailsId.toString(),

                ProjectId: (params.ProjectId ?? 0).toString()
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${TermSheetApi.DELETE_DIRECT_SELLING_AGENT}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE DIRECT SELLING AGENT:', error)

            if (error instanceof TokenExpiredException) {
                
                return await this.deleteTermSheetDirectSellingAgent(params)
            }

            throw error
        }
    }

    async addUpdateTermSheetRepayLedger(params: AddUpdateTermSheetRepayLedgerRequest): Promise<TermSheetRepayLedgerSaveResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(TermSheetApi.ADD_UPDATE_REPAY_LEDGER, params);

        } catch (error: any) {

            console.error('ERROR: ADD UPDATE REPAY LEDGER:', error)

            if (error instanceof TokenExpiredException) {
                
                return await this.addUpdateTermSheetRepayLedger(params)
            }

            throw error
        }
    }


    async deleteTermSheetRepayLedger(params: DeleteTermSheetRepayLedgerRequest): Promise<TermSheetDeleteResponse> {

        try {

            const queryParams = new URLSearchParams({

                TermSheetRepayLedgerId: (params.TermSheetRepayLedgerId ?? 0).toString(),

                TermSheetId: (params.TermSheetId ?? 0).toString(),

                TermSheetDetailsId: params.TermSheetDetailsId.toString(),

                ProjectId: (params.ProjectId ?? 0).toString()
            })

            return await this.k3hHttpClient.deleteRequestWithAuthentication(`${TermSheetApi.DELETE_REPAY_LEDGER}?${queryParams.toString()}`);

        } catch (error: any) {

            console.error('ERROR: DELETE REPAY LEDGER:', error)

            if (error instanceof TokenExpiredException) {
                
                return await this.deleteTermSheetRepayLedger(params)
            }

            throw error
        }
    }

    async finalizeTermSheetDetails(params: FinalizeTermSheetDetails): Promise<TermSheetFinalApprovalResponse> {

        try {

            return await this.k3hHttpClient.postRequestWithAuthentication(TermSheetApi.FINALIZE_TERM_SHEET, params)

        } catch (error: any) {

            console.error('ERROR: FINALIZE TERM SHEET:', error)

            if (error instanceof TokenExpiredException) {
                return await this.finalizeTermSheetDetails(params)
            }

            throw error
        }
    }
}